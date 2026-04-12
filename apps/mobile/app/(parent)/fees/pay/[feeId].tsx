import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card, EmptyState, SkeletonLoader, Badge } from "@schoolos/ui";
import { useCreatePaymentOrder, useStudentFees } from "@schoolos/api";
import { formatDate, formatINR } from "@schoolos/utils";
import { useAuthStore } from "../../../../store/authStore";

interface CreatedOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export default function FeePayScreen(): React.JSX.Element {
  const { feeId } = useLocalSearchParams<{ feeId: string }>();
  const router = useRouter();
  const { activeChildId, activeChild } = useAuthStore();
  const { data, isLoading } = useStudentFees(activeChildId);
  const createOrder = useCreatePaymentOrder();
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const installment = data?.installments.find((item) => item.id === feeId);

  const amount = installment
    ? installment.amount + installment.lateFeeApplied
    : 0;

  const startPayment = () => {
    if (!installment || createOrder.isPending) return;

    createOrder.mutate(
      {
        invoiceId: installment.id,
        amount,
      },
      {
        onSuccess: setOrder,
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
              Payment order created
            </Text>
            <Text className="text-xs text-text-secondary">
              Order ID: {order.orderId}
            </Text>
            <Text className="text-xs text-text-secondary mt-1">
              Razorpay checkout wiring is the next step.
            </Text>
          </Card>
        )}

        {createOrder.error && (
          <Card padding="md" style={{ borderLeftWidth: 4, borderLeftColor: "#B91C1C" }}>
            <Text className="text-sm font-semibold text-error">
              Could not create payment order. Please try again.
            </Text>
          </Card>
        )}

        <Pressable
          className="rounded-2xl bg-accent px-4 py-4"
          onPress={startPayment}
          disabled={createOrder.isPending || installment.status === "paid"}
          accessibilityRole="button"
        >
          <Text className="text-center text-base font-bold text-white">
            {createOrder.isPending ? "Creating order..." : "Create Payment Order"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
