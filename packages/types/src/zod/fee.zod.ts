import { z } from "zod";

export const FeeInstallmentStatusSchema = z.enum([
  "unpaid",
  "paid",
  "partial",
  "waived",
  "overdue",
]);

export const PaymentGatewaySchema = z.enum(["razorpay", "stripe"]);

export const CreatePaymentOrderSchema = z.object({
  feeInstallmentId: z.string().uuid(),
  amount: z.number().positive(),
  gateway: PaymentGatewaySchema,
  idempotencyKey: z.string().min(1).max(100),
  partialAmount: z.number().positive().optional(),
});

export type CreatePaymentOrderInput = z.infer<typeof CreatePaymentOrderSchema>;
