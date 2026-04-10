export const API_TIMEOUT_MS = 10_000;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_ASSIGNMENT_FILES = 3;
export const MAX_MESSAGE_ATTACHMENT_MB = 5;
export const OTP_VALIDITY_SECONDS = 300;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_SENDS_PER_SESSION = 3;
export const OFFLINE_CACHE_DAYS = 30;
export const TOKEN_REFRESH_BUFFER_MS = 60_000;
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const STALE_BANNER_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
export const OFFLINE_TIMETABLE_CACHE_DAYS = 7;

export const PAGINATION_DEFAULT_LIMIT = 30;
export const NOTIFICATIONS_MAX_LOOKBACK_DAYS = 90;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const ATTENDANCE_THRESHOLD_PERCENT = 75;
