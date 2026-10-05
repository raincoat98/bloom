import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Pool } from 'pg';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { config } from './config';
import { migrate } from './database/db';
import { PG_POOL } from './database/database.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.enableCors({ origin: config.corsOrigins });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  await migrate(app.get<Pool>(PG_POOL));
  await app.listen(config.port, '0.0.0.0');

  new Logger('Bootstrap').log(`bloom backend listening on 0.0.0.0:${config.port}`);
}

void bootstrap();