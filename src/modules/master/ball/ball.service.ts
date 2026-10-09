/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ball } from './entities/ball.entity'; // adjust to where your Ball entity lives
import { CreateBallDto } from './dto/create-ball.dto';
import { UpdateBallDto } from './dto/update-ball.dto';
import { CloudinaryService } from '../cloudinary/Cloudinary.services';

const IMAGE_FOLDER = 'balls';

@Injectable()
export class BallService {
  constructor(
    @InjectRepository(Ball)
    private readonly ballRepo: Repository<Ball>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(createBallDto: CreateBallDto, image?: Express.Multer.File) {
    const uploaded = image
      ? await this.cloudinaryService.uploadImage(image)
      : null;
    console.log(uploaded);
    try {
      const ball = this.ballRepo.create({
        ...createBallDto,
        imageUrl: uploaded ? uploaded.url : null,
      });

      return await this.ballRepo.save(ball);
    } catch (e) {
      // Don't leave an orphaned image in Cloudinary if the DB save fails.
      if (uploaded) await this.cloudinaryService.deleteByUrl(uploaded.url);
      throw e;
    }
  }

  // Paginated: GET /ball?page=1&limit=20
  async findAll(page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 1), 100);
    const current = Math.max(page, 1);
    const [data, total] = await this.ballRepo.findAndCount({
      order: { name: 'ASC' },
      skip: (current - 1) * take,
      take,
    });
    return { data, total, page: current, limit: take, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: number) {
    const ball = await this.ballRepo.findOneBy({ id });
    if (!ball) throw new NotFoundException(`Ball #${id} not found`);
    return ball;
  }

  async update(id: number, updateBallDto: UpdateBallDto, image?: Express.Multer.File) {
    const ball = await this.findOne(id);
    const oldImageUrl = ball.imageUrl;

    Object.assign(ball, updateBallDto);

    const uploaded = image
      ? await this.cloudinaryService.uploadImage(image, IMAGE_FOLDER)
      : null;
    if (uploaded) {
      ball.imageUrl = uploaded.url;
    }

    try {
      const saved = await this.ballRepo.save(ball);
      // Remove the replaced image only after the new state is safely saved.
      if (oldImageUrl && saved.imageUrl !== oldImageUrl) {
        await this.cloudinaryService.deleteByUrl(oldImageUrl);
      }
      return saved;
    } catch (e) {
      if (uploaded) await this.cloudinaryService.deleteByUrl(uploaded.url);
      throw e;
    }
  }

  async remove(id: number) {
    const ball = await this.findOne(id);
    const imageUrl = ball.imageUrl;
    try {
      await this.ballRepo.remove(ball);
    } catch (e: any) {
      // 23503 = foreign key violation (the ball is on a booking)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e?.code === '23503') {
        throw new ConflictException('This ball is used in a booking and cannot be deleted');
      }
      throw e;
    }
    if (imageUrl) await this.cloudinaryService.deleteByUrl(imageUrl);
    return { deleted: true, id };
  }
}