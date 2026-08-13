import {
  connect,
  type JetStreamClient,
  type NatsConnection,
} from "nats";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const STREAM_NAME = "USER_EVENTS";
const SUBJECT = "user.created";

let connection: NatsConnection;
let jetstream: JetStreamClient;

export const connectToNats = async () => {
  connection = await connect({
    servers: env.NATS_URL,
    name: "user-service",
  });

  const jsm = await connection.jetstreamManager();

  try {
    await jsm.streams.info(STREAM_NAME);
  } catch {
    await jsm.streams.add({
      name: STREAM_NAME,
      subjects: [SUBJECT],
    });
  }

  jetstream = connection.jetstream();

  console.log("Connected to NATS JetStream");
};

export const processOutbox = async () => {
  if (!jetstream) {
    throw new Error("NATS_NOT_CONNECTED");
  }

  const events = await prisma.outboxEvent.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 10,
  });

  for (const event of events) {
    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({
          eventId: event.id,
          eventType: event.eventType,
          timestamp: event.createdAt.toISOString(),
          data: event.payload,
        }),
      );

      await jetstream.publish(SUBJECT, payload, {
        msgID: event.id,
      });

      await prisma.outboxEvent.update({
        where: {
          id: event.id,
        },
        data: {
          status: "PUBLISHED",
          processedAt: new Date(),
        },
      });

      console.log(`Published outbox event: ${event.id}`);
    } catch (error) {
      await prisma.outboxEvent.update({
        where: {
          id: event.id,
        },
        data: {
          attempts: {
            increment: 1,
          },
          status: "FAILED",
        },
      });

      console.error(`Failed to publish event ${event.id}:`, error);
    }
  }
};

export const startOutboxWorker = () => {
  setInterval(async () => {
    try {
      await processOutbox();
    } catch (error) {
      console.error("Outbox worker error:", error);
    }
  }, 2000);
};
