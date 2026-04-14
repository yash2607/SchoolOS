import { ScrollView, View, Text, RefreshControl } from "react-native";
import { EmptyState, Card, Badge, SkeletonLoader } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { useFeeSummary, useStudentFees } from "@schoolos/api";
import { formatDate, formatINR } from "@schoolos/utils";
import type { FeeInstallmentStatus } from "@schoolos/types";

function statusMeta(status: FeeInstallmentStatus) {
  switch (status) {
    case "paid":
      return { label: "Paid", color: "green" as const };
    case "partial":
      return { label: "Partial", color: "orange" as const };
    case "waived":
      return { label: "Waived", color: "gray" as const };
    case "overdue":
      return { label: "Overdue", color: "red" as const };
    default:
      return { label: "Unpaid", color: "blue" as const };
  }
}

export default function FeesScreen(): React.JSX.Element {
  const router = useRouter();
  const { activeChildId, activeChild } = useAuthStore();
  const feesQuery = useStudentFees(activeChildId);
  const summaryQuery = useFeeSummary(activeChildId);
  const account = feesQuery.data;
  const summary = summaryQuery.data;
  const isLoading = feesQuery.isLoading || summaryQuery.isLoading;
  const isRefetching = feesQuery.isRefetching || summaryQuery.isRefetching;

  const refetch = () => {
    void feesQuery.refetch();
    void summaryQuery.refetch();
  };

  if (!activeChildId) {
    return (
      <View className="flex-1 bg-[#F4EFE6]">
        <View className="mx-4 mt-12 rounded-[30px] bg-[#102A43] px-5 py-5">
          <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#F0B429]">
            Premium ERP
          </Text>
          <Text className="mt-2 text-3xl font-black text-white">Fees</Text>
        </View>
        <EmptyState
          icon={<Ionicons name="people-outline" size={48} color="#2E7DD1" />}
          title="No linked child"
          description="Ask the school admin to link your account to a student profile."
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-[#F4EFE6]" contentContainerStyle={{ padding: 16, paddingTop: 56 }}>
        <View className="gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoader key={index} variant="card" />
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F4EFE6]"
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View className="mx-4 mt-12 rounded-[30px] bg-[#102A43] px-5 py-5">
        <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#F0B429]">
          Fee Center
        </Text>
        <Text className="mt-2 text-3xl font-black text-white">Fees</Text>
        {activeChild && (
          <Text className="mt-2 text-sm text-[#BCCCDC]">
            {activeChild.fullName}
          </Text>
        )}
      </View>

      <View className="p-4 gap-3">
        {account || summary ? (
          <>
            <Card
              padding="lg"
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 0,
                borderRadius: 28,
              }}
            >
              <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#627D98] mb-2">
                Outstanding Balance
              </Text>
              <Text className="text-4xl font-black text-[#102A43]">
                {formatINR(summary?.outstanding ?? account?.outstandingAmount ?? 0)}
              </Text>
              <View className="flex-row mt-4 gap-3">
                <View className="flex-1 rounded-[22px] bg-[#F8FAFC] px-3 py-4">
                  <Text className="text-xs font-bold uppercase tracking-[1px] text-[#627D98]">Total due</Text>
                  <Text className="text-base font-black text-[#102A43] mt-2">
                    {formatINR(summary?.totalDue ?? account?.totalAmount ?? 0)}
                  </Text>
                </View>
                <View className="flex-1 rounded-[22px] bg-[#ECFDF5] px-3 py-4">
                  <Text className="text-xs font-bold uppercase tracking-[1px] text-[#0F766E]">Paid</Text>
                  <Text className="text-base font-black text-success mt-2">
                    {formatINR(summary?.totalPaid ?? account?.paidAmount ?? 0)}
                  </Text>
                </View>
              </View>
            </Card>

            {summary?.nextInstallment && (
              <Card
                padding="md"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: "#D4600A",
                  borderRadius: 28,
                }}
                onPress={() =>
                  router.push(`/(parent)/fees/pay/${summary.nextInstallment?.id}`)
                }
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-xs font-bold uppercase tracking-[1px] text-warning mb-1">
                      Next Payment
                    </Text>
                    <Text className="text-xl font-black text-[#102A43]">
                      {summary.nextInstallment.feeHeadName}
                    </Text>
                    <Text className="text-sm text-[#627D98] mt-1">
                      Due {formatDate(summary.nextInstallment.dueDate)}
                    </Text>
                  </View>
                  <Text className="text-lg font-black text-[#102A43]">
                    {formatINR(summary.nextInstallment.amount)}
                  </Text>
                </View>
              </Card>
            )}

            <View className="mt-1">
              <Text className="text-base font-black text-[#102A43] mb-3">
                Installments
              </Text>
              <View className="gap-3">
                {account?.installments.length ? (
                  account.installments.map((installment) => {
                    const meta = statusMeta(installment.status);
                    const canPay =
                      installment.status === "unpaid" ||
                      installment.status === "partial" ||
                      installment.status === "overdue";

                    return (
                      <Card
                        key={installment.id}
                        padding="md"
                        style={{ borderRadius: 24 }}
                        onPress={
                          canPay
                            ? () => router.push(`/(parent)/fees/pay/${installment.id}`)
                            : undefined
                        }
                      >
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 pr-3">
                            <Text className="text-base font-bold text-[#102A43]">
                              {installment.feeHeadName}
                            </Text>
                            <Text className="text-sm text-[#627D98] mt-1">
                              Due {formatDate(installment.dueDate)}
                            </Text>
                            {installment.paymentReference && (
                              <Text className="text-xs text-[#829AB1] mt-1">
                                Ref: {installment.paymentReference}
                              </Text>
                            )}
                          </View>
                          <View className="items-end gap-2">
                            <Text className="text-base font-black text-[#102A43]">
                              {formatINR(installment.amount + installment.lateFeeApplied)}
                            </Text>
                            <Badge label={meta.label} color={meta.color} size="sm" />
                          </View>
                        </View>
                      </Card>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={
                      <Ionicons name="receipt-outline" size={48} color="#2E7DD1" />
                    }
                    title="No fees assigned"
                    description="Fee installments will appear here once the school publishes them."
                  />
                )}
              </View>
            </View>
          </>
        ) : (
          <EmptyState
            icon={<Ionicons name="card-outline" size={48} color="#2E7DD1" />}
            title="Fee schedule unavailable"
            description="Pull down to refresh, or try again once the school publishes fee details."
          />
        )}
      </View>
    </ScrollView>
  );
}
