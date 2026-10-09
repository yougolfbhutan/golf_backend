import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GolferCategoryController } from './golfer-category.controller';
import { GolferCategoryService } from './golfer-category.service';
import { GolferCategory } from './entities/golfer-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GolferCategory])],
  controllers: [GolferCategoryController],
  providers: [GolferCategoryService],
  exports: [GolferCategoryService],
})
export class GolferCategoryModule {}
