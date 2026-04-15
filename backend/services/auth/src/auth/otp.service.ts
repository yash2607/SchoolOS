import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import twilio from 'twilio';
import { REDIS_CLIENT } from './redis.provider';

const OTP_TTL_SECONDS = 300; // 5 minutes
const MAX_ATTEMPTS = 5;

interface OtpData {
  otp: string;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly twilioClient: ReturnType<typeof twilio> | null = null;
  private readonly accountSid: string | null = null;
  private readonly whatsappFrom: string;
  private readonly contentSid: string | null = null;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    this.accountSid = config.get<string>('TWILIO_ACCOUNT_SID') ?? null;
    const authToken = config.get<string>('TWILIO_AUTH_TOKEN');
    this.whatsappFrom =
      config.get<string>('TWILIO_WHATSAPP_FROM') ?? 'whatsapp:+14155238886';
    this.contentSid =
      config.get<string>('TWILIO_WHATSAPP_CONTENT_SID') ?? null;

    if (this.accountSid && authToken) {
      this.twilioClient = twilio(this.accountSid, authToken);
      console.log('[OTP] Twilio WhatsApp configured ✓');
    } else {
      console.warn('[OTP] Twilio not configured — OTPs logged to console only');
    }
  }

  private redisKey(mobile: string) {
    return `otp:${mobile}`;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(mobile: string): Promise<void> {
    const otp = this.generateCode();

    // Store in Redis
    const data: OtpData = { otp, attempts: 0 };
    await this.redis.set(
      this.redisKey(mobile),
      JSON.stringify(data),
      'EX',
      OTP_TTL_SECONDS,
    );

    if (this.twilioClient && this.accountSid) {
      // Send via WhatsApp
      const to = mobile.startsWith('whatsapp:') ? mobile : `whatsapp:${mobile}`;
      await this.twilioClient.messages.create({
        from: this.whatsappFrom,
        to,
        ...(this.contentSid
          ? {
              contentSid: this.contentSid,
              contentVariables: JSON.stringify({ '1': otp }),
            }
          : {
              // Fallback: plain text (sandbox supports this)
              body: `Your SchoolOS OTP is: ${otp}. Valid for 5 minutes.`,
            }),
      });
      console.log(`[OTP] WhatsApp sent to ${mobile}`);
    } else {
      // Dev fallback — print to Railway logs
      console.log(`[OTP] ${mobile} → ${otp}`);
    }
  }

  async verifyOtp(
    mobile: string,
    code: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const raw = await this.redis.get(this.redisKey(mobile));
    if (!raw) {
      return { valid: false, reason: 'OTP expired. Request a new one to continue.' };
    }

    const data: OtpData = JSON.parse(raw) as OtpData;

    if (data.attempts >= MAX_ATTEMPTS) {
      return { valid: false, reason: 'Too many incorrect attempts. Request a fresh OTP.' };
    }

    if (data.otp !== code) {
      data.attempts++;
      const ttl = await this.redis.ttl(this.redisKey(mobile));
      await this.redis.set(
        this.redisKey(mobile),
        JSON.stringify(data),
        'EX',
        ttl > 0 ? ttl : OTP_TTL_SECONDS,
      );
      return { valid: false, reason: 'The OTP you entered is incorrect. Please try again.' };
    }

    // Correct — delete it so it can't be reused
    await this.redis.del(this.redisKey(mobile));
    return { valid: true };
  }
}
