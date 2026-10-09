import { PartialType } from '@nestjs/mapped-types';
import { CreateGolfSetDto } from './create-golf-set.dto';

export class UpdateGolfSetDto extends PartialType(CreateGolfSetDto) {}
