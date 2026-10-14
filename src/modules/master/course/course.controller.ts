/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GolfCourse } from './entities/course.entity';
import { ApiResponse, ok } from 'src/common/api-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { optionalImagePipe } from '../image-file.pipe';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  // ==============================
  // CREATE COURSE
  // ==============================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile(optionalImagePipe) image?: Express.Multer.File,
  ): Promise<ApiResponse<GolfCourse>> {
    try {
      const result = await this.courseService.create(createCourseDto, image);

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
