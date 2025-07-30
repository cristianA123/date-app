import { Module, forwardRef } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from 'src/prisma-orm/prisma-orm.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [PrismaModule, forwardRef(() => CreditsModule)],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
