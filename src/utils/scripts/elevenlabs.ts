import { ElevenLabsClient } from 'elevenlabs'

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
})

export const elevenlabs = client
