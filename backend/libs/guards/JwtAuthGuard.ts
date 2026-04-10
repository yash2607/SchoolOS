import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

export interface JwtPayload {
  userId: string;
  schoolId: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export const IS_PUBLIC_KEY = "isPublic";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        code: "TOKEN_MISSING",
        message: "Authentication required",
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      // TODO: [PHASE-1] Check Redis blacklist for invalidated tokens
      (request as Request & { user: JwtPayload }).user = payload;
    } catch {
      throw new UnauthorizedException({
        code: "TOKEN_INVALID",
        message: "Invalid or expired token",
      });
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" && token ? token : null;
  }
}
