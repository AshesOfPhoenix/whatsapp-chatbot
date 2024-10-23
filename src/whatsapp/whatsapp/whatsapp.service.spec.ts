import { Test, type TestingModule } from '@nestjs/testing'
import { WhatsappService } from './whatsapp.service'
import { HttpModule } from '@nestjs/axios'
import { AiModule } from '../ai/ai.module'
import { AiService } from '../ai/ai.service'
import { DatabaseService } from '../database/database.service'

describe('WhatsappService', () => {
    let service: WhatsappService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AiModule, HttpModule],
            providers: [WhatsappService, AiService, DatabaseService],
        }).compile()

        service = module.get<WhatsappService>(WhatsappService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
