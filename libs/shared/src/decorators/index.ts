import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const GrpcMethod = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const rpcContext = ctx.switchToRpc();
    return rpcContext.getContext();
  },
);
