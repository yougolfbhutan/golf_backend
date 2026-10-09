import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUppercase,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGloveDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  audienceId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  size?: string | null;

  @IsOptional()
  @IsIn(['left', 'right'])
  handedness?: 'left' | 'right' | null;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @IsUppercase()
  @Length(3, 3)
  currency?: string;
}
