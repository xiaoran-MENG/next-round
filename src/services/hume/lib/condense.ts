import { ConnectionMessage } from "@humeai/voice-react";
import { JsonMessage, ReturnChatEvent } from "hume/api/resources/empathicVoice";

type Message = JsonMessage | ConnectionMessage | ReturnChatEvent

export function condense(messages: Message[]) {
    return messages.reduce((result, message) => {
        const data = getChatEventData(message) ?? getJsonMessageData(message)
        
        if (data == null || data.content == null) {
            return result
        }

        const { 
            isUser, 
            content 
        } = data

        const last = result.at(-1)

        if (last == null) {
            result.push({
                isUser,
                content: [content]
            })
            return result
        }

        if (last.isUser === isUser) {
            last.content.push(content)
        } else {
            result.push({
                isUser,
                content: [content]
            })
        }

        return result
    }, [] as {
        isUser: boolean
        content: string[]
    }[])
}

function getJsonMessageData(message: Message) {
    if (message.type !== "user_message" && message.type !== "assistant_message") {
        return null
    }
    
    return {
        isUser: message.type === "user_message",
        content: message.message.content
    }
}

function getChatEventData(message: Message) {
    if (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") {
        return null
    }
    
    return {
        isUser: message.type === "USER_MESSAGE",
        content: message.messageText
    }
}