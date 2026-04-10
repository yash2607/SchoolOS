import {
  Injectable,
  Logger,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import type { Request } from "express";

const SENSITIVE_FIELDS = new Set([
  "password",
  "otp",
  "token",
  "refreshToken",
  "mobile",
  "cardNumber",
  "cvv",
  "accountNumber",
  "pin",
  "secret",
]);

function scrubPII(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(scrubPII);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = SENSITIVE_FIELDS.has(key.toLowerCase())
      ? "[REDACTED]"
      : scrubPII(value);
  }
  return result;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const requestId = req.headers["x-request-id"] ?? "-";
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} ${ms}ms [${requestId}]`);
          if (ms > 500) {
            this.logger.warn(`SLOW REQUEST: ${method} ${url} ${ms}ms`);
          }
        },
        error: (error: unknown) => {
          const ms = Date.now() - start;
          const scrubbedBody = scrubPII(req.body);
          this.logger.error(
            `${method} ${url} FAILED ${ms}ms [${requestId}]`,
            { body: scrubbedBody }
          );
        },
      })
    );
  }
}
