/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import {
  Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, InternalServerErrorException,
  Logger, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BallService } from './ball.service';
import { CreateBallDto } from './dto/create-ball.dto';
import { UpdateBallDto } from './dto/update-ball.dto';
import { Ball } from './entities/ball.entity'; // adjust to where your Ball entity lives
import { ApiResponse, ok, PaginatedResult } from 'src/common/api-response';
import { optionalImagePipe } from '../image-file.pipe';

@Controller('ball')
export class BallController {
  private readonly logger = new Logger(BallController.name);

  constructor(private readonly ballService: BallService) {}

  // multipart/form-data: text fields + optional file part named "image"
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createBallDto: CreateBallDto,
    @UploadedFile(optionalImagePipe) image?: Express.Multer.File,
  ): Promise<ApiResponse<Ball>> {
    try {
      console.log('Received createBallDto:', createBallDto);
      console.log('Received image:', image);
      const ball = await this.ballService.create(createBallDto, image);
      return ok(ball, 'Ball created successfully');
    } catch (error) {
      console.error('Error in create ball:', error);
      this.handleError(error, 'create ball');
    }
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<ApiResponse<PaginatedResult<Ball>>> {
    try {
      const result = await this.ballService.findAll(page, limit);
      return ok(result, 'Balls fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch balls');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Ball>> {
    try {
      const ball = await this.ballService.findOne(id);
      return ok(ball, 'Ball fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch ball #${id}`);
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBallDto: UpdateBallDto,
    @UploadedFile(optionalImagePipe) image?: Express.Multer.File,
  ): Promise<ApiResponse<Ball>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const ball = await this.ballService.update(id, updateBallDto, image);
      return ok(ball, 'Ball updated successfully');
    } catch (error) {
      this.handleError(error, `update ball #${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await this.ballService.remove(id);
      return ok({ id }, 'Ball deleted successfully');
    } catch (error) {
      this.handleError(error, `delete ball #${id}`);
    }
  }

  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;
    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}