export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GrpcConfig {
  host: string;
  port: number;
  package: string;
  protoPath: string;
}
