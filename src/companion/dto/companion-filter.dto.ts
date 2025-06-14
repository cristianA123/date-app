import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CompanionFilterDto {
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Type(() => Number)
  minAge?: number;

  @IsOptional()
  @IsNumber()
  @Max(100)
  @Type(() => Number)
  maxAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsString({ each: true })
  dateTypeIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
