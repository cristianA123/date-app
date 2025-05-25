/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Controller, Post, Body, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly mercadoPagoService: PaymentsService) {}

  @Post('create-preference')
  async createPreference(@Body() items: any) {
    console.log(items);
    const preferenceData = {
      // items: [
      //   {
      //     title: 'Producto de prueba',
      //     quantity: 1,
      //     unit_price: 100,
      //     currency_id: 'PEN',
      //   },
      // ],
      items: items,
      back_urls: {
        success: 'http:/payments/success',
        failure: 'https://bddb-201-234-117-65.ngrok-free.app/payments/failure',
        pending: 'https://bddb-201-234-117-65.ngrok-free.app/payments/pending',
      },
      auto_return: 'approved',
      notification_url:
        'https://bddb-201-234-117-65.ngrok-free.app/payments/webhook', // Para recibir notificaciones
    };

    return await this.mercadoPagoService.createPreference(preferenceData);
  }

  @Post('webhook')
  async handleWebhook(@Body() data: any) {
    // // Aquí procesas las notificaciones de pago
    // console.log('Webhook received:', notification);
    // return { status: 'ok' };
    try {
      if (data.type === 'payment') {
        const paymentId = data.data.id;

        // Obtener detalles del pago desde Mercado Pago
        const payment = await this.mercadoPagoService.getPayment(paymentId);
        // const preferenceId = payment.body.preference_id;
        console.log('pago');
        console.log(payment);
        console.log('pago');
        // Actualizar el estado del pago en la base de datos
        // await this.prisma.payment.updateMany({
        //   where: { preferenceId },
        //   data: {
        //     status: this.mapPaymentStatus(payment.body.status),
        //     paymentId: String(paymentId),
        //     paymentDetails: JSON.stringify(payment.body),
        //   },
        // });

        // Aquí puedes agregar lógica adicional según el estado del pago
        // Por ejemplo, activar una suscripción, enviar un correo, etc.
      }

      return { success: true };
    } catch (error) {
      console.error('Error al procesar webhook:', error);
      throw new Error('No se pudo procesar la notificación de pago');
    }
  }
  // necesito saber el identificar del pago para saber si es exitoso o no o que cosas retorno el succes?
  @Get('success')
  handleSuccess() {
    // Aquí puedes redirigir al usuario a una página de éxito
    console.log('Pago exitoso');
    return 'Pago exitoso';
  }
  @Get('failure')
  handleFailure() {
    // Aquí puedes redirigir al usuario a una página de fracaso
    console.log('Pago fallido');
    return 'Pago fallido';
  }
  @Get('pending')
  handlePending() {
    // Aquí puedes redirigir al usuario a una página de pendiente
    console.log('Pago pendiente');
    return 'Pago pendiente';
  }
}
