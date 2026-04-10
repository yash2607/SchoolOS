export interface Conversation {
  id: string;
  parentId: string;
  teacherId: string;
  teacherName: string;
  teacherPhotoUrl: string | null;
  studentId: string;
  studentName: string;
  subjectId: string | null;
  subjectName: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  body: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface SendMessagePayload {
  conversationId?: string;
  teacherId?: string;
  studentId?: string;
  body: string;
  attachmentUrl?: string;
  attachmentName?: string;
}
