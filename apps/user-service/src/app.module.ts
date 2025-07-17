import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@hollowkit/logger';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule.forRoot({
      serviceName: 'User-Service',
      level: process.env.LOG_LEVEL || 'info',
    }),
    PrismaModule,
    UserModule,
  ],
})
export class AppModule {}
