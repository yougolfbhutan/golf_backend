/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepo.create(createPermissionDto);
    try {
      return await this.permissionRepo.save(permission);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission ${id} not found`);
    }
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    // merge skips undefined values, so a partial update never blanks a column
    this.permissionRepo.merge(permission, updatePermissionDto);
    try {
      return await this.permissionRepo.save(permission);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    try {
      await this.permissionRepo.remove(permission);
    } catch (e: unknown) {
      // 23503 = foreign key violation (a role still uses this permission)
      if (this.pgCode(e) === '23503') {
        throw new ConflictException('This permission is still assigned to a role');
      }
      throw e;
    }
  }

  private rethrowDuplicate(e: unknown): void {
    // 23505 = unique violation
    if (this.pgCode(e) === '23505') {
      throw new ConflictException('A permission with these details already exists');
    }
  }

  private pgCode(e: unknown): string | undefined {
    return (e as { driverError?: { code?: string } })?.driverError?.code;
  }
}
