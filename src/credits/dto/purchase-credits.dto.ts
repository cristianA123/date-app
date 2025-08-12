import { IsNumber, Min, Max, IsString, IsBoolean, IsIn, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

const VALID_PACKAGE_IDS = ['starter', 'popular', 'value', 'premium', 'custom'];

export class PurchaseCreditsDto {
  @IsString()
  @IsIn(VALID_PACKAGE_IDS)
  @Transform(({ value }) => value.trim())
  packageId: string;

  @ValidateIf((o) => o.packageId === 'custom')
  @IsNumber()
  @Min(1)
  @Max(1000)
  amount?: number;
}