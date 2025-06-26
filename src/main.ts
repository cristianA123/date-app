import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: 'GET, POST, PUT, DELETE, PATCH',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-token'],
  credentials: true,
  });
  app.setGlobalPrefix("api")
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no incluidas en el DTO
      forbidNonWhitelisted: true, // Rechaza requests con propiedades no permitidas
      transform: true, // Transforma los tipos automáticamente
    }),
  );
  await app.listen(process.env.PORT ?? 5000);
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap application:', error);
  process.exit(1);
});
