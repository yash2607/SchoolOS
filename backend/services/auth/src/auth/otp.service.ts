import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class OtpService {
  private readonly client: ReturnType<typeof twilio> | null = null;
  private readonly verifySid: string | null = null;

  constructor(private readonly config: ConfigService) {
    const accountSid = config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = config.get<string>('TWILIO_AUTH_TOKEN');
    this.verifySid = config.get<string>('TWILIO_VERIFY_SID') ?? null;

    if (accountSid && authToken && this.verifySid) {
      this.client = twilio(accountSid, authToken);
      console.log('[OTP] Twilio Verify configured');
    } else {
      console.warn('[OTP] Twilio not configured — OTPs will be logged to console');
    }
  }

  async sendOtp(mobile: string): Promise<void> {
    if (this.client && this.verifySid) {
      await this.client.verify.v2
        .services(this.verifySid)
        .verifications.create({ to: mobile, channel: 'sms' });
    } else {
      // Fallback: log to console (visible in Railway logs)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[OTP] ${mobile} → ${otp}`);
    }
  }

  async verifyOtp(
    mobile: string,
    code: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    if (this.client && this.verifySid) {
      try {
        const check = await this.client.verify.v2
          .services(this.verifySid)
          .verificationChecks.create({ to: mobile, code });
        if (check.status === 'approved') return { valid: true };
        return { valid: false, reason: 'Invalid OTP' };
      } catch {
        return { valid: false, reason: 'OTP verification failed' };
      }
    }
    // Fallback: can't verify without Twilio, always fail
    return { valid: false, reason: 'OTP service not configured' };
  }
}
