import { Logger, Module } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { AiService } from './ai.service'

@Module({
    providers: [AiService, Logger, DatabaseService],
})
export class AiModule {}
