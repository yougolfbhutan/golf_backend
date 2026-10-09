import { PartialType } from '@nestjs/mapped-types';
import { CreateGloveDto } from './create-glove.dto';

export class UpdateGloveDto extends PartialType(CreateGloveDto) {}
