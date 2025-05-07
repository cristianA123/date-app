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

@Module({
  imports: [
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
