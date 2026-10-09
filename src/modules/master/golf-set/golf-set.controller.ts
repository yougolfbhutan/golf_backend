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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryFailedError } from 'typeorm';
import { ApiResponse, ok, PaginatedResult } from 'src/common/api-response';
import { optionalImagePipe } from '../image-file.pipe';
import { GolfSetService } from './golf-set.service';
import { CreateGolfSetDto } from './dto/create-golf-set.dto';
import { UpdateGolfSetDto } from './dto/update-golf-set.dto';
import { GolfSet } from './entities/golf-set.entity';

@Controller('golf-set')
export class GolfSetController {
  private readonly logger = new Logger(GolfSetController.name);

  constructor(private readonly golfSetService: GolfSetService) {}

  // multipart/form-data: text fields + optional file part named "image"
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createGolfSetDto: CreateGolfSetDto,
    @UploadedFile(optionalImagePipe) image?: Express.Multer.File,
  ): Promise<ApiResponse<GolfSet>> {
    try {
      const golfSet = await this.golfSetService.create(createGolfSetDto, image);
      return ok(golfSet, 'Golf set created successfully');
    } catch (error) {
      this.handleError(error, 'create golf set');
    }
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('audienceId', new ParseIntPipe({ optional: true })) audienceId?: number,
  ): Promise<ApiResponse<PaginatedResult<GolfSet>>> {
    try {
      const result = await this.golfSetService.findAll(page, limit, audienceId);
      return ok(result, 'Golf sets fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch golf sets');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<GolfSet>> {
    try {
      const golfSet = await this.golfSetService.findOne(id);
      return ok(golfSet, 'Golf set fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch golf set #${id}`);
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGolfSetDto: UpdateGolfSetDto,
    @UploadedFile(optionalImagePipe) image?: Express.Multer.File,
  ): Promise<ApiResponse<GolfSet>> {
    try {
      const golfSet = await this.golfSetService.update(id, updateGolfSetDto, image);
      return ok(golfSet, 'Golf set updated successfully');
    } catch (error) {
      this.handleError(error, `update golf set #${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await this.golfSetService.remove(id);
      return ok({ id }, 'Golf set deleted successfully');
    } catch (error) {
      this.handleError(error, `delete golf set #${id}`);
    }
  }

  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof QueryFailedError) {
      const code = (error.driverError as { code?: string } | undefined)?.code;
      if (code === '23503') {
        throw new BadRequestException('Referenced audience does not exist');
      }
      if (code === '23514') {
        throw new BadRequestException('Quantity and price cannot be negative');
      }
    }

    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}