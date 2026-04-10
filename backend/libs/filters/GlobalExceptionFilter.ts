import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import type { ApiError } from "@schoolos/types";

/**
 * Catches ALL exceptions and formats them into the standard ApiError shape.
 * Tech Spec Section 5.3 — NEVER expose stack traces to clients.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const requestId =
      (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected error occurred";
    let details: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === "string") {
        message = response;
      } else if (typeof response === "object" && response !== null) {
        const r = response as Record<string, unknown>;
        message = (r["message"] as string) ?? message;
        code = (r["code"] as string) ?? this.statusToCode(status);

        // Handle class-validator validation errors
        if (Array.isArray(r["message"])) {
          message = "Validation failed";
          details = { _errors: r["message"] as string[] };
        }

        if (r["details"] && typeof r["details"] === "object") {
          details = r["details"] as Record<string, string[]>;
        }
      }

      code = this.statusToCode(status);
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
        { requestId }
      );
    }

    const errorBody: ApiError = {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
        requestId,
        timestamp,
      },
    };

    res.status(status).json(errorBody);
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: "VALIDATION_ERROR",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      429: "RATE_LIMITED",
      503: "SERVICE_UNAVAILABLE",
    };
    return map[status] ?? "INTERNAL_SERVER_ERROR";
  }
}
