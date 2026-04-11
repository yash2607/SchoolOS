import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.provider';

const OTP_TTL = 300; // 5 minutes
const MAX_ATTEMPTS = 5;

interface OtpData {
  otp: string;
  attempts: number;
}

@Injectable()
export class OtpService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(mobile: string): string {
    return `otp:${mobile}`;
  }

  async generateAndStore(mobile: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const data: OtpData = { otp, attempts: 0 };
    await this.redis.set(this.key(mobile), JSON.stringify(data), 'EX', OTP_TTL);
    return otp;
  }

  async verify(mobile: string, otp: string): Promise<{ valid: boolean; reason?: string }> {
    const raw = await this.redis.get(this.key(mobile));
    if (!raw) return { valid: false, reason: 'OTP expired or not sent' };

    const data: OtpData = JSON.parse(raw) as OtpData;

    if (data.attempts >= MAX_ATTEMPTS) {
      return { valid: false, reason: 'Too many attempts' };
    }

    if (data.otp !== otp) {
      data.attempts++;
      const ttl = await this.redis.ttl(this.key(mobile));
      await this.redis.set(this.key(mobile), JSON.stringify(data), 'EX', ttl > 0 ? ttl : OTP_TTL);
      return { valid: false, reason: 'Invalid OTP' };
    }

    await this.redis.del(this.key(mobile));
    return { valid: true };
  }
}
