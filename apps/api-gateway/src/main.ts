// Register tsconfig paths for Bun
import 'tsconfig-paths/register';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomLogger } from '@hollowkit/logger';
import { LoggingInterceptor } from '@hollowkit/logger';
import { AllExceptionsFilter } from '@hollowkit/shared';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Initialize custom logger
  const logger = new CustomLogger({
    serviceName: 'API-Gateway',
    level: process.env.LOG_LEVEL || 'info',
  });
  
  app.useLogger(logger);

  // Global middleware
  app.use(helmet());
  app.use(compression());
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('HollowKit API')
    .setDescription('HollowKit Microservices API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.start(`API Gateway is running on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});
