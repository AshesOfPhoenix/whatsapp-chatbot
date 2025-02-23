import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiModule } from './ai/ai.module'
import { AiService } from './ai/ai.service'
import { DatabaseService } from './database/database.service'
import { WhatsappController } from './whatsapp/whatsapp.controller'
import { WhatsappService } from './whatsapp/whatsapp.service'

@Module({
    imports: [AiModule, HttpModule, ConfigModule],
    controllers: [WhatsappController],
    providers: [AiService, WhatsappService, DatabaseService],
})
export class WhatsappModule {}
