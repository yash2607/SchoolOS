export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface IdempotentRequest {
  /** Unique key to prevent duplicate operations (required for payments) */
  idempotencyKey: string;
}
