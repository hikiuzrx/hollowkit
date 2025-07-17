export const SERVICES = {
  USER_SERVICE: 'USER_SERVICE',
  AUTH_SERVICE: 'AUTH_SERVICE',
  NOTIFICATION_SERVICE: 'NOTIFICATION_SERVICE',
} as const;

export const GRPC_PACKAGES = {
  USER: 'user',
  AUTH: 'auth',
  NOTIFICATION: 'notification',
} as const;

export const GRPC_PORTS = {
  USER_SERVICE: 50051,
  AUTH_SERVICE: 50052,
  NOTIFICATION_SERVICE: 50053,
} as const;

export const HTTP_PORTS = {
  API_GATEWAY: 3000,
  USER_SERVICE: 3001,
  AUTH_SERVICE: 3002,
  NOTIFICATION_SERVICE: 3003,
} as const;

export type ServiceName = keyof typeof SERVICES;
