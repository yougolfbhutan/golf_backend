import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [BookingModule, WhatsappModule],
})
export class TransactionModule {}
