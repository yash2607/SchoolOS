export interface ApiSuccessResponse<T> {
  data: T;
  requestId?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total?: number;
  requestId?: string;
}
