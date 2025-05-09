import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';

class TagIdDto {
  @IsNumber()
  id: number;
}

export class SetDateTypeToUserDto {
  @IsNumber()
  userId: number;

  @ValidateNested({ each: true })
  @Type(() => TagIdDto)
  dateTypeIds: TagIdDto[];
}
