import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.useLogger(app.get(ConsoleLogger));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
