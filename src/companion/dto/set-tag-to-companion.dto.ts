import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';

class TagIdDto {
  @IsNumber()
  id: number;
}

export class SetTagToUserDto {
  @IsNumber()
  userId: number;

  @ValidateNested({ each: true })
  @Type(() => TagIdDto)
  tagIds: TagIdDto[];
}
