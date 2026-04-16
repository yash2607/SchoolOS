import { Injectable, Inject, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import twilio from 'twilio';
import { REDIS_CLIENT } from './redis.provider';

const OTP_TTL_SECONDS = 300;
const MAX_ATTEMPTS = 5;

interface OtpData {
  otp: string;
  attempts: number;
}

type OtpProvider = 'fast2sms' | 'twilio' | 'console';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly provider: OtpProvider;
  private readonly twilioClient: ReturnType<typeof twilio> | null = null;
  private readonly accountSid: string | null = null;
  private readonly whatsappFrom: string;
  private readonly contentSid: string | null = null;
  private readonly fast2SmsApiKey: string | null;
  private readonly fast2SmsPhoneNumberId: string | null;
  private readonly fast2SmsApiVersion: string;
  private readonly fast2SmsTemplateName: string | null;
  private readonly fast2SmsTemplateLanguage: string;
  private readonly fast2SmsTemplateHasButton: boolean;
  private readonly fast2SmsTemplateButtonSubtype: string;
  private readonly fast2SmsTemplateButtonIndex: string;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    this.fast2SmsApiKey = config.get<string>('FAST2SMS_API_KEY') ?? null;
    this.fast2SmsPhoneNumberId =
      config.get<string>('FAST2SMS_WHATSAPP_PHONE_NUMBER_ID') ?? null;
    this.fast2SmsApiVersion =
      config.get<string>('FAST2SMS_WHATSAPP_API_VERSION') ?? 'v24.0';
    this.fast2SmsTemplateName =
      config.get<string>('FAST2SMS_WHATSAPP_TEMPLATE_NAME') ?? null;
    this.fast2SmsTemplateLanguage =
      config.get<string>('FAST2SMS_WHATSAPP_TEMPLATE_LANGUAGE') ?? 'en_US';
    this.fast2SmsTemplateHasButton =
      (config.get<string>('FAST2SMS_WHATSAPP_TEMPLATE_HAS_BUTTON') ?? 'false') ===
      'true';
    this.fast2SmsTemplateButtonSubtype =
      config.get<string>('FAST2SMS_WHATSAPP_TEMPLATE_BUTTON_SUBTYPE') ?? 'url';
    this.fast2SmsTemplateButtonIndex =
      config.get<string>('FAST2SMS_WHATSAPP_TEMPLATE_BUTTON_INDEX') ?? '0';

    this.accountSid = config.get<string>('TWILIO_ACCOUNT_SID') ?? null;
    const authToken = config.get<string>('TWILIO_AUTH_TOKEN');
    this.whatsappFrom =
      config.get<string>('TWILIO_WHATSAPP_FROM') ?? 'whatsapp:+14155238886';
    this.contentSid =
      config.get<string>('TWILIO_WHATSAPP_CONTENT_SID') ?? null;

    if (this.accountSid && authToken) {
      this.twilioClient = twilio(this.accountSid, authToken);
    }

    if (
      this.fast2SmsApiKey &&
      this.fast2SmsPhoneNumberId &&
      this.fast2SmsTemplateName
    ) {
      this.provider = 'fast2sms';
      this.logger.log('Fast2SMS WhatsApp configured for OTP delivery');
    } else if (this.twilioClient && this.accountSid) {
      this.provider = 'twilio';
      this.logger.log('Twilio WhatsApp configured for OTP delivery');
    } else {
      this.provider = 'console';
      this.logger.warn('No WhatsApp provider configured. OTPs will be logged only.');
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
    const data: OtpData = { otp, attempts: 0 };

    await this.redis.set(
      this.redisKey(mobile),
      JSON.stringify(data),
      'EX',
      OTP_TTL_SECONDS,
    );

    if (this.provider === 'fast2sms') {
      await this.sendFast2SmsOtp(mobile, otp);
      this.logger.log(`Fast2SMS WhatsApp OTP sent to ${mobile}`);
      return;
    }

    if (this.provider === 'twilio' && this.twilioClient) {
      await this.sendTwilioOtp(mobile, otp);
      this.logger.log(`Twilio WhatsApp OTP sent to ${mobile}`);
      return;
    }

    this.logger.log(`[OTP] ${mobile} -> ${otp}`);
  }

  async verifyOtp(
    mobile: string,
    code: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const raw = await this.redis.get(this.redisKey(mobile));
    if (!raw) {
      return {
        valid: false,
        reason: 'OTP expired. Request a new one to continue.',
      };
    }

    const data: OtpData = JSON.parse(raw) as OtpData;

    if (data.attempts >= MAX_ATTEMPTS) {
      return {
        valid: false,
        reason: 'Too many incorrect attempts. Request a fresh OTP.',
      };
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
      return {
        valid: false,
        reason: 'The OTP you entered is incorrect. Please try again.',
      };
    }

    await this.redis.del(this.redisKey(mobile));
    return { valid: true };
  }

  private async sendTwilioOtp(mobile: string, otp: string): Promise<void> {
    if (!this.twilioClient) {
      throw new ServiceUnavailableException(
        'Twilio is not configured for OTP delivery',
      );
    }

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
            body: `Your SchoolOS OTP is: ${otp}. Valid for 5 minutes.`,
          }),
    });
  }

  private async sendFast2SmsOtp(mobile: string, otp: string): Promise<void> {
    if (
      !this.fast2SmsApiKey ||
      !this.fast2SmsPhoneNumberId ||
      !this.fast2SmsTemplateName
    ) {
      throw new ServiceUnavailableException(
        'Fast2SMS WhatsApp is not fully configured for OTP delivery',
      );
    }

    const components: Array<Record<string, unknown>> = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: otp,
          },
        ],
      },
    ];

    if (this.fast2SmsTemplateHasButton) {
      components.push({
        type: 'button',
        sub_type: this.fast2SmsTemplateButtonSubtype,
        index: this.fast2SmsTemplateButtonIndex,
        parameters: [
          {
            type: 'text',
            text: otp,
          },
        ],
      });
    }

    const response = await fetch(
      `https://www.fast2sms.com/dev/whatsapp/${this.fast2SmsApiVersion}/${this.fast2SmsPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: this.fast2SmsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: mobile,
          type: 'template',
          template: {
            name: this.fast2SmsTemplateName,
            language: {
              code: this.fast2SmsTemplateLanguage,
            },
            components,
          },
        }),
      },
    );

    const raw = await response.text();
    let payload: unknown = raw;

    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      // Keep the raw text when the provider returns a non-JSON body.
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(this.extractFast2SmsError(payload));
    }
  }

  private extractFast2SmsError(payload: unknown): string {
    if (typeof payload === 'string' && payload.trim()) {
      return `Fast2SMS OTP delivery failed: ${payload}`;
    }

    if (payload && typeof payload === 'object') {
      const data = payload as Record<string, unknown>;
      const directMessage =
        typeof data['message'] === 'string'
          ? data['message']
          : typeof data['error'] === 'string'
            ? data['error']
            : null;

      if (directMessage) {
        return `Fast2SMS OTP delivery failed: ${directMessage}`;
      }

      if (Array.isArray(data['errors']) && data['errors'].length > 0) {
        const firstError = data['errors'][0];
        if (typeof firstError === 'string') {
          return `Fast2SMS OTP delivery failed: ${firstError}`;
        }

        if (firstError && typeof firstError === 'object') {
          const nestedMessage = (firstError as Record<string, unknown>)['message'];
          if (typeof nestedMessage === 'string') {
            return `Fast2SMS OTP delivery failed: ${nestedMessage}`;
          }
        }
      }
    }

    return 'Fast2SMS OTP delivery failed. Check template approval, phone number status, and API credentials.';
  }
}
