import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { WhatsappModule } from './whatsapp/whatsapp.module'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { AiModule } from './whatsapp/ai/ai.module'

@Module({
    imports: [ConfigModule.forRoot(), WhatsappModule, AiModule, HttpModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
