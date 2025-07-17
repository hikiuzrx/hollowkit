import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLogger } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType();
    const startTime = Date.now();

    if (contextType === 'http') {
      return this.handleHttpRequest(context, next, startTime);
    } else if (contextType === 'rpc') {
      return this.handleRpcRequest(context, next, startTime);
    }

    return next.handle();
  }

  private handleHttpRequest(context: ExecutionContext, next: CallHandler, startTime: number): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, headers, body } = request;

    // Log incoming request
    this.logger.logRequest(method, url, headers, body, 'HTTP');

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.logResponse(response.statusCode, method, url, duration, 'HTTP');
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.logResponse(response.statusCode || 500, method, url, duration, 'HTTP');
          this.logger.error(`HTTP Error: ${error.message}`, error.stack, 'HTTP');
        },
      }),
    );
  }

  private handleRpcRequest(context: ExecutionContext, next: CallHandler, startTime: number): Observable<any> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();
    const handler = context.getHandler().name;
    const className = context.getClass().name;

    // Log incoming gRPC call
    this.logger.logGrpcCall(handler, className, data, 'gRPC');

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.logGrpcResponse(handler, className, true, duration, 'gRPC');
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.logGrpcResponse(handler, className, false, duration, 'gRPC');
          this.logger.error(`gRPC Error: ${error.message}`, error.stack, 'gRPC');
        },
      }),
    );
  }
}
