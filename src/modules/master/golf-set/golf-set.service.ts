/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from 'src/common/api-response';
import { GolfSet } from './entities/golf-set.entity';
import { CreateGolfSetDto } from './dto/create-golf-set.dto';
import { UpdateGolfSetDto } from './dto/update-golf-set.dto';
import { CloudinaryService } from '../cloudinary/Cloudinary.services';

const IMAGE_FOLDER = 'golf-sets';

@Injectable()
export class GolfSetService {
  constructor(
    @InjectRepository(GolfSet)
    private readonly golfSetRepo: Repository<GolfSet>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateGolfSetDto, image?: Express.Multer.File): Promise<GolfSet> {
    const uploaded = image
      ? await this.cloudinaryService.uploadImage(image, IMAGE_FOLDER)
      : null;

    let saved: GolfSet;
    try {
      const golfSet = this.golfSetRepo.create({
        ...this.toEntityFields(dto),
        imageUrl: uploaded?.url ?? null,
      });
      saved = await this.golfSetRepo.save(golfSet);
    } catch (e) {
      // Don't leave an orphaned image in Cloudinary if the DB save fails.
      if (uploaded) await this.cloudinaryService.deleteByUrl(uploaded.url);
      throw e;
    }
    return this.findOne(saved.id);
  }

  // Paginated: GET /golf-set?page=1&limit=20&audienceId=2
  async findAll(page = 1, limit = 20, audienceId?: number): Promise<PaginatedResult<GolfSet>> {
    const take = Math.min(Math.max(limit, 1), 100);
    const current = Math.max(page, 1);

    const where: FindOptionsWhere<GolfSet> = {};
    if (audienceId !== undefined) where.audienceId = audienceId;

    const [data, total] = await this.golfSetRepo.findAndCount({
      where,
      relations: { audience: true },
      order: { name: 'ASC' },
      skip: (current - 1) * take,
      take,
    });
    return { data, total, page: current, limit: take, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: number): Promise<GolfSet> {
    const golfSet = await this.golfSetRepo.findOne({
      where: { id },
      relations: { audience: true },
    });
    if (!golfSet) throw new NotFoundException(`Golf set #${id} not found`);
    return golfSet;
  }

  async update(id: number, dto: UpdateGolfSetDto, image?: Express.Multer.File): Promise<GolfSet> {
    const golfSet = await this.findOne(id);
    const oldImageUrl = golfSet.imageUrl;

    Object.assign(golfSet, this.toEntityFields(dto));
    // The loaded relation would override a changed audienceId on save.
    if (dto.audienceId !== undefined) {
      golfSet.audience = null;
    }

    const uploaded = image
      ? await this.cloudinaryService.uploadImage(image, IMAGE_FOLDER)
      : null;
    if (uploaded) golfSet.imageUrl = uploaded.url;

    try {
      await this.golfSetRepo.save(golfSet);
    } catch (e) {
      if (uploaded) await this.cloudinaryService.deleteByUrl(uploaded.url);
      throw e;
    }

    // Remove the replaced image only after the new state is safely saved.
    if (uploaded && oldImageUrl) {
      await this.cloudinaryService.deleteByUrl(oldImageUrl);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true; id: number }> {
    const golfSet = await this.findOne(id);
    const imageUrl = golfSet.imageUrl;
    try {
      await this.golfSetRepo.remove(golfSet);
    } catch (e: unknown) {
      // 23503 = foreign key violation (the golf set is on a booking)
      const code = (e as { driverError?: { code?: string } })?.driverError?.code;
      if (code === '23503') {
        throw new ConflictException(
          'This golf set is used in a booking and cannot be deleted. Mark it unavailable instead.',
        );
      }
      throw e;
    }
    if (imageUrl) await this.cloudinaryService.deleteByUrl(imageUrl);
    return { deleted: true, id };
  }

  /** Drops undefined keys so a partial update never overwrites columns with undefined. */
  private toEntityFields(dto: CreateGolfSetDto | UpdateGolfSetDto): Partial<GolfSet> {
    const fields: Partial<GolfSet> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        (fields as Record<string, unknown>)[key] = value;
      }
    }
    return fields;
  }
}