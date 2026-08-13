import app from "./app.js";
import { env } from "./config/env.js";
import {
  connectToNats,
  startOutboxWorker,
} from "./events/publisher.js";

const startServer = async () => {
  await connectToNats();

  startOutboxWorker();

  const server = app.listen(env.PORT, () => {
    console.log(`User Service running on port ${env.PORT}`);
  });

  const shutdown = () => {
    console.log("Shutting down User Service...");

    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer().catch((error) => {
  console.error("Failed to start User Service:", error);
  process.exit(1);
});
