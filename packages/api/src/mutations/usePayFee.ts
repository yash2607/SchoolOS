import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type {
  CreatePaymentOrderInput,
  PaymentOrder,
  VerifyPaymentInput,
} from "@schoolos/types";

export function useCreatePaymentOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePaymentOrderInput) => {
      const { data } = await apiClient.post<PaymentOrder>(
        "/api/v1/fees/payment/initiate",
        payload
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VerifyPaymentInput) => {
      const { data } = await apiClient.post<{ success: boolean; paymentId: string; invoiceId: string | null }>(
        "/api/v1/fees/payment/verify",
        payload
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}
