// server.ts
import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  server: {
    // 你的 DB / API keys
    DB_PASSWORD: z.string().optional(),
    DB_HOST: z.string().optional(),
    DB_PORT: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_NAME: z.string().optional(),

    DATABASE_URL_HTTP: z.string().url().optional(),
    DATABASE_URL_UNPOOLED: z.string().url().optional(),
    POSTGRES_URL: z.string().url().optional(),
    POSTGRES_URL_NON_POOLING: z.string().url().optional(),

    ARCJET_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    HUME_API_KEY: z.string().min(1),
    HUME_SECRET_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),

    // 🔽 Stack 的私钥（不能暴露客户端）
    STACK_SECRET_SERVER_KEY: z.string().min(1),
  },

  createFinalSchema: (server) =>
    z.object(server).transform((val) => {
      const {
        DB_HOST,
        DB_NAME,
        DB_PASSWORD,
        DB_PORT,
        DB_USER,
        DATABASE_URL_HTTP,
        DATABASE_URL_UNPOOLED,
        POSTGRES_URL,
        POSTGRES_URL_NON_POOLING,
        ...rest
      } = val;

      const LOCAL_URL =
        DB_HOST && DB_NAME && DB_PASSWORD && DB_PORT && DB_USER
          ? `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
          : undefined;

      const RUNTIME_URL_HTTP =
        DATABASE_URL_HTTP ?? POSTGRES_URL ?? LOCAL_URL;

      const DRIZZLE_MIGRATE_URL =
        DATABASE_URL_UNPOOLED ?? POSTGRES_URL_NON_POOLING ?? LOCAL_URL;

      return {
        ...rest,
        DATABASE_URL: LOCAL_URL ?? POSTGRES_URL ?? "",
        DATABASE_URL_HTTP: RUNTIME_URL_HTTP,
        DRIZZLE_MIGRATE_URL,
      };
    }),

  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});
