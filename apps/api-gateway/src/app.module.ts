import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@hollowkit/logger';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule.forRoot({
      serviceName: 'API-Gateway',
      level: process.env.LOG_LEVEL || 'info',
    }),
    UserModule,
  ],
})
export class AppModule {}
