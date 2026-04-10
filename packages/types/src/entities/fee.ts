export type FeeInstallmentStatus = "unpaid" | "paid" | "partial" | "waived";
export type PaymentGateway = "razorpay" | "stripe";
export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "refunded"
  | "cancelled";

export interface FeeStructure {
  id: string;
  gradeId: string;
  academicYearId: string;
  feeHeads: FeeHead[];
  totalAmount: number;
}

export interface FeeHead {
  id: string;
  name: string;
  amount: number;
  frequency: "annual" | "term" | "monthly" | "one-time";
  isMandatory: boolean;
  taxPercent: number;
}

export interface FeeAccount {
  id: string;
  studentId: string;
  feeStructureId: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  installments: FeeInstallment[];
}

export interface FeeInstallment {
  id: string;
  feeAccountId: string;
  feeHeadId: string;
  feeHeadName: string;
  dueDate: string;
  amount: number;
  lateFeeApplied: number;
  status: FeeInstallmentStatus;
  paidAt: string | null;
  paymentReference: string | null;
}

export interface Payment {
  id: string;
  feeInstallmentId: string;
  studentId: string;
  amount: number;
  gateway: PaymentGateway;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  idempotencyKey: string;
  status: PaymentStatus;
  receiptUrl: string | null;
  createdAt: string;
}

export interface FeeSummary {
  totalDue: number;
  totalPaid: number;
  outstanding: number;
  nextInstallment: FeeInstallment | null;
}
