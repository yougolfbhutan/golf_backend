import { PartialType } from '@nestjs/mapped-types';
import { CreateBallDto } from './create-ball.dto';

export class UpdateBallDto extends PartialType(CreateBallDto) {}
