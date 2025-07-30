import { Module, forwardRef } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PaymentsModule } from '../payments/payments.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [
    PaymentsModule,
    forwardRef(() => CreditsModule),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}