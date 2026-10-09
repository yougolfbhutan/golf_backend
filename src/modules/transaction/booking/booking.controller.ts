/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ApiResponse, ok, PaginatedResult } from 'src/common/api-response';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';

@Controller('booking')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookingDto: CreateBookingDto): Promise<ApiResponse<Booking>> {
    try {
      const booking = await this.bookingService.create(createBookingDto);
      return ok(booking, 'Booking created successfully');
    } catch (error) {
      this.handleError(error, 'create booking');
    }
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('customerId', new ParseIntPipe({ optional: true })) customerId?: number,
    @Query('status') status?: string,
  ): Promise<ApiResponse<PaginatedResult<Booking>>> {
    try {
      const result = await this.bookingService.findAll(page, limit, customerId, status);
      return ok(result, 'Bookings fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch bookings');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Booking>> {
    try {
      const booking = await this.bookingService.findOne(id);
      return ok(booking, 'Booking fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch booking #${id}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<ApiResponse<Booking>> {
    try {
      const booking = await this.bookingService.update(id, updateBookingDto);
      return ok(booking, 'Booking updated successfully');
    } catch (error) {
      this.handleError(error, `update booking #${id}`);
    }
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Booking>> {
    try {
      const booking = await this.bookingService.cancel(id);
      return ok(booking, 'Booking cancelled successfully');
    } catch (error) {
      this.handleError(error, `cancel booking #${id}`);
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<{ id: number }>> {
    try {
      await this.bookingService.remove(id);
      return ok({ id }, 'Booking deleted successfully');
    } catch (error) {
      this.handleError(error, `delete booking #${id}`);
    }
  }

  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof QueryFailedError) {
      const code = (error.driverError as { code?: string } | undefined)?.code;
      if (code === '23503') {
        throw new BadRequestException(
          'Customer, golf course, golfer category or rental item does not exist',
        );
      }
      if (code === '23514') {
        throw new BadRequestException(
          'A value violates a database rule (check quantity, golfers and amounts)',
        );
      }
    }

    this.logger.error(
      `Failed to ${action}`,
      error instanceof Error ? error.stack : String(error),
    );
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}