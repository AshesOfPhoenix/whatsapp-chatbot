import { Injectable, Logger } from '@nestjs/common'
import { generateAiResponse } from '../../utils/scripts/ai'
// biome-ignore lint/style/useImportType: <explanation>
import { DatabaseService } from '../database/database.service'

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name)

    constructor(private readonly databaseService: DatabaseService) {}

    async getAIResponse(threadId: string): Promise<string> {
        const messages = await this.databaseService.getThreadMessages(threadId)
        const response = await generateAiResponse(messages)
        return response
    }
}
