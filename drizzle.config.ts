// drizzle.config.ts
import { env } from "@/data/env/server";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // 使用专门的“迁移用”连接串（非池化 / TCP）
    // 映射优先级：DATABASE_URL_UNPOOLED → POSTGRES_URL_NON_POOLING → 本地 DB_*
    url: env.DRIZZLE_MIGRATE_URL ?? "",
  },
});
