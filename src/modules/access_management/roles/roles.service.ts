/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissions, ...roleData } = createRoleDto;

    const permissionEntities = permissions
      ? await this.resolvePermissions(permissions)
      : [];

    const role = this.roleRepo.create({
      ...roleData,
      permissions: permissionEntities,
    });

    let saved: Role;
    try {
      saved = await this.roleRepo.save(role);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
    return this.findOne(saved.id);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({ relations: { permissions: true } });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role ${id} not found`);
    }
    return role;
  }

  /**
   * Partial update. Permissions are only touched when `permissions` is sent:
   * omit it to keep them as they are, send [] to clear them.
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    const { permissions, ...roleData } = updateRoleDto;

    // merge skips undefined values, so a partial update never blanks a column
    this.roleRepo.merge(role, roleData);

    if (permissions !== undefined) {
      role.permissions = await this.resolvePermissions(permissions);
    }

    try {
      await this.roleRepo.save(role);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    try {
      await this.roleRepo.remove(role);
    } catch (e: unknown) {
      // 23503 = foreign key violation (users still have this role)
      if (this.pgCode(e) === '23503') {
        throw new ConflictException('This role is still assigned to users');
      }
      throw e;
    }
  }

  /** Loads the permissions for the given ids and fails if any id doesn't exist. */
  private async resolvePermissions(ids: string[]): Promise<Permission[]> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return [];

    const found = await this.permissionRepo.find({ where: { id: In(uniqueIds) } });
    if (found.length !== uniqueIds.length) {
      const foundIds = new Set(found.map((permission) => permission.id));
      const missing = uniqueIds.filter((permissionId) => !foundIds.has(permissionId));
      throw new BadRequestException(`Permission(s) not found: ${missing.join(', ')}`);
    }
    return found;
  }

  private rethrowDuplicate(e: unknown): void {
    // 23505 = unique violation (role name already taken)
    if (this.pgCode(e) === '23505') {
      throw new ConflictException('A role with this name already exists');
    }
  }

  private pgCode(e: unknown): string | undefined {
    return (e as { driverError?: { code?: string } })?.driverError?.code;
  }
}