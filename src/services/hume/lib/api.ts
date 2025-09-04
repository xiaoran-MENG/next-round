import { env } from "@/data/env/server"
import { HumeClient } from "hume"
import { ReturnChatEvent } from "hume/api/resources/empathicVoice"

export async function getChatMessages(humeChatId: string) {
    'use cache'
    const client = new HumeClient({
        apiKey: env.HUME_API_KEY
    })
    const events: ReturnChatEvent[] = []
    const page = await client.empathicVoice.chats.listChatEvents(
        humeChatId,
        {
            pageNumber: 0,
            pageSize: 100
        }
    )
    for await (const event of page) {
        events.push(event)
    }
    return events
}