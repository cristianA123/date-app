import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => CreditsService))
    private readonly creditsService: CreditsService,
  ) {}

  async processMercadoPagoWebhook(body: any, headers: any) {
    console.log('🔔 Procesando webhook de MercadoPago:', {
      type: body.type,
      action: body.action,
      data: body.data,
      timestamp: new Date().toISOString(),
    });

    // Verificar que sea una notificación de pago
    if (body.type !== 'payment') {
      console.log('ℹ️ Webhook ignorado - no es de tipo payment:', body.type);
      return { status: 'ignored', message: 'Not a payment notification' };
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error('❌ Payment ID no encontrado en webhook');
      return { status: 'error', message: 'Payment ID not found' };
    }

    try {
      console.log('🔍 Consultando pago en MercadoPago:', paymentId);
      
      // Obtener información del pago desde MercadoPago
      const paymentInfo = await this.paymentsService.getPayment(paymentId);
      
      console.log('💳 Información completa del pago:', {
        id: paymentInfo.id,
        status: paymentInfo.status,
        status_detail: paymentInfo.status_detail,
        external_reference: paymentInfo.external_reference,
        // preference_id: paymentInfo.preference_id,
        transaction_amount: paymentInfo.transaction_amount,
        currency_id: paymentInfo.currency_id,
        payment_method_id: paymentInfo.payment_method_id,
        date_created: paymentInfo.date_created,
        date_approved: paymentInfo.date_approved,
        metadata: paymentInfo.metadata,
      });

      // Buscar la transacción por external_reference, preference_id o mercadoPagoId
      const referenceId = paymentInfo.external_reference || 
                        //  paymentInfo.preference_id || 
                         paymentId.toString();
      
      if (!referenceId) {
        console.error('❌ No se encontró referencia para asociar el pago');
        return { status: 'error', message: 'No reference found' };
      }

      console.log('🔍 Buscando transacción con referencia:', referenceId);

      // Procesar según el estado del pago
      let result;
      switch (paymentInfo.status) {
        case 'approved':
          console.log('✅ Pago aprobado, confirmando créditos...');
          try {
            result = await this.creditsService.confirmCreditPurchase(referenceId, 'approved');
            console.log('✅ Créditos confirmados exitosamente:', result);
          } catch (error) {
            console.error('❌ Error confirmando créditos:', error);
            result = { success: false, error: error.message };
          }
          break;
        
        case 'rejected':
        case 'cancelled':
          console.log('❌ Pago rechazado/cancelado, marcando como fallido...');
          try {
            result = await this.creditsService.confirmCreditPurchase(referenceId, 'rejected');
            console.log('❌ Transacción marcada como fallida:', result);
          } catch (error) {
            console.error('❌ Error marcando transacción como fallida:', error);
            result = { success: false, error: error.message };
          }
          break;
        
        case 'pending':
        case 'in_process':
          console.log('⏳ Pago pendiente, manteniendo estado...');
          result = { status: 'pending', message: 'Payment is still pending' };
          break;
        
        default:
          console.log('❓ Estado de pago desconocido:', paymentInfo.status);
          result = { status: 'unknown', message: `Unknown payment status: ${paymentInfo.status}` };
      }

      console.log('🎯 Resultado final del procesamiento:', {
        paymentId,
        status: paymentInfo.status,
        referenceId,
        result,
        timestamp: new Date().toISOString(),
      });

      return { 
        status: 'processed', 
        paymentId,
        paymentStatus: paymentInfo.status,
        referenceId,
        result 
      };

    } catch (error) {
      console.error('❌ Error procesando webhook de MercadoPago:', {
        error: error.message,
        stack: error.stack,
        paymentId,
        timestamp: new Date().toISOString(),
      });
      return { status: 'error', message: error.message, paymentId };
    }
  }
}