import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  async getUserCredits(@Request() req) {
    return this.creditsService.getUserCredits(parseInt(req.user.userId));
  }

  @Post('purchase')
  async purchaseCredits(@Request() req, @Body() purchaseData: PurchaseCreditsDto) {
    return this.creditsService.purchaseCredits(parseInt(req.user.userId), purchaseData);
  }

  @Post('confirm-payment')
  async confirmPayment(@Body() confirmData: { paymentId: string; status: string; preferenceId?: string }) {
    const { paymentId, status, preferenceId } = confirmData;
    
    // Usar preferenceId si está disponible, sino usar paymentId
    const referenceId = preferenceId || paymentId;
    
    return this.creditsService.confirmCreditPurchase(referenceId, status);
  }

  @Post('use')
  async useCredits(@Request() req, @Body() useData: UseCreditsDto) {
    return this.creditsService.useCredits(parseInt(req.user.userId), useData);
  }

  @Get('transactions')
  async getTransactions(@Request() req) {
    return this.creditsService.getCreditTransactions(parseInt(req.user.userId));
  }

  @Get('calculate')
  async calculateCredits(@Query('hours') hours: string) {
    const hoursNum = parseFloat(hours);
    const credits = this.creditsService.calculateCreditsForHours(hoursNum);
    return { hours: hoursNum, credits };
  }

  @Get('calculate-companion/:companionId/:hours')
  async calculateCreditsForCompanion(
    @Param('companionId') companionId: string,
    @Param('hours') hours: string,
  ) {
    const calculation = await this.creditsService.calculateCreditsForCompanion(
      parseInt(companionId),
      parseFloat(hours)
    );
    return { success: true, data: calculation };
  }

  @Get('can-book/:companionId/:hours')
  async canMakeBookingWithCompanion(
    @Request() req,
    @Param('companionId') companionId: string,
    @Param('hours') hours: string,
  ) {
    const result = await this.creditsService.canMakeBookingWithCompanion(
      parseInt(req.user.userId),
      parseInt(companionId),
      parseFloat(hours)
    );
    return { success: true, data: result };
  }

  @Post('process-booking')
  async processBookingWithCredits(
    @Request() req,
    @Body() bookingData: { companionId: number; durationHours: number },
  ) {
    const result = await this.creditsService.processBookingWithCredits(
      parseInt(req.user.userId),
      bookingData.companionId,
      bookingData.durationHours
    );
    return { success: true, data: result };
  }

  @Get('test-mercadopago')
  async testMercadoPago() {
    try {
      // Crear una preferencia de prueba simple
      const testResult = await this.creditsService.testMercadoPagoConnection();
      return { success: true, data: testResult };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        details: 'Error al probar conexión con MercadoPago'
      };
    }
  }
}