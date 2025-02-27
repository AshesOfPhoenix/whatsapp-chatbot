import { openai } from '@ai-sdk/openai'
import { type CoreMessage, generateText } from 'ai'

export async function generateAiResponse(messages: CoreMessage[]) {
    const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        messages: messages.map(
            message =>
                ({
                    role: message.role,
                    content: message.content,
                }) as CoreMessage
        ),
    })
    return text
}
