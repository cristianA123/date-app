import { Module } from '@nestjs/common';
import { CompanionService } from './companion.service';
import { CompanionController } from './companion.controller';
import { PrismaModule } from 'src/prisma-orm/prisma-orm.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanionController],
  providers: [CompanionService],
})
export class CompanionModule {}
