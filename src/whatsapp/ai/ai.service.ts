import { Injectable, Logger } from '@nestjs/common'
import { generateAiResponse } from 'src/utils/scripts/ai'

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name)

    async getAIResponse(message: string): Promise<string> {
        // Logic to call AI endpoints and get a response
        const response = await generateAiResponse(message)
        return response
    }
}
