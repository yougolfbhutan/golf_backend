/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from 'src/common/api-response';
import { GolfSet } from 'src/modules/master/golf-set/entities/golf-set.entity';
import { Ball } from 'src/modules/master/ball/entities/ball.entity';
import {
  Booking,
  BOOKING_STATUSES,
  BookingStatus,
} from './entities/booking.entity';
import { CreateBookingDto, CreateBookingItemDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingItem } from './entities/booking item.entity';
import { Glove } from 'src/modules/master/gloves/entities/glove.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates the booking and its rental lines in one transaction.
   * Prices come from the master tables, never from the client.
   * totalAmount currently covers rentals only.
   */
  async create(dto: CreateBookingDto): Promise<Booking> {
    this.assertNotInPast(dto.teeDate);

    return this.dataSource.transaction(async (manager) => {
      const items: BookingItem[] = [];
      let total = 0;
      for (const line of dto.items ?? []) {
        const item = await this.buildItem(manager, line);
        total += item.unitPrice * item.quantity;
        items.push(item);
      }

      const booking = manager.create(Booking, {
        customerId: dto.customerId,
        golfCourseId: dto.golfCourseId,
        golferCategoryId: dto.golferCategoryId,
        teeDate: dto.teeDate,
        teeTime: dto.teeTime,
        numberOfGolfers: dto.numberOfGolfers,
        notes: dto.notes ?? null,
        totalAmount: Math.round(total * 100) / 100,
        items,
      });
      const saved = await manager.save(booking);

      return manager.findOneOrFail(Booking, {
        where: { id: saved.id },
        relations: { items: true },
      });
    });
  }

  // Paginated: GET /booking?page=1&limit=20&customerId=3&status=pending
  async findAll(
    page = 1,
    limit = 20,
    customerId?: number,
    status?: string,
  ): Promise<PaginatedResult<Booking>> {
    if (status !== undefined && !BOOKING_STATUSES.includes(status as BookingStatus)) {
      throw new BadRequestException(
        `status must be one of: ${BOOKING_STATUSES.join(', ')}`,
      );
    }

    const take = Math.min(Math.max(limit, 1), 100);
    const current = Math.max(page, 1);

    const where: FindOptionsWhere<Booking> = {};
    if (customerId !== undefined) where.customerId = customerId;
    if (status !== undefined) where.status = status as BookingStatus;

    const [data, total] = await this.bookingRepo.findAndCount({
      where,
      relations: { items: true },
      order: { teeDate: 'DESC', teeTime: 'DESC', id: 'DESC' },
      skip: (current - 1) * take,
      take,
    });
    return { data, total, page: current, limit: take, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!booking) throw new NotFoundException(`Booking #${id} not found`);
    return booking;
  }

  async update(id: number, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    this.assertEditable(booking);

    if (dto.teeDate !== undefined) {
      this.assertNotInPast(dto.teeDate);
      booking.teeDate = dto.teeDate;
    }
    if (dto.teeTime !== undefined) booking.teeTime = dto.teeTime;
    if (dto.numberOfGolfers !== undefined) booking.numberOfGolfers = dto.numberOfGolfers;
    if (dto.golferCategoryId !== undefined) booking.golferCategoryId = dto.golferCategoryId;
    if (dto.notes !== undefined) booking.notes = dto.notes;
    if (dto.status !== undefined) booking.status = dto.status;

    return this.bookingRepo.save(booking);
  }

  async cancel(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    this.assertEditable(booking);
    booking.status = 'cancelled';
    return this.bookingRepo.save(booking);
  }

  async remove(id: number): Promise<{ deleted: true; id: number }> {
    const booking = await this.findOne(id);
    try {
      await this.bookingRepo.remove(booking);
    } catch (e: unknown) {
      // 23503 = foreign key violation (a payment or review points at this booking)
      const code = (e as { driverError?: { code?: string } })?.driverError?.code;
      if (code === '23503') {
        throw new ConflictException(
          'This booking has payments or reviews and cannot be deleted. Cancel it instead.',
        );
      }
      throw e;
    }
    return { deleted: true, id };
  }

  private async buildItem(
    manager: EntityManager,
    line: CreateBookingItemDto,
  ): Promise<BookingItem> {
    const refs = [line.golfSetId, line.gloveId, line.ballId].filter(
      (value) => value !== undefined,
    );
    if (refs.length !== 1) {
      throw new BadRequestException(
        'Each item must reference exactly one of golfSetId, gloveId or ballId',
      );
    }

    let product: { price: number; currency: string } | null;
    let label: string;
    if (line.golfSetId !== undefined) {
      product = (await manager.findOneBy(GolfSet, { id: line.golfSetId })) as
        unknown as { price: number; currency: string } | null;
      label = `Golf set #${line.golfSetId}`;
    } else if (line.gloveId !== undefined) {
      product = await manager.findOneBy(Glove, { id: line.gloveId }) || null;
      label = `Glove #${line.gloveId}`;
    } else {
      product = await manager.findOneBy(Ball, { id: line.ballId }) || null;
      label = `Ball #${line.ballId}`;
    }

    if (!product) throw new NotFoundException(`${label} not found`);
   

    const item = new BookingItem();
    item.golfSetId = line.golfSetId ?? null;
    item.gloveId = line.gloveId ?? null;
    item.ballId = line.ballId ?? null;
    item.quantity = line.quantity;
    item.unitPrice = product.price;
    return item;
  }

  private assertEditable(booking: Booking): void {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      throw new ConflictException(
        `Booking #${booking.id} is ${booking.status} and can no longer be changed`,
      );
    }
  }

  private assertNotInPast(teeDate: string): void {
    // en-CA formats as YYYY-MM-DD, which compares correctly as a string.
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Thimphu',
    });
    if (teeDate < today) {
      throw new BadRequestException('Tee date cannot be in the past');
    }
  }
}