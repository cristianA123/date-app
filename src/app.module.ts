import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma-orm/prisma-orm.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaInterceptor } from './common/interceptors/prisma.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CompanionModule } from './companion/companion.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { CompanionAttributesModule } from './companion-attributes/companion-attributes.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingModule } from './booking/booking.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ImageUploadModule } from './image-upload/image-upload.module';
import { TasksModule } from './tasks/tasks.module';
import { CreditsModule } from './credits/credits.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    MulterModule.register({
      dest: './uploads', // Directorio donde se guardarán los archivos subidos
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    CompanionModule,
    CompanionAttributesModule,
    PaymentsModule,
    BookingModule,
    ImageUploadModule,
    TasksModule,
    CreditsModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrismaInterceptor,
    },
  ],
})
export class AppModule {}
