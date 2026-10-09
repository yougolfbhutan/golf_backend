import { PartialType } from '@nestjs/mapped-types';
import { CreateGolferCategoryDto } from './create-golfer-category.dto';

export class UpdateGolferCategoryDto extends PartialType(CreateGolferCategoryDto) {}
