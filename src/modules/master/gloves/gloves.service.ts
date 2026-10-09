/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from 'src/common/api-response';
import { Glove } from './entities/glove.entity';
import { CreateGloveDto } from './dto/create-glove.dto';
import { UpdateGloveDto } from './dto/update-glove.dto';
import { CloudinaryService } from '../cloudinary/Cloudinary.services';

const IMAGE_FOLDER = 'gloves';

@Injectable()
export class GlovesService {
  constructor(
    @InjectRepository(Glove)
    private readonly gloveRepo: Repository<Glove>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createGloveDto: CreateGloveDto, image?: Express.Multer.File): Promise<Glove> {
    const uploaded = image
      ? await this.cloudinaryService.uploadImage(image, IMAGE_FOLDER)
      : null;

    let saved: Glove;
    try {
      const glove = this.gloveRepo.create({
        ...this.toEntityFields(createGloveDto),
        imageUrl: uploaded?.url ?? null,
      });
      saved = await this.gloveRepo.save(glove);
    } catch (e) {
      // Don't leave an orphaned image in Cloudinary if the DB save fails.
      if (uploaded) await this.cloudinaryService.deleteByUrl(uploaded.url);
      throw e;
    }
    return this.findOne(saved.id);
  }

  // Paginated: GET /glove?page=1&limit=20&audienceId=2
  async findAll(page = 1, limit = 20, audienceId?: number): Promise<PaginatedResult<Glove>> {
    const take = Math.min(Math.max(limit, 1), 100);
    const current = Math.max(page, 1);

    const where: FindOptionsWhere<Glove> = {};
    if (audienceId !== undefined) where.audienceId = audienceId;

    const [data, total] = await this.gloveRepo.findAndCount({
      where,
      relations: { audience: true },
      order: { name: 'ASC' },
      skip: (current - 1) * take,
      take,
    });
    return { data, total, page: current, limit: take, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: number): Promise<Glove> {
    const glove = await this.gloveRepo.findOne({
      where: { id },
      relations: { audience: true },
    });
    if (!glove) throw new NotFoundException(`Glove #${id} not found`);
    return glove;
  }

  async update(
    id: number,
    updateGloveDto: UpdateGloveDto,
    image?: Express.Multer.File,
  ): Promise<Glove> {
    const glove = await this.findOne(id);
    const oldImageUrl = glove.imageUrl;

    Object.assign(glove, this.toEntityFields(updateGloveDto));
    // The loaded relation would override a changed audienceId on save.
    if (updateGloveDto.audienceId !== undefined) {
      glove.audience = null;
    }

    const uploaded = image
      ? await this.cloudinaryService.uploadImage(image, IMAGE_FOLDER)
      : null;
    if (uploaded) glove.imageUrl = uploaded.url;

    try {
      await this.gloveRepo.save(glove);
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
    const glove = await this.findOne(id);
    const imageUrl = glove.imageUrl;
    try {
      await this.gloveRepo.remove(glove);
    } catch (e: unknown) {
      // 23503 = foreign key violation (the glove is on a booking)
      const code = (e as { driverError?: { code?: string } })?.driverError?.code;
      if (code === '23503') {
        throw new ConflictException(
          'This glove is used in a booking and cannot be deleted. Mark it unavailable instead.',
        );
      }
      throw e;
    }
    if (imageUrl) await this.cloudinaryService.deleteByUrl(imageUrl);
    return { deleted: true, id };
  }

  /** Drops undefined keys so a partial update never overwrites columns with undefined. */
  private toEntityFields(dto: CreateGloveDto | UpdateGloveDto): Partial<Glove> {
    const fields: Partial<Glove> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        (fields as Record<string, unknown>)[key] = value;
      }
    }
    return fields;
  }
}