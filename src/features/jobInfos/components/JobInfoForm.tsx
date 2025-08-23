'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { experienceLevels, JobInfoTable } from "@/drizzle/schema/jobInfo"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { jobInfoSchema } from "../schemas"
import { formatExperienceLevel } from "../lib/formatters"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { createJobInfo } from "../actions"
import { updateJobInfo } from "../actions"
import { toast } from "sonner"

type FormValues = z.infer<typeof jobInfoSchema>

export function JobInfoForm({
    jobInfo
}: {
    jobInfo?: Pick<typeof JobInfoTable.$inferSelect, 
    "id" | "name" | "title" | "description" | "experienceLevel">
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(jobInfoSchema),
    defaultValues: jobInfo ?? {
      name: "",
      title: null,
      description: "",
      experienceLevel: "junior"
    },
  })

  async function saveJobInfo(values: FormValues) {
    const action = jobInfo ? updateJobInfo.bind(null, jobInfo.id) : createJobInfo
    const response = await action(values)
    if (response.error) {
      toast.error(response.message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(saveJobInfo)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                A name to identify this job information
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} 
                    onChange={e => field.onChange(e.target.value || null)} />
                </FormControl>
                <FormDescription>
                  An optional title for this position
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatExperienceLevel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Provide details about the job requirements, responsibilities, and any specific technologies or skills needed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
            <LoadingSwap isLoading={form.formState.isSubmitting}>
                Save Job Information
            </LoadingSwap>
        </Button>
      </form>
    </Form>
  )
}