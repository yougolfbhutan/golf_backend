/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
console.log('🔐 JWT Access Secret:', process.env.JWT_ACCESS_SECRET);
@Module({
  imports: [
    // 🗄️ Database
    TypeOrmModule.forFeature([User]),

    // 🔐 JWT Module (for login, access + refresh tokens)
    //  JwtModule.register({
    //   secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET',
    //   signOptions: { expiresIn: '15m' },
    // }),
  ],

  controllers: [UserController],
  providers: [UserService],

  exports: [
    UserService
  ],
})
export class UserModule {}