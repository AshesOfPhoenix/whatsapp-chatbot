// biome-ignore lint/style/useImportType: <explanation>
import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable, Logger, HttpStatus } from '@nestjs/common'
import { lastValueFrom, catchError, map } from 'rxjs'
import type { AxiosResponse } from 'axios'
// biome-ignore lint/style/useImportType: <explanation>
import { AiService } from '../ai/ai.service'

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name)
    constructor(
        private readonly httpService: HttpService,
        private readonly aiService: AiService
    ) {}

    async readMessage(request: WhatsAppWebhookRequest) {
        const messageNumberId =
            request.entry[0]?.changes[0]?.value.metadata.phone_number_id

        const data = JSON.stringify({
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: request.entry[0]?.changes[0]?.value.messages[0].id,
        })
        const config = this.getMessageConfig(messageNumberId, data)

        await this.sendToWhatsapp(config)
    }

    async reactToMessage(request: WhatsAppWebhookRequest) {
        const messageSenderNumber =
            request.entry[0]?.changes[0]?.value.contacts[0]?.wa_id
        const message = request.entry[0]?.changes[0]?.value.messages[0]
        const messageNumberId =
            request.entry[0]?.changes[0]?.value.metadata.phone_number_id

        const data = JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: messageSenderNumber,
            type: 'reaction',
            reaction: {
                message_id: message.id,
                emoji: '\ud83d\ude0a',
            },
        })
        const config = this.getMessageConfig(messageNumberId, data)

        await this.sendToWhatsapp(config)
    }

    async processMessage(request: WhatsAppWebhookRequest) {
        const messageSenderNumber =
            request.entry[0]?.changes[0]?.value.contacts[0]?.wa_id
        const message = request.entry[0]?.changes[0]?.value.messages[0]
        const messageNumberId =
            request.entry[0]?.changes[0]?.value.metadata.phone_number_id

        switch (message.type) {
            case 'text': {
                const text = message.text.body

                if (text.length < 1) {
                    this.logger.log('Empty message received')
                    await this.sendWhatsappMessage(
                        'Please send a message',
                        messageSenderNumber,
                        messageNumberId
                    )
                    break
                }

                const aiResponse = await this.aiService.getAIResponse(text)

                await this.sendWhatsappMessage(
                    aiResponse,
                    messageSenderNumber,
                    messageNumberId
                )

                break
            }
            default:
                break
        }
    }

    async sendWhatsappMessage(
        message: string,
        phoneNumber: string,
        messageNumberId: string
    ) {
        this.logger.log(`Sending message to ${phoneNumber}: ${message}`)
        const data = JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
            type: 'text',
            text: {
                preview_url: false,
                body: message,
            },
        })
        const config = this.getMessageConfig(messageNumberId, data)

        // this.logger.log(config)

        await this.sendToWhatsapp(config)
    }

    getMessageConfig(messageNumberId: string, data: any) {
        return {
            method: 'post',
            maxBodyLength: Number.POSITIVE_INFINITY,
            url: `https://graph.facebook.com/${process.env.WHATSAPP_CLOUD_API_VERSION}/${messageNumberId}/messages`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_KEY}`,
            },
            data: data,
        }
    }

    async sendToWhatsapp(config: any) {
        try {
            const response = this.httpService
                .post(config.url, config.data, {
                    headers: config.headers,
                })
                .pipe(
                    map((res: AxiosResponse) => res.data),
                    catchError(error => {
                        this.logger.error(error)
                        throw new HttpException(
                            error.message,
                            HttpStatus.INTERNAL_SERVER_ERROR
                        )
                    })
                )

            const messageSendingStatus = await lastValueFrom(response)
            this.logger.log(messageSendingStatus)
        } catch (error) {
            this.logger.error(error)
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    /**
     * Validates the incoming WhatsApp message request.
     * @param request - The request object containing the incoming message.
     * @returns A boolean indicating whether the request is valid.
     */
    isValidWhatsappMessage(request: WhatsAppWebhookRequest): boolean {
        return (
            request.object === 'whatsapp_business_account' &&
            Array.isArray(request.entry) &&
            request.entry.length > 0 &&
            Array.isArray(request.entry[0]?.changes) &&
            request.entry[0]?.changes.length > 0 &&
            request.entry[0]?.changes[0]?.value?.messages?.length > 0
        )
    }
}
