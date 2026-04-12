import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ExpoLinking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { Card, EmptyState, SkeletonLoader, Badge } from "@schoolos/ui";
import {
  apiClient,
  useCreatePaymentOrder,
  useStudentFees,
  useVerifyPayment,
} from "@schoolos/api";
import { formatDate, formatINR } from "@schoolos/utils";
import { useAuthStore } from "../../../../store/authStore";
import type { CreatePaymentOrderInput, PaymentOrder } from "@schoolos/types";

export default function FeePayScreen(): React.JSX.Element {
  const { feeId } = useLocalSearchParams<{ feeId: string }>();
  const router = useRouter();
  const { activeChildId, activeChild } = useAuthStore();
  const { data, isLoading } = useStudentFees(activeChildId);
  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [checkoutState, setCheckoutState] = useState<
    "idle" | "launching" | "verifying" | "success" | "cancelled" | "failed"
  >("idle");
  const lastHandledUrlRef = useRef<string | null>(null);
  const installment = data?.installments.find((item) => item.id === feeId);

  const amount = installment
    ? installment.amount + installment.lateFeeApplied
    : 0;

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url || lastHandledUrlRef.current === url) return;

      const parsed = ExpoLinking.parse(url);
      if (!parsed.path?.endsWith(`/fees/pay/${feeId}`)) return;

      lastHandledUrlRef.current = url;
      const params = parsed.queryParams ?? {};
      const status = typeof params.razorpay_status === "string" ? params.razorpay_status : null;

      if (status === "success") {
        const orderId = typeof params.razorpay_order_id === "string" ? params.razorpay_order_id : "";
        const paymentId = typeof params.razorpay_payment_id === "string" ? params.razorpay_payment_id : "";
        const signature = typeof params.razorpay_signature === "string" ? params.razorpay_signature : "";

        if (!orderId || !paymentId || !signature) {
          setCheckoutState("failed");
          return;
        }

        setCheckoutState("verifying");
        verifyPayment.mutate(
          { orderId, paymentId, signature },
          {
            onSuccess: () => setCheckoutState("success"),
            onError: () => setCheckoutState("failed"),
          }
        );
        return;
      }

      if (status === "cancelled") {
        setCheckoutState("cancelled");
        return;
      }

      if (status === "failed") {
        setCheckoutState("failed");
      }
    };

    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    void Linking.getInitialURL().then(handleUrl);
    return () => subscription.remove();
  }, [feeId, verifyPayment]);

  const startPayment = () => {
    if (!installment || createOrder.isPending) return;

    setCheckoutState("launching");
    const callbackUrl = ExpoLinking.createURL(`/fees/pay/${feeId}`);

    const payload: CreatePaymentOrderInput = {
        invoiceId: installment.id,
        amount,
        callbackUrl,
      };

    createOrder.mutate(
      payload,
      {
        onSuccess: async (createdOrder) => {
          setOrder(createdOrder);
          const checkoutUrl = `${apiClient.defaults.baseURL}/api/v1/fees/payment/checkout/${createdOrder.paymentId}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
          try {
            await Linking.openURL(checkoutUrl);
          } catch {
            setCheckoutState("failed");
          }
        },
        onError: () => setCheckoutState("failed"),
      }
    );
  };

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
        <SkeletonLoader variant="card" />
      </ScrollView>
    );
  }

  if (!installment) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
          </Pressable>
        </View>
        <EmptyState
          icon={<Ionicons name="receipt-outline" size={48} color="#2E7DD1" />}
          title="Fee not found"
          description="This fee installment is no longer available. Go back and refresh your fee schedule."
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-text-primary">Pay Fee</Text>
            {activeChild && (
              <Text className="text-text-secondary text-sm mt-1">
                {activeChild.fullName}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className="p-4 gap-3">
        <Card padding="lg">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm text-text-secondary mb-1">Installment</Text>
              <Text className="text-xl font-bold text-text-primary">
                {installment.feeHeadName}
              </Text>
              <Text className="text-sm text-text-secondary mt-2">
                Due {formatDate(installment.dueDate)}
              </Text>
            </View>
            <Badge
              label={installment.status === "overdue" ? "Overdue" : "Payable"}
              color={installment.status === "overdue" ? "red" : "blue"}
            />
          </View>

          <View className="mt-5 rounded-2xl bg-gray-50 px-4 py-4">
            <Text className="text-sm text-text-secondary">Amount</Text>
            <Text className="text-3xl font-bold text-text-primary mt-1">
              {formatINR(amount)}
            </Text>
            {installment.lateFeeApplied > 0 && (
              <Text className="text-xs text-warning mt-2">
                Includes late fee of {formatINR(installment.lateFeeApplied)}
              </Text>
            )}
          </View>
        </Card>

        {order && (
          <Card padding="md" style={{ borderLeftWidth: 4, borderLeftColor: "#1A7A4A" }}>
            <Text className="text-sm font-semibold text-success mb-1">
              Razorpay order ready
            </Text>
            <Text className="text-xs text-text-secondary">
              Order ID: {order.orderId}
            </Text>
          </Card>
        )}

        {checkoutState === "verifying" && (
          <Card padding="md" style={{ borderLeftWidth: 4, borderLeftColor: "#2E7DD1" }}>
            <Text className="text-sm font-semibold text-accent">
              Verifying your payment...
            </Text>
          </Card>
        )}

        {checkoutState === "success" && (
          <Card padding="md" style={{ borderLeftWidth: 4, borderLeftColor: "#1A7A4A" }}>
            <Text className="text-sm font-semibold text-success mb-1">
              Payment captured successfully
            </Text>
            <Text className="text-xs text-text-secondary">
              Your fee status will refresh automatically.
            </Text>
          </Card>
        )}

        {checkoutState === "cancelled" && (
          <Card padding="md" style={{ borderLeftWidth: 4, borderLeftColor: "#D4600A" }}>
            <Text className="text-sm font-semibold text-warning">
              Checkout was cancelled before payment completed.
            </Text>
          </Card>
        )}

        {(createOrder.error || checkoutState === "failed" || verifyPayment.error) && (
          <Card padding="md" style={{ borderLeftWidth: 4, borderLeftColor: "#B91C1C" }}>
            <Text className="text-sm font-semibold text-error">
              We could not complete the Razorpay payment. Please try again.
            </Text>
          </Card>
        )}

        <Pressable
          className="rounded-2xl bg-accent px-4 py-4"
          onPress={startPayment}
          disabled={
            createOrder.isPending ||
            verifyPayment.isPending ||
            installment.status === "paid"
          }
          accessibilityRole="button"
        >
          <Text className="text-center text-base font-bold text-white">
            {createOrder.isPending || checkoutState === "launching"
              ? "Opening Razorpay..."
              : verifyPayment.isPending
                ? "Verifying payment..."
                : "Pay with Razorpay"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
