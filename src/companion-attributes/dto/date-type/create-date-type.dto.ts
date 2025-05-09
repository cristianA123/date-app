import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateDateTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  // Opcional: si necesitas campos adicionales
  @IsOptional()
  requiresVerification?: boolean;
}
