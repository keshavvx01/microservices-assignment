import "dotenv/config";
import express from "express";
import { connect } from "nats";

const app = express();

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "notification-service",
    status: "healthy",
  });
});

const start = async () => {
  const nc = await connect({
    servers: process.env.NATS_URL ?? "nats://localhost:4222",
    name: "notification-service",
  });

  const js = nc.jetstream();

  const jsm = await nc.jetstreamManager();

  let consumer;

  try {
    consumer = await jsm.consumers.info("USER_EVENTS", "notification-service");
  } catch {
    consumer = await jsm.consumers.add("USER_EVENTS", {
      durable_name: "notification-service",
      ack_policy: "explicit",
      filter_subject: "user.created",
    });
  }

  console.log("Notification Service connected to NATS JetStream");

  const consumerHandle = await js.consumers.get(
    "USER_EVENTS",
    "notification-service",
  );

  const messages = await consumerHandle.consume();

  (async () => {
    for await (const message of messages) {
      try {
        const event = JSON.parse(
          new TextDecoder().decode(message.data),
        );

        console.log("Notification event received:", event);

        console.log(
          `Sending welcome notification to ${event.data.email}`,
        );

        message.ack();
      } catch (error) {
        console.error("Failed to process notification:", error);
      }
    }
  })();

  const port = Number(process.env.PORT ?? 3002);

  app.listen(port, () => {
    console.log(`Notification Service running on port ${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start Notification Service:", error);
  process.exit(1);
});
