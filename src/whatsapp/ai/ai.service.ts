import { Injectable, Logger } from '@nestjs/common';
import { generateAiResponse } from '../../utils/scripts/ai';
// biome-ignore lint/style/useImportType: <explanation>
import { DatabaseService } from '../database/database.service';
import type { Message } from '@prisma/client';
import type { CoreMessage } from 'ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getAIResponse(threadId: string): Promise<string> {
    const messages = await this.databaseService.getThreadMessages(threadId);
    const formattedMessages = messages.map(
      (message) =>
        ({
          role: message.role as 'user' | 'assistant' | 'tool',
          content: this.formatMessageContent(message),
        }) as CoreMessage,
    );
    const response = await generateAiResponse(formattedMessages);
    return response;
  }

  private formatMessageContent(message: Message) {
    if (message.imageUrl) {
      return [
        { type: 'text', text: message.content },
        { type: 'image', image: message.imageUrl },
      ];
    }
    return message.content;
  }
}
