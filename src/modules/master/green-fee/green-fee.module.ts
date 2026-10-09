import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenFeeController } from './green-fee.controller';
import { GreenFeeService } from './green-fee.service';
import { GreenFee } from './entities/green-fee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GreenFee])],
  controllers: [GreenFeeController],
  providers: [GreenFeeService],
  // BookingModule imports GreenFeeModule to price the green fee on a booking.
  exports: [GreenFeeService],
})
export class GreenFeeModule {}
