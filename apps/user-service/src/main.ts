import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { CustomLogger } from '@hollowkit/logger';
import { LoggingInterceptor } from '@hollowkit/logger';
import { GRPC_PORTS } from '@hollowkit/constants';

async function bootstrap() {
  // Initialize custom logger
  const logger = new CustomLogger({
    serviceName: 'User-Service',
    level: process.env.LOG_LEVEL || 'info',
  });

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '../../../libs/proto/user.proto'),
      url: `0.0.0.0:${GRPC_PORTS.USER_SERVICE}`,
    },
    bufferLogs: true,
  });

  app.useLogger(logger);

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  await app.listen();
  
  logger.start(`User Service is running on port ${GRPC_PORTS.USER_SERVICE}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start User Service:', error);
  process.exit(1);
});
