'use server'

import z from "zod";
import { jobInfoSchema } from "./schemas";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { insertJobInfo, updateJobInfo as updateJobInfoDb } from "./db";
import { and, eq } from "drizzle-orm";
import { JobInfoTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { jobInfoIdTag } from "./dbCache";

export async function createJobInfo(input: z.infer<typeof jobInfoSchema>) {
  const { userId } = await getCurrentUser()
  
  if (userId == null) {
    return {
        error: true,
        message: "You do not have permission to create job information"
    }
  }
  
  const { success, data } = jobInfoSchema.safeParse(input)
  if (!success) {
    return {
      error: true,
      message: "Invalid job information data",
    }
  }

  const jobInfo = await insertJobInfo({ ...data, userId })
  redirect(`/app/job-infos/${jobInfo.id}`)
}


export async function updateJobInfo(id: string, input: z.infer<typeof jobInfoSchema>) {
  const { userId } = await getCurrentUser()
  
  if (userId == null) {
    return {
        error: true,
        message: "You don't have permission to create this job"
    }
  }
  
  const { success, data } = jobInfoSchema.safeParse(input)
  if (!success) {
    return {
      error: true,
      message: "Invalid job information data",
    }
  }

  const jobInfo = await getJobInfo(id, userId)
  if (jobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to update this job",
    }
  }

  const result = await updateJobInfoDb(id, data)
  redirect(`/app/job-infos/${result.id}`)
}

async function getJobInfo(id: string, userId: string) {
    'use cache'
    cacheTag(jobInfoIdTag(id))
    return await db.query.JobInfoTable.findFirst({
        where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
    })
}

