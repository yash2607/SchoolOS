import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { CreatePaymentOrderInput } from "@schoolos/types";

interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  gateway: "razorpay" | "stripe";
  gatewayOrderId: string;
  keyId: string;
}

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: async (payload: CreatePaymentOrderInput) => {
      const { data } = await apiClient.post<PaymentOrder>(
        "/api/v1/fees/orders",
        payload,
        {
          headers: { "X-Idempotency-Key": payload.idempotencyKey },
        }
      );
      return data;
    },
  });
}
