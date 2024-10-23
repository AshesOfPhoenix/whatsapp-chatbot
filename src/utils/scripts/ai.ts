import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function generateAiResponse(prompt: string) {
    const { text } = await generateText({
        model: openai('gpt-4-turbo'),
        prompt: prompt,
    })
    return text
}
