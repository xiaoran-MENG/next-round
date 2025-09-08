// db.ts
import { env } from '@/data/env/server'
import * as schema from '../drizzle/schema'

// 只判断是否有 serverless 运行时 URL（pooled/HTTP）
const useHttp = !!env.DATABASE_URL_HTTP

let db:
  | ReturnType<typeof import('drizzle-orm/neon-http').drizzle>
  | ReturnType<typeof import('drizzle-orm/node-postgres').drizzle>;

if (useHttp) {
  // Vercel/Neon（serverless 驱动）
  const { neon } = await import('@neondatabase/serverless')
  const { drizzle } = await import('drizzle-orm/neon-http')
  const sql = neon(env.DATABASE_URL_HTTP!)
  db = drizzle(sql, { schema })
} else {
  // 本地 Docker（pg 连接池）
  const { Pool } = await import('pg')
  const { drizzle } = await import('drizzle-orm/node-postgres')
  const pool = new Pool({ connectionString: env.DATABASE_URL })
  db = drizzle(pool, { schema })
}

export { db }
