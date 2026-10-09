/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GlovesService } from './gloves.service';
import { Glove } from './entities/glove.entity';
import { GlovesController } from './gloves.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Glove]),
    CloudinaryModule,
  ],
  controllers: [GlovesController],
  providers: [GlovesService],
  exports: [GlovesService],
})
export class GlovesModule {}