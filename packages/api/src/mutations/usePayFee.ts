import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client.js";
import type { CreatePaymentOrderInput } from "@schoolos/types";

interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

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
