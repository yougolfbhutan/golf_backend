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
import { GreenFeeService } from './green-fee.service';
import { CreateGreenFeeDto } from './dto/create-green-fee.dto';
import { UpdateGreenFeeDto } from './dto/update-green-fee.dto';
import { GreenFee } from './entities/green-fee.entity';

@Controller('green-fee')
export class GreenFeeController {
  private readonly logger = new Logger(GreenFeeController.name);

  constructor(private readonly greenFeeService: GreenFeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createGreenFeeDto: CreateGreenFeeDto): Promise<ApiResponse<GreenFee>> {
    try {
      const greenFee = await this.greenFeeService.create(createGreenFeeDto);
      return ok(greenFee, 'Green fee created successfully');
    } catch (error) {
      this.handleError(error, 'create green fee');
    }
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('golfCourseId', new ParseIntPipe({ optional: true })) golfCourseId?: number,
    @Query('golferCategoryId', new ParseIntPipe({ optional: true })) golferCategoryId?: number,
    @Query('currency') currency?: string,
  ): Promise<ApiResponse<PaginatedResult<GreenFee>>> {
    try {
      const result = await this.greenFeeService.findAll(
        page,
        limit,
        golfCourseId,
        golferCategoryId,
        currency,
      );
      return ok(result, 'Green fees fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch green fees');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<GreenFee>> {
    try {
      const greenFee = await this.greenFeeService.findOne(id);
      return ok(greenFee, 'Green fee fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch green fee #${id}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGreenFeeDto: UpdateGreenFeeDto,
  ): Promise<ApiResponse<GreenFee>> {
    try {
      const greenFee = await this.greenFeeService.update(id, updateGreenFeeDto);
      return ok(greenFee, 'Green fee updated successfully');
    } catch (error) {
      this.handleError(error, `update green fee #${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await this.greenFeeService.remove(id);
      return ok({ id }, 'Green fee deleted successfully');
    } catch (error) {
      this.handleError(error, `delete green fee #${id}`);
    }
  }

  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof QueryFailedError) {
      const code = (error.driverError as { code?: string } | undefined)?.code;
      if (code === '23503') {
        throw new BadRequestException('Golf course or golfer category does not exist');
      }
      if (code === '23514') {
        throw new BadRequestException('Amount cannot be negative');
      }
    }

    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}