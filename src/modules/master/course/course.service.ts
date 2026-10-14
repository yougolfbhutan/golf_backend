/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GolfCourse } from './entities/course.entity';
import { CloudinaryService } from '../cloudinary/Cloudinary.services';
const IMAGE_FOLDER = 'golf/courses';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(GolfCourse)
    private readonly courseRepository: Repository<GolfCourse>,
        private readonly cloudinaryService: CloudinaryService,
    
  ) {}

  // ==============================
  // CREATE
  // ==============================

async create(
  createCourseDto: CreateCourseDto,
  image?: Express.Multer.File,
): Promise<GolfCourse> {
  // Fail fast before touching Cloudinary
  const exists = await this.courseRepository.exists({
    where: { name: createCourseDto.name },
  });
  if (exists) {
    throw new ConflictException(
      `A course named "${createCourseDto.name}" already exists`,
    );
  }

  const uploaded = image
    ? await this.cloudinaryService.uploadImage(image, IMAGE_FOLDER)
    : null;

  let saved: GolfCourse;
  try {
    const course = this.courseRepository.create({
      ...createCourseDto,
      imageUrl: uploaded?.url ?? null,
    });
    saved = await this.courseRepository.save(course);
  } catch (e) {
    // Don't leave an orphaned image in Cloudinary if the DB save fails.
    if (uploaded) await this.cloudinaryService.deleteByUrl(uploaded.url);

    // Race condition: two requests passed the exists() check at once
    if (
      e instanceof QueryFailedError &&
      (e as QueryFailedError & { code?: string }).code === '23505'
    ) {
      throw new ConflictException(
        `A course named "${createCourseDto.name}" already exists`,
      );
    }
    throw e;
  }
  return this.findOne(saved.id);
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