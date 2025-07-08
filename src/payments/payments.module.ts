import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BookingService } from 'src/booking/booking.service';
import { PrismaModule } from '../prisma-orm/prisma-orm.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService,BookingService],
})
export class PaymentsModule {}
