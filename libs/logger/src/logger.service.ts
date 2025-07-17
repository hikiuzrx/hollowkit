import { LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export interface LoggerConfig {
  level?: string;
  serviceName?: string;
  enableConsole?: boolean;
  enableFile?: boolean;
  fileConfig?: {
    dirname?: string;
    filename?: string;
    maxSize?: string;
    maxFiles?: string;
  };
}

export class CustomLogger implements NestLoggerService {
  private logger: winston.Logger;
  private serviceName: string;

  constructor(config: LoggerConfig = {}) {
    this.serviceName = config.serviceName || 'Application';
    this.logger = this.createLogger(config);
  }

  private createLogger(config: LoggerConfig): winston.Logger {
    const { level = 'info', enableConsole = true, enableFile = true, fileConfig = {} } = config;

    const transports: winston.transport[] = [];

    // Console transport with beautiful formatting
    if (enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.colorize({ all: true }),
            winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
              const contextStr = context ? `[${context}]` : `[${this.serviceName}]`;
              const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
              const traceStr = trace ? `\n${trace}` : '';
              
              return `🚀 ${timestamp} ${level} ${contextStr} ${message}${metaStr}${traceStr}`;
            }),
          ),
        }),
      );
    }

    // File transport for persistent logging
    if (enableFile) {
      const {
        dirname = 'logs',
        filename = `${this.serviceName.toLowerCase()}-%DATE%.log`,
        maxSize = '20m',
        maxFiles = '14d',
      } = fileConfig;

      transports.push(
        new DailyRotateFile({
          dirname,
          filename,
          maxSize,
          maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
      );

      // Separate error log
      transports.push(
        new DailyRotateFile({
          dirname,
          filename: `${this.serviceName.toLowerCase()}-error-%DATE%.log`,
          level: 'error',
          maxSize,
          maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
      );
    }

    return winston.createLogger({
      level,
      levels: winston.config.npm.levels,
      transports,
      exitOnError: false,
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom methods for different log types
  http(message: any, context?: string) {
    this.logger.http(message, { context });
  }

  success(message: any, context?: string) {
    this.logger.info(`✅ ${message}`, { context });
  }

  fail(message: any, context?: string) {
    this.logger.error(`❌ ${message}`, { context });
  }

  start(message: any, context?: string) {
    this.logger.info(`🚀 ${message}`, { context });
  }

  complete(message: any, context?: string) {
    this.logger.info(`🎉 ${message}`, { context });
  }

  // Structured logging methods
  logWithMetadata(level: string, message: string, metadata: any, context?: string) {
    this.logger.log(level, message, { context, ...metadata });
  }

  // Performance logging
  timeStart(label: string, context?: string) {
    this.logger.info(`⏱️  Timer started: ${label}`, { context, label, type: 'timer_start' });
    return Date.now();
  }

  timeEnd(label: string, startTime: number, context?: string) {
    const duration = Date.now() - startTime;
    this.logger.info(`⏱️  Timer ended: ${label} (${duration}ms)`, { 
      context, 
      label, 
      duration, 
      type: 'timer_end' 
    });
    return duration;
  }

  // Request/Response logging
  logRequest(method: string, url: string, headers?: any, body?: any, context?: string) {
    this.logger.http(`📥 ${method} ${url}`, {
      context,
      type: 'request',
      method,
      url,
      headers,
      body,
    });
  }

  logResponse(statusCode: number, method: string, url: string, duration: number, context?: string) {
    const emoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    this.logger.http(`📤 ${emoji} ${method} ${url} - ${statusCode} (${duration}ms)`, {
      context,
      type: 'response',
      method,
      url,
      statusCode,
      duration,
    });
  }

  // gRPC specific logging
  logGrpcCall(method: string, service: string, metadata?: any, context?: string) {
    this.logger.info(`🔌 gRPC Call: ${service}.${method}`, {
      context,
      type: 'grpc_call',
      service,
      method,
      metadata,
    });
  }

  logGrpcResponse(method: string, service: string, success: boolean, duration: number, context?: string) {
    const emoji = success ? '✅' : '❌';
    this.logger.info(`🔌 ${emoji} gRPC Response: ${service}.${method} (${duration}ms)`, {
      context,
      type: 'grpc_response',
      service,
      method,
      success,
      duration,
    });
  }
}
