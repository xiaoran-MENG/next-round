
import { globalTag, idTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function userGlobalTag() {
  return globalTag("users")
}

export function userIdTag(id: string) {
  return idTag("users", id)
}

export function revalidateUserCache(id: string) {
  revalidateTag(userGlobalTag())
  revalidateTag(userIdTag(id))
}
