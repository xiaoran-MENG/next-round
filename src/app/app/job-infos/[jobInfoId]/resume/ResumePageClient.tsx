"use client"

import { Skeleton } from "@/components/Skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { cn } from "@/lib/utils"
import { analysisSchema } from "@/services/ai/resumes/schemas"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { DeepPartial } from "ai"
import { AlertCircleIcon, CheckCircleIcon, UploadIcon, XCircleIcon } from "lucide-react"
import { ReactNode, useRef, useState } from "react"
import { toast } from "sonner"
import z from "zod"

export function ResumePageClient({
    jobInfoId
}: {
    jobInfoId: string
}) {
    const [isDragOver, setIsDragOver] = useState(false)
    const fileRef = useRef<File | null>(null)
    const {
        object: analysis,
        submit: generateAnalysis,
        isLoading
    } = useObject({
        api: "/api/ai/resumes/analyze",
        schema: analysisSchema,
        fetch: (url, options) => {
            const headers = new Headers(options?.headers)
            headers.delete('Content-Type')
            const data = new FormData()
            if (fileRef.current) {
                data.append('resumeFile', fileRef.current)
            }
            data.append("jobInfoId", jobInfoId)
            return fetch(url, { 
                ...options, 
                headers,
                body: data
            })
        }
    })

    function upload(file: File | null) {
        fileRef.current = file
        if (file == null) {
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size exceeds 10MB limit")
            return
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]

        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a PDF, Word doc, or text file")
            return
        }

        generateAnalysis(null)
    }

    return <div className="space-y-8 w-full">
        <Card>
            <CardHeader>
                <CardTitle>
                    {isLoading ? "Analyzing your resume" : "Upload your resume"}
                </CardTitle>
                <CardDescription>
                    {isLoading ? "This may take a couple minutes" : "Get resume feedback"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoadingSwap loadingIconClassName="size-16" isLoading={isLoading}>
                    <div 
                        className={cn("mt-2 border-2 border-dashed rounded-lg p-6 transition-colors relative", isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground")}
                        onDragOver={e => {
                            e.preventDefault()
                            setIsDragOver(true)
                        }}
                        onDragLeave={e => {
                            e.preventDefault()
                            setIsDragOver(false)
                        }}
                        onDrop={e => {
                            e.preventDefault()
                            setIsDragOver(false)
                            upload(e.dataTransfer.files[0] ?? null)
                        }}
                    >
                        <label htmlFor="resume-upload" className="sr-only">Upload your resume</label>
                        <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            className="opacity-0 absolute inset-0 cursor-pointer"
                            onChange={e => {
                                upload(e.target.files?.[0] ?? null)
                            }}
                        />
                        <div className="flex flex-col items-center justify-center text-center gap-4">
                            <UploadIcon className="size-12 text-muted-foreground" />
                            <div className="space-y-2">
                                <p className="text-lg">Drag your resume or click to upload</p>
                                <p className="text-xs text-muted-foreground">Supports PDF, Word docs, and text files</p>
                            </div>
                        </div>
                    </div>
                </LoadingSwap>
            </CardContent>
        </Card>
        <AnalysisResults analysis={analysis} loading={isLoading} />
    </div>
}

type Keys = Exclude<keyof z.infer<typeof analysisSchema>, "overallScore">

function AnalysisResults({
    analysis,
    loading
}: {
    analysis: DeepPartial<z.infer<typeof analysisSchema>> | undefined
    loading: boolean
}) {
    if (loading && analysis == null) return

    const sections: Record<Keys, string> = {
        ats: "ATS Compatibility",
        jobMatch: "Job Match",
        writingAndFormatting: "Writing and Formatting",
        keywordCoverage: "Keyword Coverage",
        other: "Additional Insights",
    }

    return <Card>
        <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
                {analysis?.overallScore == null
                    ? <Skeleton className="w-32" />
                    : `Overall Score: ${analysis.overallScore}/10`
                }
            </CardDescription>
        </CardHeader>
         <CardContent>
            <Accordion type="multiple">
                {Object.entries(sections).map(([key, value]) => {
                    const category = analysis?.[key as Keys]
                    return <AccordionItem value={value} key={key}>
                        <AccordionTrigger>
                            <CategoryAccordionHeader
                                title={value}
                                score={category?.score}
                            />
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <div className="text-muted-foreground">
                                    {category?.summary == null ? (
                                        <span className="space-y-2">
                                        <Skeleton />
                                        <Skeleton className="w-3/4" />
                                        </span>
                                    ) : (
                                        category.summary
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {category?.feedback == null ? (
                                        <>
                                        <Skeleton className="h-16" />
                                        <Skeleton className="h-16" />
                                        <Skeleton className="h-16" />
                                        </>
                                    ) : (
                                        category.feedback.map((item, index) => {
                                            if (item == null) return null

                                            return <FeedbackItem key={index} {...item} />
                                        })
                                    )}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                })}
            </Accordion>
         </CardContent>
    </Card>
}

function CategoryAccordionHeader({
  title,
  score,
}: {
  title: string
  score: number | undefined | null
}) {
  let badge: ReactNode
  if (score == null) {
    badge = <Skeleton className="w-16" />
  } else if (score >= 8) {
    badge = <Badge>Excellent</Badge>
  } else if (score >= 6) {
    badge = <Badge variant="warning">Ok</Badge>
  } else {
    badge = <Badge variant="destructive">Needs Works</Badge>
  }

  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex flex-col items-start gap-1">
        <span>{title}</span>
        <div className="no-underline">{badge}</div>
      </div>
      {score == null ? <Skeleton className="w-12" /> : `${score}/10`}
    </div>
  )
}

function FeedbackItem({
  message,
  name,
  type,
}: Partial<z.infer<typeof analysisSchema>["ats"]["feedback"][number]>) {
  if (name == null || message == null || type == null) return null

  const getColors = () => {
    switch (type) {
      case "strength":
        return "bg-primary/10 border border-primary/50"
      case "major-improvement":
        return "bg-destructive/10 dark:bg-destructive/20 border border-destructive/50 dark:border-destructive/70"
      case "minor-improvement":
        return "bg-warning/10 border border-warning/40"
      default:
        throw new Error(`Unknown feedback type: ${type satisfies never}`)
    }
  }

  const getIcon = () => {
    switch (type) {
      case "strength":
        return <CheckCircleIcon className="size-4 text-primary" />
      case "minor-improvement":
        return <AlertCircleIcon className="size-4 text-warning" />
      case "major-improvement":
        return <XCircleIcon className="size-4 text-destructive" />
      default:
        throw new Error(`Unknown feedback type: ${type satisfies never}`)
    }
  }

  return (
    <div
      className={cn(
        "flex items-baseline gap-3 pl-3 pr-5 py-5 rounded-lg mb-2",
        getColors()
      )}
    >
      <div>{getIcon()}</div>
      <div className="flex flex-col gap-1">
        <div className="text-base">{name}</div>
        <div className="text-muted-foreground">{message}</div>
      </div>
    </div>
  )
}