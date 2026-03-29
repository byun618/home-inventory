import { config } from 'dotenv';
import { resolve } from 'path';

// 루트 .env 로드 (로컬 개발용, Docker에서는 environment로 주입)
config({ path: resolve(__dirname, '../../../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors();

  await app.listen(3001);
}

bootstrap();
