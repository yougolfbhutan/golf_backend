/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
  ) {}

  create(createStockDto: CreateStockDto) {
    const stock = this.stockRepo.create(createStockDto);
    return this.stockRepo.save(stock);
  }

  // Paginated: GET /stocks?page=1&limit=20
  async findAll(page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 1), 100);
    const current = Math.max(page, 1);
    const [data, total] = await this.stockRepo.findAndCount({
      order: { name: 'ASC' },
      skip: (current - 1) * take,
      take,
    });
    return { data, total, page: current, limit: take, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: number) {
    const stock = await this.stockRepo.findOneBy({ id });
    if (!stock) throw new NotFoundException(`Stock #${id} not found`);
    return stock;
  }

  async update(id: number, updateStockDto: UpdateStockDto) {
    const stock = await this.findOne(id);
    Object.assign(stock, updateStockDto);
    return this.stockRepo.save(stock);
  }

  async remove(id: number) {
    const stock = await this.findOne(id);
    try {
      await this.stockRepo.remove(stock);
    } catch (e: any) {
      // 23503 = foreign key violation (a golf set still uses this stock)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e?.code === '23503') {
        throw new ConflictException('This stock is used by a golf set and cannot be deleted');
      }
      throw e;
    }
    return { deleted: true, id };
  }
}