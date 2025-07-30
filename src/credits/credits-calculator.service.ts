import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';

export interface CreditCalculationResult {
  requiredCredits: number;
  hourlyRate: number;
  durationHours: number;
  totalCostPen: number;
  creditRate: number; // Tasa de conversión PEN a créditos
}

@Injectable()
export class CreditsCalculatorService {
  // Tasa de conversión: 1 PEN = 10 créditos (ajustable)
  private readonly CREDIT_RATE = 10;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula los créditos necesarios para una reserva basado en el hourlyRate del acompañante
   */
  async calculateCreditsForBooking(
    companionId: number,
    durationHours: number
  ): Promise<CreditCalculationResult> {
    // Obtener el perfil del acompañante
    const companionProfile = await this.prisma.companionProfile.findUnique({
      where: { id: companionId },
      select: {
        hourlyRate: true,
        price: true, // precio base como fallback
      },
    });

    if (!companionProfile) {
      throw new Error(`Companion profile with ID ${companionId} not found`);
    }

    // Usar hourlyRate si está disponible, sino usar price como fallback
    const hourlyRate = companionProfile.hourlyRate || companionProfile.price;
    
    if (!hourlyRate || hourlyRate <= 0) {
      throw new Error(`Invalid hourly rate for companion ${companionId}`);
    }

    // Calcular el costo total en PEN
    const totalCostPen = hourlyRate * durationHours;

    // Convertir a créditos
    const requiredCredits = Math.ceil(totalCostPen * this.CREDIT_RATE);

    return {
      requiredCredits,
      hourlyRate,
      durationHours,
      totalCostPen,
      creditRate: this.CREDIT_RATE,
    };
  }

  /**
   * Calcula los créditos necesarios basado en un monto específico en PEN
   */
  calculateCreditsFromAmount(amountPen: number): number {
    return Math.ceil(amountPen * this.CREDIT_RATE);
  }

  /**
   * Convierte créditos a PEN
   */
  convertCreditsToAmount(credits: number): number {
    return credits / this.CREDIT_RATE;
  }

  /**
   * Verifica si un usuario tiene suficientes créditos
   */
  async hasEnoughCredits(userId: number, requiredCredits: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const userCredits = user.credits || 0;
    return userCredits >= requiredCredits;
  }

  /**
   * Deduce créditos de un usuario
   */
  async deductCredits(userId: number, creditsToDeduct: number): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const currentCredits = user.credits || 0;
    
    if (currentCredits < creditsToDeduct) {
      throw new Error(`Insufficient credits. Required: ${creditsToDeduct}, Available: ${currentCredits}`);
    }

    const newCreditsBalance = currentCredits - creditsToDeduct;

    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: newCreditsBalance },
    });

    return newCreditsBalance;
  }

  /**
   * Agrega créditos a un usuario
   */
  async addCredits(userId: number, creditsToAdd: number): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const currentCredits = user.credits || 0;
    const newCreditsBalance = currentCredits + creditsToAdd;

    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: newCreditsBalance },
    });

    return newCreditsBalance;
  }

  /**
   * Obtiene el balance de créditos de un usuario
   */
  async getUserCreditsBalance(userId: number): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user.credits || 0;
  }
}