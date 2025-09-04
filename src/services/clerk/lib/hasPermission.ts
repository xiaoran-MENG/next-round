import { auth } from "@clerk/nextjs/server"

type Feature = 
    | "unlimited_resume_analysis"
    | "unlimited_interviews"
    | "unlimited_questions"
    | "1_interview"
    | "5_questions"

export async function hasPermission(feature: Feature) {
    const { has } = await auth()
    return has({ feature })
}