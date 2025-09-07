"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { UploadIcon } from "lucide-react"
import { useState } from "react"

export function ResumePageClient({
    jobInfoId
}: {
    jobInfoId: string
}) {
    const [isDragOver, setIsDragOver] = useState(false)

    return <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Upload your resume</CardTitle>
                <CardDescription>Get resume feedback</CardDescription>
            </CardHeader>
            <CardContent>
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
                    }}
                >
                    <label htmlFor="resume-upload" className="sr-only">Upload your resume</label>
                    <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="opacity-0 absolute inset-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                        <UploadIcon className="size-12 text-muted-foreground" />
                        <div className="space-y-2">
                            <p className="text-lg">Drag your resume or click to upload</p>
                            <p className="text-xs text-muted-foreground">Supports PDF, Word docs, and text files</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
}