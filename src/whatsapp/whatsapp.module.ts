import { Module } from '@nestjs/common'
import { WhatsappController } from './whatsapp/whatsapp.controller'
import { WhatsappService } from './whatsapp/whatsapp.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { AiService } from './ai/ai.service'
import { AiModule } from './ai/ai.module'

@Module({
    imports: [AiModule, HttpModule, ConfigModule],
    controllers: [WhatsappController],
    providers: [AiService, WhatsappService],
})
export class WhatsappModule {}
