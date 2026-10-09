/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { GolfCourse } from './entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GolfCourse]),
  ],

  controllers: [
    CourseController,
  ],

  providers: [
    CourseService,
  ],

  exports: [
    CourseService,
  ],
})
export class CourseModule {}
