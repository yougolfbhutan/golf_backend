/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GolfSet } from 'src/modules/master/golf-set/entities/golf-set.entity';
import { Ball } from 'src/modules/master/ball/entities/ball.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { Glove } from 'src/modules/master/gloves/entities/glove.entity';
import { BookingItem } from './entities/booking item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingItem, GolfSet, Glove, Ball])],
  controllers: [BookingController],
  providers: [BookingService],
  // Collection (payment) and Review modules import BookingModule to reach the service.
  exports: [BookingService],
})
export class BookingModule {}