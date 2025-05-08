import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTagDto {
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
