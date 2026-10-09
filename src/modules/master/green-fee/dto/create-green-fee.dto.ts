import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUppercase,
  Length,
  Min,
} from 'class-validator';

export class CreateGreenFeeDto {
  @IsInt()
  @Min(1)
  golfCourseId!: number;

  @IsInt()
  @Min(1)
  golferCategoryId!: number;

  /** Fee per golfer. */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  /** Defaults to BTN. */
  @IsOptional()
  @IsString()
  @IsUppercase()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
