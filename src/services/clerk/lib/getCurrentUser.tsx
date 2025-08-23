import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { userIdTag } from "@/features/users/dbCache";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function getCurrentUser({ allData = false } = {}) {
    const { userId, redirectToSignIn } = await auth()
    const result = {
        userId,
        redirectToSignIn,
        user: allData && userId != null ? await getUser(userId) : undefined,
    }
    return result
}

async function getUser(id: string) {
    'use cache'
    cacheTag(userIdTag(id))
    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, id),
    })
}