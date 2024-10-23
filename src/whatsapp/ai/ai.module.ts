import { Logger, Module } from '@nestjs/common'
import { AiService } from './ai.service'

@Module({
    providers: [AiService, Logger],
})
export class AiModule {}
