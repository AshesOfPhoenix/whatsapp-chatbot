// biome-ignore lint/style/useImportType: <explanation>
import { Injectable, OnModuleInit } from '@nestjs/common'
import {
    PrismaClient,
    type Thread,
    type User,
    type Message,
} from '@prisma/client'

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect()
    }

    async getOrCreateUser(wid: string, phoneNumber: string): Promise<User> {
        const user = await this.user.findUnique({ where: { wid } })
        if (!user) {
            return await this.user.create({ data: { wid, phoneNumber } })
        }
        return user
    }

    async getOrCreateThread(wid: string): Promise<Thread> {
        const thread = await this.thread.findUnique({ where: { userId: wid } })
        if (!thread) {
            return await this.thread.create({ data: { userId: wid } })
        }
        return thread
    }

    async getThreadMessages(threadId: string): Promise<Message[]> {
        return await this.message.findMany({ where: { threadId } })
    }

    async getOrCreateMessage(
        message: WhatsAppTextMessage,
        messageId: string,
        threadId: string,
        role: 'user' | 'assistant' | 'tool'
    ): Promise<Message> {
        return await this.message.create({
            data: {
                id: messageId,
                threadId,
                content: message.text.body,
                role,
            },
        })
    }

    async getMessages(threadId: string): Promise<Message[]> {
        return await this.message.findMany({ where: { threadId } })
    }
}
