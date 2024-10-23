// biome-ignore lint/style/useImportType: <explanation>
import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable, Logger, HttpStatus } from '@nestjs/common'
import { lastValueFrom, catchError, map } from 'rxjs'
import type { AxiosResponse } from 'axios'
// biome-ignore lint/style/useImportType: <explanation>
import { AiService } from '../ai/ai.service'
// biome-ignore lint/style/useImportType: <explanation>
import { DatabaseService } from '../database/database.service'

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name)
    constructor(
        private readonly httpService: HttpService,
        private readonly aiService: AiService,
        private readonly databaseService: DatabaseService
    ) {}

    async readMessage(request: WhatsAppWebhookRequest) {
        const messageNumberId =
            request.entry[0]?.changes[0]?.value.metadata.phone_number_id

        const data = JSON.stringify({
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: request.entry[0]?.changes[0]?.value.messages[0].id,
        })
        const config = this.getPOSTMessageConfig(messageNumberId, data)

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
        const config = this.getPOSTMessageConfig(messageNumberId, data)

        await this.sendToWhatsapp(config)
    }

    async processMessage(request: WhatsAppWebhookRequest) {
        const messageSenderNumber =
            request.entry[0]?.changes[0]?.value.contacts[0]?.wa_id
        const message = request.entry[0]?.changes[0]?.value.messages[0]
        const messagePhoneNumberId =
            request.entry[0]?.changes[0]?.value.metadata.phone_number_id

        this.logger.log(message)

        const user = await this.databaseService.getOrCreateUser(
            messagePhoneNumberId,
            messageSenderNumber
        )
        const thread =
            await this.databaseService.getOrCreateThread(messagePhoneNumberId)

        this.logger.log(thread)

        switch (message.type) {
            case 'text': {
                const msg = message as WhatsAppTextMessage
                const text = msg.text.body

                await this.databaseService.getOrCreateMessage(
                    msg,
                    msg.id,
                    thread.id,
                    'user'
                )

                if (text.length < 1) {
                    this.logger.log('Empty message received')
                    await this.sendWhatsappMessage(
                        'Please send a message',
                        messageSenderNumber,
                        messagePhoneNumberId
                    )
                    break
                }

                const aiResponse = await this.aiService.getAIResponse(thread.id)
                // const aiResponse = text

                const statusResponse = await this.sendWhatsappMessage(
                    aiResponse,
                    messageSenderNumber,
                    messagePhoneNumberId
                )

                for (const messageResponse of statusResponse.messages) {
                    await this.databaseService.getOrCreateMessage(
                        {
                            from: messageSenderNumber,
                            id: messageResponse.id,
                            type: 'text',
                            text: { body: aiResponse },
                            timestamp: new Date().getTime().toString(),
                        },
                        messageResponse.id,
                        thread.id,
                        'assistant'
                    )
                }

                break
            }
            case 'image': {
                const msg = message as WhatsAppImageMessage
                const text = msg.image.caption

                const mediaUrl = await this.retrieveMediaUrl(
                    msg.image.id,
                    messagePhoneNumberId
                )
                this.logger.log(
                    `Image message received with caption: ${text} and media url: ${mediaUrl}`
                )
                break
            }
            case 'audio': {
                const msg = message as WhatsAppAudioMessage
                const text = msg.audio.caption

                const mediaUrl = await this.retrieveMediaUrl(
                    msg.audio.id,
                    messagePhoneNumberId
                )
                this.logger.log(
                    `Audio message received with caption: ${text} and media url: ${mediaUrl}`
                )
                break
            }
            case 'video': {
                const msg = message as WhatsAppVideoMessage
                const voice = msg.video.voice

                const mediaUrl = await this.retrieveMediaUrl(
                    msg.video.id,
                    messagePhoneNumberId
                )
                this.logger.log(
                    `Video message received with voice: ${voice} and media url: ${mediaUrl}`
                )
                break
            }
            case 'document': {
                const msg = message as WhatsAppDocumentMessage
                const text = msg.document.caption

                const mediaUrl = await this.retrieveMediaUrl(
                    msg.document.id,
                    messagePhoneNumberId
                )
                this.logger.log(
                    `Document message received with caption: ${text} and media url: ${mediaUrl}`
                )
                break
            }
            case 'reaction': {
                const msg = message as WhatsAppReactionMessage
                this.logger.log(msg)
                break
            }
            case 'contacts': {
                const msg = message as WhatsAppContactMessage
                this.logger.log(msg)
                break
            }
            default:
                this.logger.log(message)
                break
        }
    }

    async sendWhatsappMessage(
        message: string,
        phoneNumber: string,
        messageNumberId: string
    ): Promise<WhatsAppMessageSendingStatus> {
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
        const config = this.getPOSTMessageConfig(messageNumberId, data)

        // this.logger.log(config)

        return await this.sendToWhatsapp(config)
    }

    getPOSTMessageConfig(
        messageNumberId: string,
        data: string
    ): WhatsAppMediaConfig {
        return {
            method: 'post',
            maxBodyLength: Number.POSITIVE_INFINITY,
            url: `https://graph.facebook.com/${process.env.WHATSAPP_CLOUD_API_VERSION}/${messageNumberId}/messages`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_KEY}`,
            },
            data: data,
        } as WhatsAppMediaConfig
    }

    getGETMediaConfig(
        mediaId: string,
        messageNumberId: string
    ): WhatsAppMediaConfig {
        return {
            method: 'get',
            maxBodyLength: Number.POSITIVE_INFINITY,
            url: `https://graph.facebook.com/${process.env.WHATSAPP_CLOUD_API_VERSION}/${mediaId}?phone_number_id=${messageNumberId}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_API_KEY}`,
            },
        } as WhatsAppMediaConfig
    }

    async sendToWhatsapp(
        config: WhatsAppMediaConfig
    ): Promise<WhatsAppMessageSendingStatus> {
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
            return messageSendingStatus
        } catch (error) {
            this.logger.error(error)
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    async retrieveMediaUrl(
        mediaId: string,
        messageNumberId: string
    ): Promise<WhatsAppMediaUrlObject> {
        const config = this.getGETMediaConfig(mediaId, messageNumberId)
        try {
            const response = this.httpService
                .get(config.url, { headers: config.headers })
                .pipe(map((res: AxiosResponse) => res.data))

            const mediaUrl = await lastValueFrom(response)
            return mediaUrl as WhatsAppMediaUrlObject
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
