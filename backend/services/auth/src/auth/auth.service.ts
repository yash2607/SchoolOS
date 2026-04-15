import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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

  async sendOtp(
    mobile: string,
    schoolCode?: string,
  ): Promise<{ message: string; expiresIn: number; schoolCode?: string }> {
    await this.otpService.sendOtp(mobile);
    return {
      message: 'OTP sent successfully',
      expiresIn: 300,
      ...(schoolCode ? { schoolCode } : {}),
    };
  }

  async loginWithPassword(identifier: string, password: string, _schoolCode?: string) {
    const normalizedIdentifier = this.normalizeIdentifier(identifier);
    const query = this.userRepo.createQueryBuilder('user');

    if (normalizedIdentifier.type === 'email') {
      query.where('LOWER(user.email) = :identifier', { identifier: normalizedIdentifier.value });
    } else {
      query.where('user.mobileE164 = :identifier', { identifier: normalizedIdentifier.value });
    }

    const user = await query.getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email, phone number, or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password login is not set up for this account yet. Use OTP login first.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email, phone number, or password');
    }

    const school = await this.schoolRepo.findOne({ where: { id: user.schoolId } });
    if (!school) {
      throw new BadRequestException('School record not found for this account');
    }

    return this.issueAuthResponse(user, school);
  }

  async resetPasswordWithOtp(
    mobile: string,
    otp: string,
    newPassword: string,
    schoolCode?: string,
  ) {
    const result = await this.otpService.verifyOtp(mobile, otp);
    if (!result.valid) {
      throw new UnauthorizedException(result.reason ?? 'Invalid OTP');
    }

    if (newPassword.trim().length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const school = await this.findOrCreateActiveSchool(schoolCode);
    let user = await this.userRepo.findOne({ where: { mobileE164: mobile } });

    if (!user) {
      user = this.userRepo.create({
        name: 'New User',
        mobileE164: mobile,
        passwordHash: null,
        role: 'PARENT',
        schoolId: school.id,
        email: null,
        ssoProvider: null,
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.schoolId = user.schoolId ?? school.id;
    user.isActive = true;
    user = await this.userRepo.save(user);

    return this.issueAuthResponse(user, school);
  }

  async verifyOtp(mobile: string, otp: string, schoolCode?: string) {
    const result = await this.otpService.verifyOtp(mobile, otp);
    if (!result.valid) {
      throw new UnauthorizedException(result.reason ?? 'Invalid OTP');
    }

    const school = await this.findOrCreateActiveSchool(schoolCode);

    // Find or create user
    let user = await this.userRepo.findOne({ where: { mobileE164: mobile } });
    if (!user) {
      user = this.userRepo.create({
        name: 'New User',
        mobileE164: mobile,
        passwordHash: null,
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

    return this.issueAuthResponse(user, school);
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

  private normalizeIdentifier(identifier: string):
    | { type: 'email'; value: string }
    | { type: 'mobile'; value: string } {
    const trimmed = identifier.trim();
    if (!trimmed) {
      throw new BadRequestException('Email or phone number is required');
    }

    if (trimmed.includes('@')) {
      return { type: 'email', value: trimmed.toLowerCase() };
    }

    const digits = trimmed.replace(/\D/g, '');
    const mobile = digits.length === 10 ? `+91${digits}` : trimmed;

    if (!/^\+91[6-9]\d{9}$/.test(mobile)) {
      throw new BadRequestException('Enter a valid phone number or email address');
    }

    return { type: 'mobile', value: mobile };
  }

  private async findOrCreateActiveSchool(schoolCode?: string) {
    let school = await this.schoolRepo.findOne({ where: { isActive: true } });
    if (!school) {
      school = this.schoolRepo.create({
        name: schoolCode?.trim() ? `School ${schoolCode.trim()}` : 'Demo School',
        timezone: 'Asia/Kolkata',
        logoUrl: null,
      });
      school = await this.schoolRepo.save(school);
    }

    return school;
  }

  private async issueAuthResponse(user: User, school: School) {
    const loginAt = new Date();
    await this.userRepo.update(user.id, { lastLoginAt: loginAt });
    user.lastLoginAt = loginAt;

    const provisionalRefreshToken = this.jwtTokenService.signRefreshToken({
      sub: user.id,
      role: user.role,
      sessionId: 'temp',
      schoolId: user.schoolId,
    });

    const refreshTokenHash = await this.jwtTokenService.hashToken(provisionalRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const session = await this.sessionRepo.save(
      this.sessionRepo.create({
        userId: user.id,
        refreshTokenHash,
        expiresAt,
        revokedAt: null,
      }),
    );

    const refreshToken = this.jwtTokenService.signRefreshToken({
      sub: user.id,
      role: user.role,
      sessionId: session.id,
      schoolId: user.schoolId,
    });

    await this.sessionRepo.update(session.id, {
      refreshTokenHash: await this.jwtTokenService.hashToken(refreshToken),
    });

    const accessToken = this.jwtTokenService.signAccessToken({
      sub: user.id,
      role: user.role,
      sessionId: session.id,
      schoolId: user.schoolId,
    });

    return {
      accessToken,
      refreshToken,
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
}
