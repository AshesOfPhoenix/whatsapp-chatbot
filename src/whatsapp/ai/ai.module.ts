import { Logger, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { DatabaseService } from '../database/database.service';

@Module({
  providers: [AiService, Logger, DatabaseService],
})
export class AiModule {}
