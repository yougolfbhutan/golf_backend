/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { EntityTarget, FindOptionsWhere, In, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

/** A user as returned to clients: never includes the password hash. */
export type SafeUser = Omit<User, 'password'>;

export interface LoginResult {
  result: SafeUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const { roles, permissions, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const roleEntities = roles ? await this.resolveByIds(Role, roles, 'Role') : [];
    const permissionEntities = permissions
      ? await this.resolveByIds(Permission, permissions, 'Permission')
      : [];

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      roles: roleEntities,
      permissions: permissionEntities,
    });

    let saved: User;
    try {
      saved = await this.userRepository.save(user);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
    return this.findOne(saved.id);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.userRepository.find({
      relations: { roles: true, permissions: true },
    });
    return users.map((user) => this.toSafeUser(user));
  }

  async findOne(id: string): Promise<SafeUser> {
    return this.toSafeUser(await this.loadUser(id));
  }

  /**
   * Partial update. Roles and permissions are only touched when they are sent:
   * omit the field to keep them, send [] to clear them.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.loadUser(id);
    const { roles, permissions, password, ...rest } = updateUserDto;

    // merge skips undefined values, so a partial update never blanks a column
    this.userRepository.merge(user, rest);

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (roles !== undefined) {
      user.roles = await this.resolveByIds(Role, roles, 'Role');
    }
    if (permissions !== undefined) {
      user.permissions = await this.resolveByIds(Permission, permissions, 'Permission');
    }

    try {
      await this.userRepository.save(user);
    } catch (e: unknown) {
      this.rethrowDuplicate(e);
      throw e;
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.loadUser(id);
    try {
      await this.userRepository.remove(user);
    } catch (e: unknown) {
      // 23503 = foreign key violation (other records still point at this user)
      if (this.pgCode(e) === '23503') {
        throw new ConflictException(
          'This user is referenced by other records and cannot be deleted. Deactivate the user instead.',
        );
      }
      throw e;
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { email: loginDto.email, is_active: true },
    });

    const passwordMatches = user
      ? await bcrypt.compare(loginDto.password, user.password)
      : false;

    // Same message for "no such user" and "wrong password" so neither is revealed.
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      identification_no: user.identification_no,
      is_verified: user.is_verified,
      is_active: user.is_active,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1600m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { result: this.toSafeUser(user), accessToken, refreshToken };
  }

  private async loadUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true, permissions: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /** Loads the rows for the given ids and fails if any id doesn't exist. */
  private async resolveByIds<T extends { id: string }>(
    entity: EntityTarget<T>,
    ids: string[],
    label: string,
  ): Promise<T[]> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return [];

    const found = await this.userRepository.manager.findBy(entity, {
      id: In(uniqueIds),
    } as FindOptionsWhere<T>);

    if (found.length !== uniqueIds.length) {
      const foundIds = new Set(found.map((row) => row.id));
      const missing = uniqueIds.filter((rowId) => !foundIds.has(rowId));
      throw new BadRequestException(`${label}(s) not found: ${missing.join(', ')}`);
    }
    return found;
  }

  private toSafeUser(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    return safe;
  }

  private rethrowDuplicate(e: unknown): void {
    // 23505 = unique violation (email, employee ID or similar already taken)
    if (this.pgCode(e) === '23505') {
      throw new ConflictException('A user with these details already exists');
    }
  }

  private pgCode(e: unknown): string | undefined {
    return (e as { driverError?: { code?: string } })?.driverError?.code;
  }
}