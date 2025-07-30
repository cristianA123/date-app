import { Module, forwardRef } from '@nestjs/common';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { PrismaModule } from '../prisma-orm/prisma-orm.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PrismaModule, forwardRef(() => PaymentsModule)],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}