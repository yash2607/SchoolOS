import {
  createParamDecorator,
  SetMetadata,
  type ExecutionContext,
} from "@nestjs/common";
import type { Request } from "express";
import type { JwtPayload } from "../guards/JwtAuthGuard.js";
import { IS_PUBLIC_KEY } from "../guards/JwtAuthGuard.js";
import { ROLES_KEY } from "../guards/RolesGuard.js";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    return request.user;
  }
);

export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    return request.user.schoolId;
  }
);
