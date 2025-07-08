// export class CreateBookingDto {}

import { IsInt, IsDateString, IsString, Min, MaxLength, IsOptional, IsNumber } from 'class-validator'

export class CreateBookingDto {
  @IsInt()
  clientId: number

  @IsInt()
  companionId: number

  @IsInt()
  @IsOptional()
  locationId: number

  @IsDateString()
  date: Date // solo fecha

  @IsString()
  startTime: string // HH:mm

  @IsString()
  endTime: string // HH:mm

  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 },
    { message: 'El monto debe ser un número válido con máximo 2 decimales.' }
  )
  companionAmount: number

  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 },
    { message: 'El amountTotal debe ser un número válido con máximo 2 decimales.' }
  )
  amountTotal: number

  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 },
    { message: 'El monto por hora debe ser un número válido con máximo 2 decimales.' }
  )
  amountPerHour: number

  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 },
    { message: 'El monto de impuesto debe ser un número válido con máximo 2 decimales.' }
  )
  commission: number

  @IsInt()
  @Min(1)
  durationHours: number

  @IsString()
  @MaxLength(30)
  paymentMethod: string // "Yape", "Card", etc.
}
