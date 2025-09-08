import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { userIdTag } from "@/features/users/dbCache";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, redirectToSignIn } = await auth()

  if (!userId) {
    return {
      userId: null,
      redirectToSignIn,
      user: {
        id: "default-id",
        email: "guest@example.com",
        name: "Guest",
        imageUrl: "/guest.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies typeof UserTable.$inferSelect,
    }
  }

  return {
    userId,
    redirectToSignIn,
    user: allData ? await getUser(userId) : undefined,
  }
}

async function getUser(id: string) {
    'use cache'
    cacheTag(userIdTag(id))
    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, id),
    })
}