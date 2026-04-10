const INDIAN_MOBILE_REGEX = /^\+91[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function isValidIndianMobile(phone: string): boolean {
  return INDIAN_MOBILE_REGEX.test(phone);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isAllowedFileType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.has(mime.toLowerCase());
}

export function isWithinSizeLimit(bytes: number, maxMB: number): boolean {
  return bytes <= maxMB * 1024 * 1024;
}
