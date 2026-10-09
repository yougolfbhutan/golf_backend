import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAudienceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name!: string; // e.g. men, women, junior
}
