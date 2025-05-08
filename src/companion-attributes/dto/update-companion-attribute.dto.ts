import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanionAttributeDto } from './create-companion-attribute.dto';

export class UpdateCompanionAttributeDto extends PartialType(
  CreateCompanionAttributeDto,
) {}
