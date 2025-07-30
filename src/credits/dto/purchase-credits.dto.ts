import { IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class PurchaseCreditsDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => Math.round(value * 100) / 100)
  amount: number;
}