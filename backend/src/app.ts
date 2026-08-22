import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

import { prisma } from "./config/prisma.js";
import { formRoutes } from "./routes/forms.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });

  await app.register(formRoutes);

  app.get("/api/health", async () => {
    return {
      status: "ok",
      service: "form-builder-api",
    };
  });

  app.get("/api/health/db", async () => {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      database: "connected",
    };
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
