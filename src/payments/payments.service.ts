/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { envs } from '../config/envs';

@Injectable()
export class PaymentsService {
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;
  private readonly payment: Payment;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken:envs.MP_SECRET, // Cambiado de access_token a accessToken
      options: { timeout: 5000 },
      // Opcional: configuración de timeout
    });

    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createPreference(preferenceData: any) {
    try {
      const response = await this.preference.create({ body: preferenceData }); // Nueva estructura
      return response;
    } catch (error) {
      console.error('Error creating preference:', error);
      throw new Error('Error al crear preferencia de pago');
    }
  }

  async getPayment(paymentId: string) {
    try {
      // Usar this.payment en lugar de this.preference
      const response = await this.payment.get({ id: paymentId });
      return response;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw new Error('Error al obtener información del pago');
    }
  }
}

// create(createPaymentDto: CreatePaymentDto) {
//   console.log(createPaymentDto);
//   return 'This action adds a new payment';
// }
