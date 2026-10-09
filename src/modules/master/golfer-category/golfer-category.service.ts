/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GolferCategory } from './entities/golfer-category.entity';
import { CreateGolferCategoryDto } from './dto/create-golfer-category.dto';
import { UpdateGolferCategoryDto } from './dto/update-golfer-category.dto';

@Injectable()
export class GolferCategoryService {
  constructor(
    @InjectRepository(GolferCategory)
    private readonly categoryRepo: Repository<GolferCategory>,
  ) {}

  async create(dto: CreateGolferCategoryDto): Promise<GolferCategory> {
    const category = this.categoryRepo.create({
      ...dto,
    });
    try {
      return await this.categoryRepo.save(category);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
  }

  async findAll(): Promise<GolferCategory[]> {
    return this.categoryRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<GolferCategory> {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException(`Golfer category #${id} not found`);
    return category;
  }

  async update(id: number, dto: UpdateGolferCategoryDto): Promise<GolferCategory> {
    const category = await this.findOne(id);
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    try {
      return await this.categoryRepo.save(category);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
  }

  async remove(id: number): Promise<{ deleted: true; id: number }> {
    const category = await this.findOne(id);
    try {
      await this.categoryRepo.remove(category);
    } catch (e: unknown) {
      // 23503 = foreign key violation (bookings or green fees use this category)
      if (this.pgCode(e) === '23503') {
        throw new ConflictException(
          'This golfer category is used by bookings or fees and cannot be deleted. Deactivate it instead.',
        );
      }
      throw e;
    }
    return { deleted: true, id };
  }

  private rethrowDuplicate(e: unknown): void {
    // 23505 = unique violation (name or code already taken)
    if (this.pgCode(e) === '23505') {
      throw new ConflictException('A golfer category with this name or code already exists');
    }
  }

  private pgCode(e: unknown): string | undefined {
    return (e as { driverError?: { code?: string } })?.driverError?.code;
  }
}