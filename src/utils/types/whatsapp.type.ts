interface WhatsAppWebhookRequest {
    object: string
    entry: Array<{
        id: string
        changes: Array<{
            value: {
                messaging_product: string
                metadata: {
                    display_phone_number: string
                    phone_number_id: string
                }
                contacts: Array<{
                    profile: {
                        name: string
                    }
                    wa_id: string
                }>
                messages: Array<{
                    from: string
                    id: string
                    timestamp: string
                    type: string
                    text?: {
                        body: string
                    }
                    image?: {
                        sha256: string
                        mime_type: string
                        id: string
                    }
                    document?: {
                        filename: string
                        sha256: string
                        mime_type: string
                        id: string
                    }
                    // Add other possible message types here if needed
                }>
                statuses: Array<{
                    id: string
                    status: string
                    timestamp: string
                    recipient_id: string
                    conversation: {
                        id: string
                        expiration_timestamp: string
                        origin: {
                            type: string
                        }
                    }
                    pricing: {
                        billable: boolean
                        pricing_model: string
                        category: string
                    }
                }>
            }
            field: string
        }>
    }>
}

interface WhatsAppTextMessage {
    from: string
    id: string
    timestamp: string
    type: 'text'
    text: {
        body: string
    }
}

interface WhatsAppImageMessage {
    from: string
    id: string
    timestamp: string
    type: 'image'
    image: {
        caption: string
        sha256: string
        mime_type: string
        id: string
    }
}

interface WhatsAppAudioMessage {
    from: string
    id: string
    timestamp: string
    type: 'audio'
    audio: {
        caption: string
        sha256: string
        mime_type: string
        id: string
    }
}

interface WhatsAppVideoMessage {
    from: string
    id: string
    timestamp: string
    type: 'video'
    video: {
        voice: boolean
        sha256: string
        mime_type: string
        id: string
    }
}

interface WhatsAppDocumentMessage {
    from: string
    id: string
    timestamp: string
    type: 'document'
    document: {
        caption: string
        filename: string
        mime_type: string
        sha256: string
        id: string
    }
}

interface WhatsAppContactMessage {
    from: string
    id: string
    timestamp: string
    type: 'contacts'
    contacts: [
        {
            name: {
                first_name: string
                last_name: string
                formatted_name: string
            }
            phones: [
                {
                    phone: string
                    wa_id: string
                    type: string
                },
            ]
        },
    ]
}

interface WhatsAppReactionMessage {
    from: string
    id: string
    timestamp: string
    type: 'reaction'
    reaction: {
        emoji: string
        message_id: string
    }
}

interface WhatsAppMediaConfig {
    method: 'get' | 'post'
    url: string
    headers: {
        'Content-Type': string
        Authorization: string
    }
    data?: string
}

interface WhatsAppMediaUrlObject {
    url: string
    mime_type: string
    sha256: string
    file_size: number
    id: string
    messaging_product: string
}

interface WhatsAppMessageSendingStatus {
    messaging_product: string
    contacts: [
        {
            input: string
            wa_id: string
        },
    ]
    messages: [
        {
            id: string
        },
    ]
}
