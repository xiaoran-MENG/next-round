'use server'

import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { userIdTag } from "./dbCache"

export async function getUser(id: string) {
  'use cache'
  cacheTag(userIdTag(id))

  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  })

  if (user) return user

  // 👇 默认用户（兜底）
  return {
    id: "default-id",              // 保证不会和 Clerk ID 冲突
    email: "default@example.com",  // 随便定义一个默认邮箱
    name: "Default User",
    imageUrl: "/default-avatar.png", // 你项目里的占位图路径
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies typeof UserTable.$inferSelect
}