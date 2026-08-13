import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().min(1),

  NATS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);