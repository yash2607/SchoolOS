type EventProps = Record<string, string | number | boolean>;

// Amplitude stub — replaced with real SDK in apps
// TODO: [PHASE-6] Wire up real Amplitude SDK per app
let _track: ((name: string, props?: EventProps) => void) | null = null;

export function initAnalytics(
  trackFn: (name: string, props?: EventProps) => void
): void {
  _track = trackFn;
}

export function trackEvent(name: string, props?: EventProps): void {
  if (_track) {
    _track(name, props);
  } else if (process.env["NODE_ENV"] === "development") {
    console.log(`[Analytics] ${name}`, props);
  }
}

// Standard event names
export const EVENTS = {
  SCREEN_VIEW: "screen_view",
  ATTENDANCE_MARKED: "attendance_marked",
  PAYMENT_INITIATED: "payment_initiated",
  PAYMENT_SUCCESS: "payment_success",
  AI_FEATURE_USED: "ai_feature_used",
  LOGIN_SUCCESS: "login_success",
  OTP_SENT: "otp_sent",
  ASSIGNMENT_VIEWED: "assignment_viewed",
  GRADE_VIEWED: "grade_viewed",
  NOTIFICATION_TAPPED: "notification_tapped",
} as const;
