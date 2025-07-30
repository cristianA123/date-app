import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma-orm/prisma-orm.module';
import { BookingModule } from '../booking/booking.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [PrismaModule, forwardRef(() => BookingModule), forwardRef(() => CreditsModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
