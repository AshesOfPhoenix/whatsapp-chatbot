import { Test, type TestingModule } from '@nestjs/testing'
import { DatabaseService } from '../database/database.service'
import { AiService } from './ai.service'

describe('AiService', () => {
    let service: AiService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AiService, DatabaseService],
        }).compile()

        service = module.get<AiService>(AiService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
