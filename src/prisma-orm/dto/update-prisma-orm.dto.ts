import { PartialType } from '@nestjs/mapped-types';
import { CreatePrismaOrmDto } from './create-prisma-orm.dto';

export class UpdatePrismaOrmDto extends PartialType(CreatePrismaOrmDto) {}
