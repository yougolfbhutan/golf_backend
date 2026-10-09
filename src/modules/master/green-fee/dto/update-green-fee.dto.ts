import { PartialType } from '@nestjs/mapped-types';
import { CreateGreenFeeDto } from './create-green-fee.dto';

export class UpdateGreenFeeDto extends PartialType(CreateGreenFeeDto) {}
