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
});

export type CreatePaymentOrderInput = z.infer<typeof CreatePaymentOrderSchema>;
