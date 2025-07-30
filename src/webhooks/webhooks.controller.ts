import { Controller, Post, Body, Headers, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('mercadopago')
  @HttpCode(HttpStatus.OK)
  async handleMercadoPagoWebhook(
    @Body() body: any,
    @Headers() headers: any,
    @Query() query: any,
  ) {
    console.log('🔔 Webhook de MercadoPago recibido:', {
      body,
      headers: {
        'x-signature': headers['x-signature'],
        'x-request-id': headers['x-request-id'],
      },
      query,
    });

    try {
      const result = await this.webhooksService.processMercadoPagoWebhook(body, headers);
      return result;
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      return { status: 'error', message: error.message };
    }
  }
}