import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { Session } from '../entities/session.entity';
import { OtpService } from './otp.service';
import { JwtTokenService } from './jwt-token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(School) private readonly schoolRepo: Repository<School>,
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
    private readonly otpService: OtpService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async sendOtp(mobile: string): Promise<{ message: string; expiresIn: number }> {
    await this.otpService.sendOtp(mobile);
    return { message: 'OTP sent successfully', expiresIn: 300 };
  }

  async verifyOtp(mobile: string, otp: string) {
    const result = await this.otpService.verifyOtp(mobile, otp);
    if (!result.valid) {
      throw new UnauthorizedException(result.reason ?? 'Invalid OTP');
    }

    // Find or create a default school
    let school = await this.schoolRepo.findOne({ where: { isActive: true } });
    if (!school) {
      school = this.schoolRepo.create({
        name: 'Demo School',
        timezone: 'Asia/Kolkata',
        logoUrl: null,
      });
      school = await this.schoolRepo.save(school);
    }

    // Find or create user
    let user = await this.userRepo.findOne({ where: { mobileE164: mobile } });
    if (!user) {
      user = this.userRepo.create({
        name: 'New User',
        mobileE164: mobile,
        role: 'PARENT',
        schoolId: school.id,
        email: null,
        ssoProvider: null,
      });
      user = await this.userRepo.save(user);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    // Create session
    const refreshToken = this.jwtTokenService.signRefreshToken({
      sub: user.id,
      role: user.role,
      sessionId: 'temp',
      schoolId: user.schoolId,
    });

    const refreshTokenHash = await this.jwtTokenService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const session = await this.sessionRepo.save(
      this.sessionRepo.create({
        userId: user.id,
        refreshTokenHash,
        expiresAt,
        revokedAt: null,
      })
    );

    // Re-sign refresh token with real sessionId
    const finalRefreshToken = this.jwtTokenService.signRefreshToken({
      sub: user.id,
      role: user.role,
      sessionId: session.id,
      schoolId: user.schoolId,
    });
    await this.sessionRepo.update(session.id, {
      refreshTokenHash: await this.jwtTokenService.hashToken(finalRefreshToken),
    });

    const accessToken = this.jwtTokenService.signAccessToken({
      sub: user.id,
      role: user.role,
      sessionId: session.id,
      schoolId: user.schoolId,
    });

    return {
      accessToken,
      refreshToken: finalRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        sessionId: session.id,
        email: user.email,
        mobileE164: user.mobileE164,
        ssoProvider: user.ssoProvider,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      school: {
        id: school.id,
        name: school.name,
        timezone: school.timezone,
        logoUrl: school.logoUrl,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['school'],
    });
    if (!user) throw new UnauthorizedException('User not found');

    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
        email: user.email,
        mobileE164: user.mobileE164,
        ssoProvider: user.ssoProvider,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      school: {
        id: user.school.id,
        name: user.school.name,
        timezone: user.school.timezone,
        logoUrl: user.school.logoUrl,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; sessionId: string; role: string; schoolId: string };
    try {
      payload = this.jwtTokenService.verifyRefreshToken(refreshToken) as typeof payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionRepo.findOne({ where: { id: payload['sessionId'] } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const valid = await this.jwtTokenService.compareToken(refreshToken, session.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const newAccessToken = this.jwtTokenService.signAccessToken({
      sub: payload['sub'],
      role: payload['role'],
      sessionId: payload['sessionId'],
      schoolId: payload['schoolId'],
    });

    return { accessToken: newAccessToken };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, { revokedAt: new Date() });
  }
}
