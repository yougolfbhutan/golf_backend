/* eslint-disable prettier/prettier */
import {
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
} from '@nestjs/common';
import { ApiResponse, ok } from 'src/common/api-response';
import { GolferCategoryService } from './golfer-category.service';
import { CreateGolferCategoryDto } from './dto/create-golfer-category.dto';
import { UpdateGolferCategoryDto } from './dto/update-golfer-category.dto';
import { GolferCategory } from './entities/golfer-category.entity';

@Controller('golfer-category')
export class GolferCategoryController {
  private readonly logger = new Logger(GolferCategoryController.name);

  constructor(private readonly categoryService: GolferCategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateGolferCategoryDto): Promise<ApiResponse<GolferCategory>> {
    try {
      const category = await this.categoryService.create(dto);
      return ok(category, 'Golfer category created successfully');
    } catch (error) {
      this.handleError(error, 'create golfer category');
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<GolferCategory[]>> {
    try {
      const categories = await this.categoryService.findAll();
      return ok(categories, 'Golfer categories fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch golfer categories');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<GolferCategory>> {
    try {
      const category = await this.categoryService.findOne(id);
      return ok(category, 'Golfer category fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch golfer category #${id}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGolferCategoryDto,
  ): Promise<ApiResponse<GolferCategory>> {
    try {
      const category = await this.categoryService.update(id, dto);
      return ok(category, 'Golfer category updated successfully');
    } catch (error) {
      this.handleError(error, `update golfer category #${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await this.categoryService.remove(id);
      return ok({ id }, 'Golfer category deleted successfully');
    } catch (error) {
      this.handleError(error, `delete golfer category #${id}`);
    }
  }

  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;
    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}