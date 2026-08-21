import Fastify from "fastify";
import cors from "@fastify/cors";

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

  return app;
}
