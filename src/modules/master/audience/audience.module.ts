/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AudienceService } from './audience.service';
import { AudienceController } from './audience.controller';
import { Audience } from './entities/audience.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Audience]),
  ],
  controllers: [AudienceController],
  providers: [AudienceService],
  exports: [AudienceService],
})
export class AudienceModule {}