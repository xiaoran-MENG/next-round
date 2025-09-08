'use server'

import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { userIdTag } from "./dbCache"

export async function getUser(id: string) {
  'use cache'
  cacheTag(userIdTag(id))

  return await db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  })
}