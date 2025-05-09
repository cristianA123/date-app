import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreateTagDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  // Opcional: si quieres que el admin pueda definir el estado inicial
  @IsOptional()
  isActive?: boolean;
}
