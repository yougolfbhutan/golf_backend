import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GolfSetController } from './golf-set.controller';
import { GolfSetService } from './golf-set.service';
import { GolfSet } from './entities/golf-set.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([GolfSet]), CloudinaryModule],
  controllers: [GolfSetController],
  providers: [GolfSetService],
  exports: [GolfSetService],
})
export class GolfSetModule {}
