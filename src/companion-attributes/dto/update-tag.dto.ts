import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateTagDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  isActive?: boolean;
}
