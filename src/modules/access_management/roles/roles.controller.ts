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
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse, ok } from 'src/common/api-response';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Controller('roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto): Promise<ApiResponse<Role>> {
    try {
      const role = await this.rolesService.create(createRoleDto);
      return ok(role, 'Role created successfully');
    } catch (error) {
      this.handleError(error, 'create role');
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<Role[]>> {
    try {
      const roles = await this.rolesService.findAll();
      return ok(roles, 'Roles fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch roles');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Role>> {
    try {
      const role = await this.rolesService.findOne(id);
      return ok(role, 'Role fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch role ${id}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ApiResponse<Role>> {
    try {
      const role = await this.rolesService.update(id, updateRoleDto);
      return ok(role, 'Role updated successfully');
    } catch (error) {
      this.handleError(error, `update role ${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      await this.rolesService.remove(id);
      return ok({ id }, 'Role deleted successfully');
    } catch (error) {
      this.handleError(error, `delete role ${id}`);
    }
  }

  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;
    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}