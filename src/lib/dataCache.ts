type CacheTag = "users" | "jobInfos" | "interviews" | "questions"

export function globalTag(tag: CacheTag) {
  return `global:${tag}` as const
}

export function userTag(tag: CacheTag, userId: string) {
  return `user:${userId}:${tag}` as const
}

export function jobInfoTag(tag: CacheTag, jobInfoId: string) {
  return `jobInfo:${jobInfoId}:${tag}` as const
}

export function idTag(tag: CacheTag, id: string) {
  return `id:${id}:${tag}` as const
}
