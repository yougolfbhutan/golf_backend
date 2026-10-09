/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BallService } from './ball.service';
import { BallController } from './ball.controller';
import { Ball } from './entities/ball.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ball]),
    CloudinaryModule,
  ],
  controllers: [BallController],
  providers: [BallService],
  exports: [BallService],
})
export class BallModule {}