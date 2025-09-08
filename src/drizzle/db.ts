// db.ts
import { env } from "@/data/env/server";
import * as schema from "../drizzle/schema";

// 只导入“类型”，不会把 node pg 打进 Edge 包
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

// 带上 schema 的数据库类型（联合），保证 db.query 有表名补全
export type DB = NeonHttpDatabase<typeof schema> | NodePgDatabase<typeof schema>;

const useHttp = !!env.DATABASE_URL_HTTP;

let db: DB;

if (useHttp) {
  // Vercel/Neon（serverless 驱动）
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const sql = neon(env.DATABASE_URL_HTTP!);
  db = drizzle(sql, { schema });
} else {
  // 本地 Docker（pg 连接池）
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { db };
