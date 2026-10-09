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
import { GlovesService } from './gloves.service';
import { CreateGloveDto } from './dto/create-glove.dto';
import { UpdateGloveDto } from './dto/update-glove.dto';
import { Glove } from './entities/glove.entity';

@Controller('glove')
export class GlovesController {
  private readonly logger = new Logger(GlovesController.name);

  constructor(private readonly glovesService: GlovesService) {}

  // multipart/form-data: text fields + optional file part named "image"
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createGloveDto: CreateGloveDto,
    @UploadedFile(optionalImagePipe) image?: Express.Multer.File,
  ): Promise<ApiResponse<Glove>> {
    try {
      const glove = await this.glovesService.create(createGloveDto, image);
      return ok(glove, 'Glove created successfully');
    } catch (error) {
      this.handleError(error, 'create glove');
    }
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('audienceId', new ParseIntPipe({ optional: true })) audienceId?: number,
  ): Promise<ApiResponse<PaginatedResult<Glove>>> {
    try {
      const result = await this.glovesService.findAll(page, limit, audienceId);
      return ok(result, 'Gloves fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch gloves');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Glove>> {
    try {
      const glove = await this.glovesService.findOne(id);
      return ok(glove, 'Glove fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch glove #${id}`);
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGloveDto: UpdateGloveDto,
    @UploadedFile(optionalImagePipe) image?: Express.Multer.File,
  ): Promise<ApiResponse<Glove>> {
    try {
      const glove = await this.glovesService.update(id, updateGloveDto, image);
      return ok(glove, 'Glove updated successfully');
    } catch (error) {
      this.handleError(error, `update glove #${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await this.glovesService.remove(id);
      return ok({ id }, 'Glove deleted successfully');
    } catch (error) {
      this.handleError(error, `delete glove #${id}`);
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
        throw new BadRequestException('Quantity cannot be negative');
      }
    }

    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}