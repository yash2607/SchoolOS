export type AnnouncementStatus = "draft" | "scheduled" | "sent";
export type AudienceType = "school" | "grade" | "section" | "individual";
/** Delivery channels — a subset of AnnouncementChannel (no websocket for announcements) */
export type AnnouncementChannel = "push" | "sms" | "email";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  audienceType: AudienceType;
  audienceIds: string[];
  channels: AnnouncementChannel[];
  status: AnnouncementStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  attachmentUrl: string | null;
  requiresAck: boolean;
  createdAt: string;
}

export interface AnnouncementDelivery {
  announcementId: string;
  userId: string;
  channel: AnnouncementChannel;
  deliveredAt: string | null;
  readAt: string | null;
  acknowledgedAt: string | null;
}

export interface AnnouncementStats {
  announcementId: string;
  pushSent: number;
  smsSent: number;
  emailSent: number;
  delivered: number;
  read: number;
  acknowledged: number;
}
