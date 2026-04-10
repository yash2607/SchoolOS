import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import type { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";

/**
 * Sets PostgreSQL search_path to school_{schoolId}, public
 * schoolId comes from JWT claim (set by JwtAuthGuard first on protected routes)
 * Applied to all routes EXCEPT /api/v1/auth/*
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // schoolId is injected by JwtAuthGuard into req.user
    const user = (req as Request & { user?: { schoolId?: string } }).user;
    const schoolId = user?.schoolId;

    if (schoolId) {
      // Sanitize to prevent SQL injection — schoolId must be alphanumeric+underscore only
      if (!/^[a-zA-Z0-9_]+$/.test(schoolId)) {
        res.status(400).json({
          error: {
            code: "INVALID_TENANT",
            message: "Invalid school identifier",
            requestId: (req.headers["x-request-id"] as string) ?? "",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const schemaName = `school_${schoolId}`;
      await this.dataSource.query(
        `SET search_path TO "${schemaName}", public`
      );
    }

    next();
  }
}
