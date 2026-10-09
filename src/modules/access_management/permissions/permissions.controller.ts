/* eslint-disable prettier/prettier */
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ApiResponse, ok } from 'src/common/api-response';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Controller('permissions')
export class PermissionsController {
  private readonly logger = new Logger(PermissionsController.name);

  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    try {
      const permission = await this.permissionsService.create(createPermissionDto);
      return ok(permission, 'Permission created successfully');
    } catch (error) {
      this.handleError(error, 'create permission');
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<Permission[]>> {
    try {
      const permissions = await this.permissionsService.findAll();
      return ok(permissions, 'Permissions fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch permissions');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Permission>> {
    try {
      const permission = await this.permissionsService.findOne(id);
      return ok(permission, 'Permission fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch permission ${id}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    try {
      const permission = await this.permissionsService.update(id, updatePermissionDto);
      return ok(permission, 'Permission updated successfully');
    } catch (error) {
      this.handleError(error, `update permission ${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      await this.permissionsService.remove(id);
      return ok({ id }, 'Permission deleted successfully');
    } catch (error) {
      this.handleError(error, `delete permission ${id}`);
    }
  }

  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof QueryFailedError) {
      const code = (error.driverError as { code?: string } | undefined)?.code;
      // 23505 = unique violation
      if (code === '23505') {
        throw new ConflictException('A permission with these details already exists');
      }
      // 23503 = foreign key violation (a role still uses this permission)
      if (code === '23503') {
        throw new ConflictException('This permission is still assigned to a role');
      }
    }

    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}