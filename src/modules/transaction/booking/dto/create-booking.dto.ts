import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateBookingItemDto {
  /** Send exactly one of golfSetId, gloveId or ballId. */
  @IsOptional()
  @IsInt()
  @Min(1)
  golfSetId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  gloveId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  ballId?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;
}

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  customerId!: number;

  @IsInt()
  @Min(1)
  golfCourseId!: number;

  @IsInt()
  @Min(1)
  golferCategoryId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'teeDate must be YYYY-MM-DD' })
  @IsISO8601({ strict: true })
  teeDate!: string;

  teeTime!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  numberOfGolfers!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateBookingItemDto)
  items?: CreateBookingItemDto[];

  @IsOptional()
  @IsString()
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}
