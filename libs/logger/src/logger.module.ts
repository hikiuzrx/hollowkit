import { Module, DynamicModule, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { CustomLogger, LoggerConfig } from './logger.service';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(config: LoggerConfig = {}): DynamicModule {
    const loggerProvider = {
      provide: CustomLogger,
      useFactory: () => new CustomLogger(config),
    };

    return {
      module: LoggerModule,
      providers: [loggerProvider],
      exports: [CustomLogger],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => LoggerConfig | Promise<LoggerConfig>;
    inject?: any[];
  }): DynamicModule {
    const loggerProvider = {
      provide: CustomLogger,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);
        return new CustomLogger(config);
      },
      inject: options.inject || [],
    };

    return {
      module: LoggerModule,
      providers: [loggerProvider],
      exports: [CustomLogger],
    };
  }
}
