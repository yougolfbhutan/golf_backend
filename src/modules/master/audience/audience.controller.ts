/* eslint-disable prettier/prettier */
import {
  Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, InternalServerErrorException,
  Logger, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { AudienceService } from './audience.service';
import { CreateAudienceDto } from './dto/create-audience.dto';
import { UpdateAudienceDto } from './dto/update-audience.dto';
import { Audience } from './entities/audience.entity'; // adjust to where your Audience entity lives
import { ApiResponse, ok } from 'src/common/api-response';

@Controller('audience')
export class AudienceController {
  private readonly logger = new Logger(AudienceController.name);

  constructor(private readonly audienceService: AudienceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAudienceDto: CreateAudienceDto): Promise<ApiResponse<Audience>> {
    try {
      const audience = await this.audienceService.create(createAudienceDto);
      return ok(audience, 'Audience created successfully');
    } catch (error) {
      this.handleError(error, 'create audience');
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<Audience[]>> {
    try {
      const audiences = await this.audienceService.findAll();
      return ok(audiences, 'Audiences fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch audiences');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Audience>> {
    try {
      const audience = await this.audienceService.findOne(id);
      return ok(audience, 'Audience fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch audience #${id}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAudienceDto: UpdateAudienceDto,
  ): Promise<ApiResponse<Audience>> {
    try {
      const audience = await this.audienceService.update(id, updateAudienceDto);
      return ok(audience, 'Audience updated successfully');
    } catch (error) {
      this.handleError(error, `update audience #${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await this.audienceService.remove(id);
      return ok({ id }, 'Audience deleted successfully');
    } catch (error) {
      this.handleError(error, `delete audience #${id}`);
    }
  }

  // Known errors (404, 409, 400...) pass through unchanged.
  // Anything unexpected is logged in full but returns a safe 500 to the client.
  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;
    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}