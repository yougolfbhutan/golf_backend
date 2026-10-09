/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import {
  Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, InternalServerErrorException,
  Logger, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './entities/stock.entity';
import { ApiResponse, ok, PaginatedResult } from 'src/common/api-response';

@Controller('stocks')
export class StocksController {
  private readonly logger = new Logger(StocksController.name);

  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStockDto: CreateStockDto): Promise<ApiResponse<Stock>> {
    try {
      const stock = await this.stocksService.create(createStockDto);
      return ok(stock, 'Stock created successfully');
    } catch (error) {
      this.handleError(error, 'create stock');
    }
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<ApiResponse<PaginatedResult<Stock>>> {
    try {
      const result = await this.stocksService.findAll(page, limit);
      return ok(result, 'Stocks fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch stocks');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Stock>> {
    try {
      const stock = await this.stocksService.findOne(id);
      return ok(stock, 'Stock fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch stock #${id}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<ApiResponse<Stock>> {
    try {
      const stock = await this.stocksService.update(id, updateStockDto);
      return ok(stock, 'Stock updated successfully');
    } catch (error) {
      this.handleError(error, `update stock #${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await this.stocksService.remove(id);
      return ok({ id }, 'Stock deleted successfully');
    } catch (error) {
      this.handleError(error, `delete stock #${id}`);
    }
  }

  // Known errors (404, 409, 400...) pass through unchanged.
  // Anything unexpected is logged in full but returns a safe 500 to the client.
  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;

    this.logger.error(
      `Failed to ${action}`,
      error instanceof Error ? error.stack : String(error),
    );
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}