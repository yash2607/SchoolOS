/**
 * Standard API error shape (Tech Spec Section 5.3)
 * ALL API errors must return this exact shape.
 */
export interface ApiError {
  error: {
    /** Machine-readable error code e.g. "ATTENDANCE_ALREADY_SUBMITTED" */
    code: string;
    /** Human-readable message for display */
    message: string;
    /** Field-level validation errors */
    details?: Record<string, string[]>;
    /** Correlates to backend trace for debugging */
    requestId: string;
    /** ISO 8601 timestamp */
    timestamp: string;
  };
}

/** HTTP status to error code mappings */
export const HTTP_ERROR_CODES = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "RATE_LIMITED",
  503: "SERVICE_UNAVAILABLE",
} as const;
