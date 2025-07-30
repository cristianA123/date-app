import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma-orm/prisma-orm.service';
import { PaymentsService } from '../payments/payments.service';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';

@Injectable()
export class CreditsService {
  private readonly CREDIT_PRICE_PEN = 1.5;

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async getUserCredits(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { credits: user.credits || 0 };
  }

  async purchaseCredits(userId: number, purchaseData: PurchaseCreditsDto) {
    const totalAmount = Math.round(purchaseData.amount * this.CREDIT_PRICE_PEN * 100) / 100;

    // Generar referencia externa única
    const externalReference = `user_${userId}_${Date.now()}`;

    // Crear preferencia de MercadoPago
    console.log('🔄 Creando preferencia de MercadoPago para créditos...');
    const preference = await this.paymentsService.createPreference({
      items: [
        {
          title: `${purchaseData.amount} Créditos - Dating App`,
          quantity: 1,
          unit_price: totalAmount,
          currency_id: 'PEN',
          description: `Compra de ${purchaseData.amount} créditos para reservas`,
        },
      ],
      metadata: {
        type: 'credits',
        userId: userId.toString(),
        credits: purchaseData.amount.toString(),
        external_reference: externalReference,
      },
      external_reference: externalReference,
      statement_descriptor: 'DATING_APP_CREDITS',
    });

    console.log('📋 Preferencia recibida:', {
      id: preference.id,
      init_point: (preference as any).init_point,
      sandbox_init_point: preference.sandbox_init_point,
      hasError: !!(preference as any).error,
      error: (preference as any).error,
    });

    console.log('💳 Creando transacción de créditos:', {
      userId,
      amount: purchaseData.amount,
      totalAmount,
      preferenceId: preference.id,
      externalReference,
    });

    // Guardar transacción pendiente con referencia externa
    const transaction = await this.prisma.creditTransaction.create({
      data: {
        userId,
        amount: purchaseData.amount,
        totalPricePen: totalAmount,
        status: 'PENDING',
        mercadoPagoId: preference.id || externalReference,
        externalReference,
      },
    });

    return {
      preferenceId: preference.id,
      initPoint: (preference as any).init_point || (preference as any).sandbox_init_point,
      credits: purchaseData.amount,
      totalAmount,
      transactionId: transaction.id,
      externalReference,
    };
  }

  async confirmCreditPurchase(referenceId: string, paymentStatus: string) {
    console.log('🔍 Buscando transacción con referencia:', referenceId);

    // Buscar transacción por mercadoPagoId o externalReference
    let transaction = await this.prisma.creditTransaction.findUnique({
      where: { mercadoPagoId: referenceId },
    });

    // Si no se encuentra por mercadoPagoId, buscar por externalReference
    if (!transaction) {
      transaction = await this.prisma.creditTransaction.findFirst({
        where: { externalReference: referenceId },
      });
    }

    if (!transaction) {
      console.error('❌ Transacción no encontrada para referencia:', referenceId);
      throw new NotFoundException(`Transacción no encontrada para referencia: ${referenceId}`);
    }

    console.log('📋 Transacción encontrada:', {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      status: transaction.status,
      mercadoPagoId: transaction.mercadoPagoId,
      externalReference: transaction.externalReference,
    });

    // Verificar si la transacción ya fue procesada
    if (transaction.status === 'COMPLETED') {
      console.log('⚠️ Transacción ya fue completada anteriormente');
      return { 
        success: true, 
        credits: transaction.amount, 
        message: 'Transacción ya procesada anteriormente',
        alreadyProcessed: true 
      };
    }

    if (paymentStatus === 'approved') {
      console.log('✅ Aprobando pago y agregando créditos...');

      // Actualizar transacción
      await this.prisma.creditTransaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' },
      });

      // Obtener créditos actuales del usuario
      const user = await this.prisma.user.findUnique({
        where: { id: transaction.userId },
        select: { credits: true },
      });

      // Agregar créditos al usuario
      const updatedUser = await this.prisma.user.update({
        where: { id: transaction.userId },
        data: {
          credits: {
            increment: transaction.amount,
          },
        },
        select: { credits: true },
      });

      console.log('💰 Créditos actualizados:', {
        userId: transaction.userId,
        creditosAnteriores: user?.credits || 0,
        creditosAgregados: transaction.amount,
        creditosNuevos: updatedUser.credits,
      });

      return { 
        success: true, 
        credits: transaction.amount,
        creditsAdded: transaction.amount,
        newBalance: updatedUser.credits,
        message: `Se agregaron ${transaction.amount} créditos exitosamente`
      };
    } else {
      console.log('❌ Marcando pago como fallido...');

      await this.prisma.creditTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      return { 
        success: false, 
        message: `Pago ${paymentStatus}: ${this.getPaymentStatusMessage(paymentStatus)}` 
      };
    }
  }

  private getPaymentStatusMessage(status: string): string {
    const statusMessages = {
      'rejected': 'El pago fue rechazado por el banco o por fondos insuficientes',
      'cancelled': 'El pago fue cancelado por el usuario',
      'failed': 'El pago falló durante el procesamiento',
      'pending': 'El pago está pendiente de confirmación',
      'in_process': 'El pago está siendo procesado',
    };

    return statusMessages[status] || `Estado desconocido: ${status}`;
  }

  async useCredits(userId: number, useData: UseCreditsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if ((user.credits || 0) < useData.amount) {
      throw new BadRequestException('Créditos insuficientes');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: useData.amount,
        },
      },
    });

    return { success: true, remainingCredits: (user.credits || 0) - useData.amount };
  }

  async getCreditTransactions(userId: number) {
    return this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  calculateCreditsForHours(hours: number): number {
    // Costo variable entre 1 y 1.5 créditos por hora
    const baseRate = 1;
    const variableRate = 0.5 * Math.random(); // 0 a 0.5
    const creditsPerHour = baseRate + variableRate;
    
    return Math.round(hours * creditsPerHour * 100) / 100;
  }

  /**
   * Calcula los créditos necesarios basado en el hourlyRate del acompañante
   */
  async calculateCreditsForCompanion(companionId: number, durationHours: number) {
    const companion = await this.prisma.companionProfile.findUnique({
      where: { id: companionId },
      select: {
        hourlyRate: true,
        price: true,
        name: true,
      },
    });

    if (!companion) {
      throw new NotFoundException('Acompañante no encontrado');
    }

    // Usar hourlyRate si está disponible, sino usar price como fallback
    const hourlyRate = companion.hourlyRate || companion.price;
    
    if (!hourlyRate || hourlyRate <= 0) {
      throw new BadRequestException(`Tarifa por hora no válida para ${companion.name}`);
    }

    // Calcular el costo total en PEN
    const totalCostPen = hourlyRate * durationHours;

    // Convertir PEN a créditos (1 PEN = 1/CREDIT_PRICE_PEN créditos)
    const requiredCredits = Math.ceil(totalCostPen / this.CREDIT_PRICE_PEN);

    return {
      companionName: companion.name,
      hourlyRate,
      durationHours,
      totalCostPen,
      requiredCredits,
      creditRate: this.CREDIT_PRICE_PEN,
    };
  }

  /**
   * Verifica si un usuario puede hacer una reserva con un acompañante específico
   */
  async canMakeBookingWithCompanion(userId: number, companionId: number, durationHours: number) {
    const calculation = await this.calculateCreditsForCompanion(companionId, durationHours);
    const userCredits = await this.getUserCredits(userId);

    const canAfford = userCredits.credits >= calculation.requiredCredits;

    console.log({calculation, userCredits, canAfford})

    return {
      canMakeBooking: canAfford,
      userCredits: userCredits.credits,
      requiredCredits: calculation.requiredCredits,
      shortfall: canAfford ? 0 : calculation.requiredCredits - userCredits.credits,
      calculation,
    };
  }

  /**
   * Procesa el pago de una reserva usando créditos
   */
  async processBookingWithCredits(userId: number, companionId: number, durationHours: number) {
    const calculation = await this.calculateCreditsForCompanion(companionId, durationHours);
    const userCredits = await this.getUserCredits(userId);

    if (userCredits.credits < calculation.requiredCredits) {
      throw new BadRequestException(
        `Créditos insuficientes. Necesitas ${calculation.requiredCredits} créditos, tienes ${userCredits.credits}`
      );
    }

    // Deducir los créditos
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: calculation.requiredCredits,
        },
      },
    });

    const remainingCredits = userCredits.credits - calculation.requiredCredits;

    return {
      success: true,
      creditsUsed: calculation.requiredCredits,
      remainingCredits,
      calculation,
    };
  }

  /**
   * Método de prueba para verificar la conexión con MercadoPago
   */
  async testMercadoPagoConnection() {
    try {
      console.log('🧪 Probando conexión con MercadoPago desde CreditsService...');
      
      // Crear una preferencia de prueba simple
      const testPreference = await this.paymentsService.createPreference({
        items: [
          {
            title: 'Test - 1 Crédito',
            quantity: 1,
            unit_price: 1.5,
            currency_id: 'PEN',
            description: 'Prueba de conexión con MercadoPago',
          },
        ],
        metadata: {
          type: 'test',
          userId: '999',
          credits: '1',
        },
        external_reference: `test_${Date.now()}`,
        statement_descriptor: 'TEST_DATING_APP',
      });

      return {
        success: !(testPreference as any).error,
        message: (testPreference as any).error ? 'Error en la conexión' : 'Conexión exitosa',
        preferenceId: testPreference.id,
        initPoint: (testPreference as any).init_point,
        sandboxInitPoint: (testPreference as any).sandbox_init_point,
        error: (testPreference as any).error,
        originalError: (testPreference as any).original_error,
      };
    } catch (error) {
      console.error('❌ Error en test de conexión desde CreditsService:', error);
      return {
        success: false,
        message: 'Error al probar conexión con MercadoPago',
        error: error.message,
      };
    }
  }
}