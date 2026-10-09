/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { ApiResponse, ok } from 'src/common/api-response';
import { UserService, SafeUser } from './user.service';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../../../authGrard/public.decorator';

// secure + sameSite 'none' are required for cross-site cookies over HTTPS (Railway).
const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 24 * 60 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  // passthrough lets us set cookies while Nest still sends the response,
  // so thrown errors (like a 401) are handled normally.
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<SafeUser>> {
    try {
      const { result, accessToken, refreshToken } = await this.userService.login(loginDto);

      res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);

      return ok(result, 'Login successful');
    } catch (error) {
      this.handleError(error, 'log in');
    }
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<SafeUser>> {
    try {
      const user = await this.userService.create(createUserDto);
      return ok(user, 'User created successfully');
    } catch (error) {
      this.handleError(error, 'create user');
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<SafeUser[]>> {
    try {
      const users = await this.userService.findAll();
      return ok(users, 'Users fetched successfully');
    } catch (error) {
      this.handleError(error, 'fetch users');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<SafeUser>> {
    try {
      const user = await this.userService.findOne(id);
      return ok(user, 'User fetched successfully');
    } catch (error) {
      this.handleError(error, `fetch user ${id}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<SafeUser>> {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return ok(user, 'User updated successfully');
    } catch (error) {
      this.handleError(error, `update user ${id}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      await this.userService.remove(id);
      return ok({ id }, 'User deleted successfully');
    } catch (error) {
      this.handleError(error, `delete user ${id}`);
    }
  }

  private handleError(error: unknown, action: string): never {
    if (error instanceof HttpException) throw error;
    this.logger.error(`Failed to ${action}`, error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException(`Failed to ${action}`);
  }
}