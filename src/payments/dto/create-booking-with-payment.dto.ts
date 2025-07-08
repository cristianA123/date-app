// create-booking-with-payment.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreatePaymentDto } from '../../payments/dto/create-payment.dto';
import { CreateBookingDto } from '../../booking/dto/create-booking.dto';

export class CreateBookingWithPaymentDto {
  @ValidateNested()
  @Type(() => CreateBookingDto)
  bookingDto: CreateBookingDto;

  @ValidateNested()
  @Type(() => CreatePaymentDto)
  paymentDto: CreatePaymentDto;
}