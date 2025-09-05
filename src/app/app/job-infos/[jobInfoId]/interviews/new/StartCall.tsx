"use client"

import { Button } from "@/components/ui/button"
import { env } from "@/data/env/client"
import { JobInfoTable } from "@/drizzle/schema"
import { syncInterviewWithChat, createInterview } from "@/features/interviews/actions"
import { errorToast } from "@/lib/errorToast"
import { CondensedMessages } from "@/services/hume/components/CondensedMessages"
import { condense } from "@/services/hume/lib/condense"
import { useVoice, VoiceReadyState } from "@humeai/voice-react"
import { Loader2Icon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

export function StartCall({
    jobInfo,
    accessToken,
    user
}: {
   jobInfo: Pick<typeof JobInfoTable.$inferSelect,
   "id" | "title" | "description" | "experienceLevel">,
   accessToken: string,
   user: {
    name: string,
    imageUrl: string
   }
}) {
    const {
        connect,
        readyState,
        chatMetadata,
        callDurationTimestamp
    } = useVoice()

    const [interviewId, setInterviewId] = useState<string | null>(null)
    const durationRef = useRef(callDurationTimestamp)
    durationRef.current = callDurationTimestamp

    const router = useRouter()

    useEffect(() => {
        if (chatMetadata?.chatId == null || interviewId == null) return
        syncInterviewWithChat(interviewId, {
            humeChatId: chatMetadata.chatId
        })
    }, [
        chatMetadata?.chatId,
        interviewId
    ])

    useEffect(() => {
        if (interviewId == null) return
        const intervalId = setInterval(() => {
            if (durationRef.current == null) return
            syncInterviewWithChat(interviewId, {
                duration: durationRef.current
            })
        }, 10000)
        return () => clearInterval(intervalId)
    }, [interviewId])

    useEffect(() => {
        if (readyState !== VoiceReadyState.CLOSED) 
            return
        if (interviewId == null)
            return router.push(`/app/job-infos/${jobInfo.id}/interviews`)
        if (durationRef.current != null) {
            syncInterviewWithChat(interviewId, {
                duration: durationRef.current
            })
        } 
        router.push(`/app/job-infos/${jobInfo.id}/interviews/${interviewId}`)
    }, [interviewId, jobInfo.id, readyState, router])

    if (readyState === VoiceReadyState.IDLE) {
        return <div className="flex justify-center items-center h-screen-header">
            <Button 
                size='lg'
                onClick={async () => {
                    const result = await createInterview({ jobInfoId: jobInfo.id })
                    if (result.error) {
                        return errorToast(result.message)
                    }
                    setInterviewId(result.id)
                    connect({
                        auth: {
                            type: "accessToken",
                            value: accessToken
                        },
                        configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
                        sessionSettings: {
                            type: "session_settings",
                            variables: {
                                userName: user.name,
                                title: jobInfo.title || "Not Specified",
                                description: jobInfo.description,
                                experienceLevel: jobInfo.experienceLevel
                            }
                        }
                    })
                }}
            >
                Start
            </Button>
        </div>
    }

    if ([VoiceReadyState.CONNECTING, VoiceReadyState.CLOSED].includes(readyState)) {
        return <div className="h-screen-header flex items-center justify-center">
            <Loader2Icon className="animate-spin size-24" />
        </div>
    }

    return <div className="overflow-y-auto h-screen-header flex flex-col-reverse">
        <div className="container py-6 flex flex-col gap-4 items-center justify-end">
            <Messages user={user} />
            <Controls />
        </div>
    </div>
}

function Messages({
    user
}: {
    user: {
        name: string
        imageUrl: string
    }
}) {
    const {
        messages,
        fft
    } = useVoice()

    const results = useMemo(() => condense(messages), [messages])

    return <CondensedMessages
        className='max-w-5xl'
        messages={results}
        user={user}
        maxFft={Math.max(...fft)}
    />
}

function Controls() {
    const {
        disconnect,
        isMuted,
        mute,
        unmute,
        micFft,
        callDurationTimestamp
    } = useVoice()

    return <div className="flex gap-5 rounded border px-5 py-2 w-fit sticky bottom-6 bg-background items-center">
        <Button
            variant='ghost'
            size='icon'
            className="-mx-3"
            onClick={() => isMuted ? unmute() : mute()}
        >
            {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
        </Button>
        <div className="self-stretch">
            <FftVisualizer fft={micFft} />
        </div>
        <div className="text-sm text-muted-foreground tabular-nums">
            {callDurationTimestamp}
        </div>
        <Button
            variant="ghost"
            size="icon"
            className="-mx-3"
            onClick={disconnect}
        >
            <PhoneOffIcon className="text-destructive" />
            <span className="sr-only">End Call</span>
        </Button>
    </div>
}

function FftVisualizer({ fft } : { fft: number[] }) {
    return <div className="flex gap-1 items-center h-full">
        {fft.map((value, i) => {
            const percent = (value / 4) * 100
            return <div key={i} className="min-h-0.5 bg-primary/75 w-0.5 rounded" style={{ height: `${percent < 10 ? 0 : percent}%` }} />
        })}
    </div>
}