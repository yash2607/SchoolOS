export interface MessageThread {
  id: string;
  schoolId: string;
  teacherUserId: string;
  parentUserId: string;
  studentId: string;
  teacherName: string | null;
  parentName: string | null;
  studentName: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageThreadSummary extends MessageThread {
  lastMessage: Message | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderUserId: string;
  content: string;
  attachmentKeys: string[];
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadMessagesPage {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
}

export type Conversation = MessageThreadSummary;
