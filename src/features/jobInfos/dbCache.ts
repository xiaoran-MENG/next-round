
import { globalTag, idTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function jobInfoGlobalTag() {
  return globalTag("jobInfos")
}

export function jobInfoIdTag(id: string) {
  return idTag("jobInfos", id)
}

export function jobInfoUserTag(userId: string) {
  return idTag("jobInfos", userId)
}

export function revalidateJobInfoCache({ id, userId }: { id: string, userId: string }) {
  revalidateTag(jobInfoGlobalTag())
  revalidateTag(jobInfoIdTag(id))
  revalidateTag(jobInfoUserTag(userId))
}
