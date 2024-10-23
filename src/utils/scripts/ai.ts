import { type CoreMessage, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { Message } from '@prisma/client'

export async function generateAiResponse(messages: Message[]) {
    const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        messages: messages.map(
            message =>
                ({
                    role: message.role as 'user' | 'assistant' | 'tool',
                    content: message.content,
                }) as CoreMessage
        ),
    })
    return text
}
