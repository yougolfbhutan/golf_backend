/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
    IsEmail,
    IsString,
    MinLength,
    IsOptional,
    IsBoolean,
    IsArray,
    IsNotEmpty,
} from 'class-validator';
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email!: string;
 
  @IsString()
  @IsNotEmpty()
  password!: string;
}
export class CreateUserDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    phone_no!: string;

    @IsString()
    identification_no!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsBoolean()
    is_verified?: boolean;

    @IsOptional()
    @IsArray()
    roles?: string[]; 

    @IsOptional()
    @IsArray()
    permissions?: string[]; 
}