import { Test, type TestingModule } from '@nestjs/testing'
import { WhatsappController } from './whatsapp.controller'
import { WhatsappService } from './whatsapp.service'
import { AiService } from '../ai/ai.service'
import { HttpModule } from '@nestjs/axios'
import { AiModule } from '../ai/ai.module'
import { DatabaseService } from '../database/database.service'

describe('WhatsappController', () => {
    let controller: WhatsappController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AiModule, HttpModule],
            controllers: [WhatsappController],
            providers: [WhatsappService, AiService, DatabaseService],
        }).compile()

        controller = module.get<WhatsappController>(WhatsappController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
