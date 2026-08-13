import express from "express";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "user-service",
    status: "healthy",
  });
});

app.use("/users", userRoutes);

export default app;