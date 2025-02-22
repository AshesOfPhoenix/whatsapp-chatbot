import { type CoreMessage, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

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
