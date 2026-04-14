import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { FeeAccount, FeeSummary } from "@schoolos/types";

export interface FeeItemRecord {
  id: string;
  schoolId: string;
  gradeId: string;
  academicYear: string;
  name: string;
  amount: number;
  currency: string;
  dueDate: string;
  lateFeeType: "fixed" | "percentage";
  lateFeeValue: number;
  lateFeeAfterDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentInvoiceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  feeItemId: string;
  academicYear: string;
  dueAmount: number;
  paidAmount: number;
  status: "unpaid" | "partial" | "paid" | "overdue";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  schoolId: string;
  studentId: string;
  invoiceId: string | null;
  amount: number;
  currency: string;
  method: "online" | "cash" | "cheque" | "bank_transfer";
  status: "pending" | "success" | "failed" | "refunded";
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CollectionReport {
  total: number;
  byMethod: Record<string, number>;
  payments: PaymentRecord[];
}

export function useStudentFees(studentId: string | null) {
  return useQuery({
    queryKey: ["fees", "student", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<FeeAccount>(
        `/api/v1/fees/student/${studentId}`
      );
      return data;
    },
    enabled: !!studentId,
  });
}

export function useFeeSummary(studentId: string | null) {
  return useQuery({
    queryKey: ["fees", "summary", studentId],
    queryFn: async () => {
      const { data } = await apiClient.get<FeeSummary>(
        `/api/v1/fees/student/${studentId}/summary`
      );
      return data;
    },
    enabled: !!studentId,
  });
}

export function useFeeStructures(filters: {
  gradeId?: string;
  academicYear?: string;
} = {}) {
  return useQuery({
    queryKey: ["fees", "structure", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<FeeItemRecord[]>(
        "/api/v1/fees/structure",
        { params: filters }
      );
      return data;
    },
  });
}

export function useOverdueInvoices(gradeId?: string) {
  return useQuery({
    queryKey: ["fees", "overdue", gradeId ?? "all"],
    queryFn: async () => {
      const { data } = await apiClient.get<StudentInvoiceRecord[]>(
        "/api/v1/fees/invoices/overdue",
        { params: gradeId ? { gradeId } : {} }
      );
      return data;
    },
  });
}

export function useCollectionReport(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: ["fees", "collection-report", fromDate, toDate],
    queryFn: async () => {
      const { data } = await apiClient.get<CollectionReport>(
        "/api/v1/fees/reports/collection",
        { params: { fromDate, toDate } }
      );
      return data;
    },
    enabled: Boolean(fromDate && toDate),
  });
}
