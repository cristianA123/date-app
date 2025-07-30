import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Campos de disponibilidad semanal para acompañantes
  @IsOptional()
  @IsBoolean()
  availableMonday?: boolean;

  @IsOptional()
  @IsBoolean()
  availableTuesday?: boolean;

  @IsOptional()
  @IsBoolean()
  availableWednesday?: boolean;

  @IsOptional()
  @IsBoolean()
  availableThursday?: boolean;

  @IsOptional()
  @IsBoolean()
  availableFriday?: boolean;

  @IsOptional()
  @IsBoolean()
  availableSaturday?: boolean;

  @IsOptional()
  @IsBoolean()
  availableSunday?: boolean;
}
