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
    console.log('🔧 Inicializando PaymentsService...');
    console.log('🔑 MP_SECRET configurado:', envs.MP_SECRET ? 'SÍ' : 'NO');
    console.log('🔑 MP_SECRET length:', envs.MP_SECRET?.length || 0);
    
    if (!envs.MP_SECRET || envs.MP_SECRET.trim() === '') {
      console.warn('⚠️  MP_SECRET no está configurado. El servicio de pagos funcionará en modo de prueba.');
    }

    try {
      this.client = new MercadoPagoConfig({
        accessToken: envs.MP_SECRET,
        options: { 
          timeout: 10000,
          idempotencyKey: 'mp-idempotency-key',
        },
      });

      this.preference = new Preference(this.client);
      this.payment = new Payment(this.client);
      
      console.log('✅ MercadoPago inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando MercadoPago:', error);
      console.error('Token usado:', envs.MP_SECRET?.substring(0, 20) + '...');
      throw new Error('Error al inicializar el servicio de pagos. Verifica la configuración de MP_SECRET.');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createPreference(preferenceData: any) {
    console.log('🔄 Iniciando creación de preferencia...');
    console.log('📦 Datos recibidos:', JSON.stringify(preferenceData, null, 2));

    try {
      // Validar que tenemos los datos mínimos requeridos
      if (!preferenceData.items || !Array.isArray(preferenceData.items) || preferenceData.items.length === 0) {
        throw new Error('Items son requeridos y deben ser un array no vacío');
      }

      // Validar estructura de items
      preferenceData.items.forEach((item: any, index: number) => {
        if (!item.title || !item.unit_price || !item.quantity) {
          throw new Error(`Item ${index} debe tener title, unit_price y quantity`);
        }
      });

      // Configurar URLs de retorno
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const backUrls = {
        success: `${baseUrl}/credits/success`,
        failure: `${baseUrl}/credits/failure`, 
        pending: `${baseUrl}/credits/pending`,
      };

      // Generar external_reference único
      const externalReference = preferenceData.external_reference || 
        (preferenceData.metadata?.userId ? `user_${preferenceData.metadata.userId}_${Date.now()}` : `ref_${Date.now()}`);

      // Configurar preferencia completa con estructura correcta para MercadoPago
      const fullPreferenceData = {
        items: preferenceData.items.map((item: any) => ({
          title: String(item.title),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          currency_id: item.currency_id || 'PEN',
          description: item.description || item.title,
        })),
        back_urls: backUrls,
        // auto_return: 'approved',
        external_reference: externalReference,
        statement_descriptor: preferenceData.statement_descriptor || 'DATING_APP',
        expires: false,
        // Solo incluir notification_url si está en producción
        ...(process.env.NODE_ENV === 'production' && {
          notification_url: `${process.env.NOTIFICATION_URL || 'http://localhost:4000'}/payments/webhook`,
        }),
        // Incluir metadata si existe
        ...(preferenceData.metadata && {
          metadata: preferenceData.metadata,
        }),
        notification_url: `${process.env.NOTIFICATION_URL || 'http://localhost:4000'}/payments/webhook`,
      };

      console.log('📋 Preferencia final a enviar:', JSON.stringify(fullPreferenceData, null, 2));

      // Intentar crear la preferencia
      console.log('🚀 Enviando solicitud a MercadoPago...');
      const response = await this.preference.create({ body: fullPreferenceData });
      
      console.log('✅ Preferencia creada exitosamente:', {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        external_reference: response.external_reference,
      });

      return response;
    } catch (error) {
      console.error('❌ Error detallado creating preference:', {
        message: error.message,
        status: error.status,
        cause: error.cause,
        stack: error.stack,
      });
      
      // Log adicional para debugging
      if (error.cause) {
        console.error('🔍 Error cause:', error.cause);
      }
      
      // Verificar si es un error de autenticación
      if (error.status === 401 || error.message?.includes('401')) {
        console.error('🔐 Error de autenticación - Verificar MP_SECRET');
        console.error('🔑 Token actual:', envs.MP_SECRET?.substring(0, 20) + '...');
      }

      // En caso de error, devolver datos de prueba para desarrollo
      console.log('🧪 Fallback: Generando preferencia simulada debido a error');
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const fallbackAmount = preferenceData.items?.[0]?.unit_price || 0;
      const fallbackCredits = preferenceData.metadata?.credits || 0;
      
      return {
        id: `FALLBACK-PREF-${Date.now()}`,
        notification_url: `${process.env.NOTIFICATION_URL || 'http://localhost:4000'}/payments/webhook`,
        sandbox_init_point: `${baseUrl}/credits/demo-payment?credits=${fallbackCredits}&amount=${fallbackAmount}&payment_id=FALLBACK-${Date.now()}`,
        items: preferenceData.items,
        back_urls: {
          success: `${baseUrl}/credits/success`,
          failure: `${baseUrl}/credits/failure`,
          pending: `${baseUrl}/credits/pending`,
        },
        metadata: preferenceData.metadata,
        external_reference: `fallback_${Date.now()}`,
        error: 'Modo de desarrollo - Error en MercadoPago',
        original_error: error.message,
      };
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

  // Método de prueba para verificar la configuración
  async testConnection() {
    try {
      console.log('🧪 Probando conexión con MercadoPago...');
      
      // Crear una preferencia de prueba simple
      const testPreference = {
        items: [
          {
            id: 'test-item-1',
            title: 'Test Item',
            quantity: 1,
            unit_price: 1.0,
            currency_id: 'PEN',
          },
        ],
        external_reference: `test_${Date.now()}`,
      };

      const response = await this.preference.create({ body: testPreference });
      
      console.log('✅ Conexión exitosa con MercadoPago:', {
        id: response.id,
        status: 'OK',
      });

      return {
        success: true,
        message: 'Conexión exitosa con MercadoPago',
        preferenceId: response.id,
      };
    } catch (error) {
      console.error('❌ Error en test de conexión:', error);
      return {
        success: false,
        message: 'Error de conexión con MercadoPago',
        error: error.message,
        status: error.status,
      };
    }
  }
}

// create(createPaymentDto: CreatePaymentDto) {
//   console.log(createPaymentDto);
//   return 'This action adds a new payment';
// }
