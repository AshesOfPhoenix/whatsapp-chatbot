import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AiModule } from './whatsapp/ai/ai.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'

@Module({
    imports: [ConfigModule.forRoot(), WhatsappModule, AiModule, HttpModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
