import { Module } from '@nestjs/common';
import { CompanionService } from './companion.service';
import { CompanionController } from './companion.controller';
import { PrismaModule } from 'src/prisma-orm/prisma-orm.module';
import { ImageUploadModule } from 'src/image-upload/image-upload.module';
import { AvailabilityService } from './services/availability.service';

@Module({
  imports: [PrismaModule, ImageUploadModule],
  controllers: [CompanionController],
  providers: [CompanionService, AvailabilityService],
  exports: [AvailabilityService],
})
export class CompanionModule {}
