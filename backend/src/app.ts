import Fastify from "fastify";
import cors from "@fastify/cors";
import { db } from "./config/database.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  });

  app.get("/api/health", async () => {
    return {
      status: "ok",
      service: "form-builder-api",
    };
  });

  app.get("/api/health/db", async () => {
    await db.query("SELECT 1");

    return {
      status: "ok",
      database: "connected",
    };
  });

  return app;
}
