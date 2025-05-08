import { Module } from '@nestjs/common';
import { CompanionAttributesService } from './companion-attributes.service';
import { CompanionAttributesController } from './companion-attributes.controller';
import { PrismaModule } from 'src/prisma-orm/prisma-orm.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanionAttributesController],
  providers: [CompanionAttributesService],
})
export class CompanionAttributesModule {}
