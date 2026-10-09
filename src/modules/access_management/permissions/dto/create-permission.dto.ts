/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name!: string; // e.g. "create_user"

  @IsOptional()
  @IsString()
  description?: string;
}