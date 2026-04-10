export type NotificationCategory =
  | "attendance"
  | "academic"
  | "finance"
  | "communication"
  | "emergency"
  | "system";

export type NotificationChannel = "push" | "sms" | "email" | "websocket";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  category: NotificationCategory;
  title: string;
  body: string;
  deepLink: string | null;
  isRead: boolean;
  channel: NotificationChannel;
  createdAt: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  platform: "ios" | "android";
  token: string;
  isActive: boolean;
  lastUsedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  attendance: ChannelPreference;
  grades: ChannelPreference;
  assignments: ChannelPreference;
  fees: ChannelPreference;
  messages: ChannelPreference;
  announcements: ChannelPreference;
  /** These cannot be disabled */
  emergency: { enabled: true };
  absenceAlert: { enabled: true };
  paymentConfirmation: { enabled: true };
}

export interface ChannelPreference {
  enabled: boolean;
  push: boolean;
  sms: boolean;
  email: boolean;
}
