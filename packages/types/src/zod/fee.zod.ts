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
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  callbackUrl: z.string().url().optional(),
});

export type CreatePaymentOrderInput = z.infer<typeof CreatePaymentOrderSchema>;

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
