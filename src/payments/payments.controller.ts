/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Controller, Post, Body, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BookingService } from '../booking/booking.service';
import { CreateBookingWithPaymentDto } from './dto/create-booking-with-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly mercadoPagoService: PaymentsService,
     private readonly bookingService: BookingService, // inyectar BookingService
  ) {}

  /**
   * Endpoint para crear una preferencia de pago de MercadoPago
   * Solo crea la preferencia, no crea la reserva
   */
  @Post('preference')
  async createPreference(@Body() dto: CreatePaymentDto) {
    const preferenceData = {
      items: [
        {
          title: dto.title,
          description: dto.description,
          unit_price: dto.unit_price,
          quantity: dto.quantity,
          currency_id: dto.currency_id || 'PEN',
        },
      ],
      back_urls: {
        success: 'https://q21sd0v1-3000.brs.devtunnels.ms/payments/success',
        failure: 'https://q21sd0v1-3000.brs.devtunnels.ms/payments/failure',
        pending: 'https://q21sd0v1-3000.brs.devtunnels.ms/payments/pending',
      },
      auto_return: 'approved',
      notification_url: 'https://q21sd0v1-3000.brs.devtunnels.ms/payments/webhook',
    };
    return await this.mercadoPagoService.createPreference(preferenceData);
  }

  /**
   * Endpoint para crear una reserva y asociar el pago
   * Aquí deberías recibir el bookingDto y los datos de pago
   */
  @Post('booking')
  async createBookingWithPayment(@Body() body: CreateBookingWithPaymentDto) {
    const { bookingDto, paymentDto } = body;

    // 1. Crear reserva
    const bookingResponse = await this.bookingService.create({...bookingDto});
    const booking = bookingResponse.data;

    // 2. Generar preferencia con MercadoPago
    const preferenceData = {
      items: [
        {
          title: paymentDto.title,
          description: paymentDto.description,
          unit_price: paymentDto.unit_price,
          quantity: paymentDto.quantity,
          currency_id: paymentDto.currency_id || 'PEN',
        },
      ],
      back_urls: {
        success: `http://localhost:3000/payments/success?bookingId=${booking.id}`,
        failure: `http://localhost:3000/payments/failure?bookingId=${booking.id}`,
        pending: `http://localhost:3000/payments/pending?bookingId=${booking.id}`,
      },
      // auto_return: 'approved',
      notification_url: `http://localhost:3000/payments/webhook`,
      metadata: {
        bookingId: booking.id,
      },
    };

    const preference = await this.mercadoPagoService.createPreference(preferenceData);

    return {
      booking,
      payment_preference: preference,
    };
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
