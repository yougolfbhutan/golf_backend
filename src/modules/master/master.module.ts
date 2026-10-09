/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { StocksModule } from './stocks/stocks.module';
import { BallModule } from './ball/ball.module';
import { GlovesModule } from './gloves/gloves.module';
import { AudienceModule } from './audience/audience.module';
import { CourseModule } from './course/course.module';
import { GolferCategoryModule } from './golfer-category/golfer-category.module';
import { GolfSetModule } from './golf-set/golf-set.module';
import { GreenFeeModule } from './green-fee/green-fee.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [StocksModule, BallModule, GlovesModule, AudienceModule, CourseModule, GolferCategoryModule, GolfSetModule, GreenFeeModule, CloudinaryModule]
})
export class MasterModule {}
