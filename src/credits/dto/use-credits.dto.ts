import { IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UseCreditsDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Transform(({ value }) => Math.round(value * 100) / 100)
  amount: number;
}