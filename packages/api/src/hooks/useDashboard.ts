import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";

export interface DashboardData {
  attendance: {
    status: "present" | "absent" | "late" | "not_marked";
    markedAt?: string;
  };
  nextClass: {
    subject: string;
    teacher: string;
    startTime: string;
    room?: string;
  } | null;
  pendingHomework: { count: number; nextDueDate: string | null };
  recentGrade: {
    subject: string;
    marks: number;
    maxMarks: number;
    publishedAt: string;
  } | null;
  feeAlert: {
    amount: number;
    dueDate: string;
    daysUntilDue: number;
    installmentId: string;
  } | null;
  aiSummary: { text: string; generatedAt: string } | null;
}

export function useParentDashboard(childId: string | null) {
  return useQuery({
    queryKey: ["dashboard", "parent", childId],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardData>(
        `/api/v1/dashboard/parent/${childId}`
      );
      return data;
    },
    enabled: !!childId,
  });
}
