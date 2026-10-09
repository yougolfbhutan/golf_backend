/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GolfCourse } from './entities/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(GolfCourse)
    private readonly courseRepository: Repository<GolfCourse>,
  ) {}

  // ==============================
  // CREATE
  // ==============================
  async create(createCourseDto: CreateCourseDto): Promise<GolfCourse> {
    const course = this.courseRepository.create(createCourseDto);

    return await this.courseRepository.save(course);
  }

  // ==============================
  // FIND ALL
  // ==============================
  async findAll(page: number | undefined, limit: number | undefined): Promise<GolfCourse[]> {
    return await this.courseRepository.find({
      order: {
        id: 'DESC',
      },
      skip: page && limit ? (page - 1) * limit : undefined,
      take: limit,
    });
  }

  // ==============================
  // FIND ONE
  // ==============================
  async findOne(id: number): Promise<GolfCourse> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  // ==============================
  // UPDATE
  // ==============================
  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<GolfCourse> {
    const course = await this.findOne(id);

    Object.assign(course, updateCourseDto);

    return await this.courseRepository.save(course);
  }

  // ==============================
  // DELETE
  // ==============================
  async remove(id: number): Promise<{ message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const course = await this.findOne(id);

    await this.courseRepository.remove(course);

    return {
      message: `Course with ID ${id} deleted successfully`,
    };
  }
}