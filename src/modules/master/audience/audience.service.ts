/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audience } from './entities/audience.entity'; // adjust to where your Audience entity lives
import { CreateAudienceDto } from './dto/create-audience.dto';
import { UpdateAudienceDto } from './dto/update-audience.dto';

@Injectable()
export class AudienceService {
  constructor(
    @InjectRepository(Audience)
    private readonly audienceRepo: Repository<Audience>,
  ) {}

  async create(createAudienceDto: CreateAudienceDto) {
    try {
      const audience = this.audienceRepo.create(createAudienceDto);
      return await this.audienceRepo.save(audience);
    } catch (e: any) {
      this.throwIfDuplicate(e, createAudienceDto.name);
      throw e;
    }
  }

  // Audiences are a tiny master list (men, women, junior), so no pagination
  findAll() {
    return this.audienceRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const audience = await this.audienceRepo.findOneBy({ id });
    if (!audience) throw new NotFoundException(`Audience #${id} not found`);
    return audience;
  }

  async update(id: number, updateAudienceDto: UpdateAudienceDto) {
    const audience = await this.findOne(id);
    try {
      Object.assign(audience, updateAudienceDto);
      return await this.audienceRepo.save(audience);
    } catch (e: any) {
      this.throwIfDuplicate(e, updateAudienceDto.name);
      throw e;
    }
  }

  async remove(id: number) {
    const audience = await this.findOne(id);
    try {
      await this.audienceRepo.remove(audience);
    } catch (e: any) {
      // 23503 = foreign key violation (golf sets or gloves still use this audience)
      if (e?.code === '23503') {
        throw new ConflictException(
          'This audience is used by golf sets or gloves and cannot be deleted',
        );
      }
      throw e;
    }
    return { deleted: true, id };
  }

  // 23505 = unique violation (the name already exists)
  private throwIfDuplicate(e: any, name?: string): void {
    if (e?.code === '23505') {
      throw new ConflictException(`Audience "${name}" already exists`);
    }
  }
}
