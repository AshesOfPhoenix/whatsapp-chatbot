import {
  Controller,
  Get,
  Post,
  Req,
  HttpException,
  HttpStatus,
  HttpCode,
  Body,
  Logger,
} from '@nestjs/common';

import type { Request } from 'express';
// biome-ignore lint/style/useImportType: <explanation>
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name)
  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * Handles the WhatsApp verification challenge.
   * @param request - The request object containing the verification parameters.
   * @returns The challenge response.
   */
  @Get('webhook')
  whatsappVerificationChallenge(@Req() request: Request): string {
    const mode = request.query['hub.mode'];
    const token = request.query['hub.verify_token'];
    const challenge = request.query['hub.challenge'];

    const verificationToken =
      process.env.WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN;

    if (mode || token) {
      if (mode === 'subscribe' && token === verificationToken) {
        return challenge?.toString();
      }

      throw new HttpException('Verification failed', HttpStatus.BAD_REQUEST);
    }

    throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
  }

  /**
   * Handles incoming messages from WhatsApp Cloud API.
   * @param request - The request object containing the incoming message.
   * @returns A string indicating the success of the operation.
   */
  @Post('webhook')
  @HttpCode(200)
  async handleIncomingWhatsappMessage(
    @Body() request: WhatsAppWebhookRequest,
  ): Promise<string> {
        if (this.whatsappService.isValidWhatsappMessage(request)) {
            await this.whatsappService.readMessage(request)
            await this.whatsappService.processMessage(request)
            return 'ok'
        }

    throw new HttpException('Invalid JSON provided', HttpStatus.BAD_REQUEST);
  }
}
