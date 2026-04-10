import {
  Injectable,
  ForbiddenException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { JwtPayload } from "./JwtAuthGuard.js";

export const ROLES_KEY = "roles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    const { role } = request.user;

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException({
        code: "INSUFFICIENT_ROLE",
        message: `This action requires one of: ${requiredRoles.join(", ")}`,
      });
    }

    return true;
  }
}
