// companion-profile/dto/create-companion-profile.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

export class CreateCompanionDto {
  @IsInt()
  userId: number;

  @IsString()
  name: string;

  @IsInt()
  @Min(18)
  age: number;

  @IsString()
  department: string;

  @IsString()
  district: string;

  @IsString()
  description: string;

  @IsString()
  sexualOrientation: string;

  @IsString()
  gender: string;

  @IsNumber()
  height: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  contry?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsString()
  availableFrom: string;

  @IsOptional()
  @IsString()
  availableUntil?: string;

  @IsOptional()
  @IsInt()
  maxBookingHours?: number;
}
