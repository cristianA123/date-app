import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no incluidas en el DTO
      forbidNonWhitelisted: true, // Rechaza requests con propiedades no permitidas
      // transform: true, // Transforma los tipos automáticamente
    }),
  );
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap().catch((error) => {
  console.error('Failed to bootstrap application:', error);
  process.exit(1);
});
