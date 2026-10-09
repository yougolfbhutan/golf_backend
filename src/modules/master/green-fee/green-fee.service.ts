/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from 'src/common/api-response';
import { GreenFee } from './entities/green-fee.entity';
import { CreateGreenFeeDto } from './dto/create-green-fee.dto';
import { UpdateGreenFeeDto } from './dto/update-green-fee.dto';

@Injectable()
export class GreenFeeService {
  constructor(
    @InjectRepository(GreenFee)
    private readonly greenFeeRepo: Repository<GreenFee>,
  ) {}

  async create(dto: CreateGreenFeeDto): Promise<GreenFee> {
    const greenFee = this.greenFeeRepo.create({
      golfCourseId: dto.golfCourseId,
      golferCategoryId: dto.golferCategoryId,
      amount: dto.amount,
      ...(dto.currency !== undefined && { currency: dto.currency as GreenFee['currency'] }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    let saved: GreenFee;
    try {
      saved = await this.greenFeeRepo.save(greenFee);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
    return this.findOne(saved.id);
  }

  // Paginated: GET /green-fee?page=1&limit=20&golfCourseId=1&golferCategoryId=2&currency=BTN
  async findAll(
    page = 1,
    limit = 20,
    golfCourseId?: number,
    golferCategoryId?: number,
    currency?: string,
  ): Promise<PaginatedResult<GreenFee>> {
    const take = Math.min(Math.max(limit, 1), 100);
    const current = Math.max(page, 1);

    const where: FindOptionsWhere<GreenFee> = {};
    if (golfCourseId !== undefined) where.golfCourseId = golfCourseId;
    if (golferCategoryId !== undefined) where.golferCategoryId = golferCategoryId;
    if (currency !== undefined) where.currency = currency.toUpperCase() as GreenFee['currency'];

    const [data, total] = await this.greenFeeRepo.findAndCount({
      where,
      relations: { golfCourse: true, golferCategory: true },
      order: { golfCourseId: 'ASC', golferCategoryId: 'ASC', currency: 'ASC' },
      skip: (current - 1) * take,
      take,
    });
    return { data, total, page: current, limit: take, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: number): Promise<GreenFee> {
    const greenFee = await this.greenFeeRepo.findOne({
      where: { id },
      relations: { golfCourse: true, golferCategory: true },
    });
    if (!greenFee) throw new NotFoundException(`Green fee #${id} not found`);
    return greenFee;
  }

  /**
   * Looks up the active fee for a course, golfer category and currency.
   * BookingService can call this to add the green fee to a booking total.
   */
  async findActiveFee(
    golfCourseId: number,
    golferCategoryId: number,
    currency: string,
  ): Promise<GreenFee> {
    const greenFee = await this.greenFeeRepo.findOne({
      where: {
        golfCourseId,
        golferCategoryId,
        currency: currency as GreenFee['currency'],
        isActive: true,
      },
    });
    if (!greenFee) {
      throw new NotFoundException(
        `No active ${currency} green fee for golf course #${golfCourseId} and golfer category #${golferCategoryId}`,
      );
    }
    return greenFee;
  }

  async update(id: number, dto: UpdateGreenFeeDto): Promise<GreenFee> {
    const greenFee = await this.findOne(id);
    if (dto.amount !== undefined) greenFee.amount = dto.amount;
    if (dto.currency !== undefined) greenFee.currency = dto.currency as GreenFee['currency'];
    if (dto.isActive !== undefined) greenFee.isActive = dto.isActive;
    try {
      await this.greenFeeRepo.save(greenFee);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true; id: number }> {
    const greenFee = await this.findOne(id);
    await this.greenFeeRepo.remove(greenFee);
    return { deleted: true, id };
  }

  private rethrowDuplicate(e: unknown): void {
    // 23505 = unique violation (course + category + currency already has a fee)
    const code = (e as { driverError?: { code?: string } })?.driverError?.code;
    if (code === '23505') {
      throw new ConflictException(
        'A green fee for this golf course, golfer category and currency already exists',
      );
    }
  }
}
