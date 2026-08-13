import "dotenv/config";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "api-gateway",
    status: "healthy",
  });
});

app.use(
  "/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL ?? "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: (path) => `/users${path}`,
  }),
);

const port = Number(process.env.PORT ?? 3003);

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
