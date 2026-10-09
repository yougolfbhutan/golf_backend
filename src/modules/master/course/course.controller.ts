import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GolfCourse } from './entities/course.entity';
import { ApiResponse, ok } from 'src/common/api-response';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // ==============================
  // CREATE COURSE
  // ==============================
  @Post()
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<ApiResponse<GolfCourse>> {
    try {
      const result = await this.courseService.create(createCourseDto);

      return ok(result, 'Course created successfully');
    } catch (error) {
      this.handleError(error, 'create course');
    }
  }

  // ==============================
  // GET ALL COURSES
  // ==============================
  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<ApiResponse<GolfCourse[]>> {
    try {
      const result = await this.courseService.findAll(page, limit);

      return ok(result, 'Courses fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch courses');
    }
  }

  // ==============================
  // GET COURSE BY ID
  // ==============================
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<GolfCourse>> {
    try {
      const result = await this.courseService.findOne(id);

      return ok(result, 'Course fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch course');
    }
  }

  // ==============================
  // UPDATE COURSE
  // ==============================
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<ApiResponse<GolfCourse>> {
    try {
      const result = await this.courseService.update(id, updateCourseDto);

      return ok(result, 'Course updated successfully');
    } catch (error) {
      this.handleError(error, 'update course');
    }
  }

  // ==============================
  // DELETE COURSE
  // ==============================
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const result = await this.courseService.remove(id);

      return ok(result, 'Course deleted successfully');
    } catch (error) {
      this.handleError(error, 'delete course');
    }
  }

  // ==============================
  // ERROR HANDLER
  // ==============================
  private handleError(error: unknown, action: string): never {
    console.error(`Error while trying to ${action}:`, error);

    throw error;
  }
}
