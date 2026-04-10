import { ScrollView, View, Text, RefreshControl } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useParentDashboard } from "@schoolos/api";
import { Card, SkeletonLoader, Badge } from "@schoolos/ui";
import { formatINR, relativeTime } from "@schoolos/utils";
import { useRouter } from "expo-router";

export default function DashboardScreen(): React.JSX.Element {
  const { activeChildId, activeChild, school } = useAuthStore();
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useParentDashboard(activeChildId);

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
        <View className="gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card" />
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
      }
    >
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-text-primary">
          Good morning! 👋
        </Text>
        {activeChild && (
          <Text className="text-text-secondary text-sm mt-1">
            {activeChild.fullName} · {school?.name}
          </Text>
        )}
      </View>

      {/* Attendance Card */}
      {data?.attendance && (
        <Card
          padding="md"
          style={{ marginBottom: 12 }}
          onPress={() => router.push("/attendance")}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-text-secondary font-medium mb-1">
                Today&apos;s Attendance
              </Text>
              <Badge
                label={
                  data.attendance.status === "present"
                    ? "Present"
                    : data.attendance.status === "absent"
                    ? "Absent"
                    : data.attendance.status === "late"
                    ? "Late"
                    : "Not Marked"
                }
                color={
                  data.attendance.status === "present"
                    ? "green"
                    : data.attendance.status === "absent"
                    ? "red"
                    : data.attendance.status === "late"
                    ? "orange"
                    : "gray"
                }
              />
              {data.attendance.markedAt && (
                <Text className="text-xs text-text-secondary mt-1">
                  Marked {relativeTime(data.attendance.markedAt)}
                </Text>
              )}
            </View>
            <Text className="text-3xl">
              {data.attendance.status === "present"
                ? "✅"
                : data.attendance.status === "absent"
                ? "❌"
                : data.attendance.status === "late"
                ? "⏰"
                : "❓"}
            </Text>
          </View>
        </Card>
      )}

      {/* Next Class Card */}
      {data?.nextClass !== undefined && (
        <Card padding="md" style={{ marginBottom: 12 }}>
          <Text className="text-sm text-text-secondary font-medium mb-2">
            Next Class
          </Text>
          {data.nextClass ? (
            <View>
              <Text className="text-lg font-bold text-text-primary">
                {data.nextClass.subject}
              </Text>
              <Text className="text-text-secondary text-sm">
                {data.nextClass.teacher}
              </Text>
              <Text className="text-accent text-sm font-semibold mt-1">
                {data.nextClass.startTime}
                {data.nextClass.room ? ` · Room ${data.nextClass.room}` : ""}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">☀️</Text>
              <Text className="text-text-secondary">No more classes today</Text>
            </View>
          )}
        </Card>
      )}

      {/* Homework Card */}
      {data?.pendingHomework && (
        <Card
          padding="md"
          style={{ marginBottom: 12 }}
          onPress={() => router.push("/(tabs)/academics")}
        >
          <Text className="text-sm text-text-secondary font-medium mb-2">
            Homework
          </Text>
          <Text className="text-lg font-bold text-text-primary">
            {data.pendingHomework.count} assignment
            {data.pendingHomework.count !== 1 ? "s" : ""} pending
          </Text>
          {data.pendingHomework.nextDueDate && (
            <Text className="text-sm text-warning mt-1">
              Next due: {data.pendingHomework.nextDueDate}
            </Text>
          )}
        </Card>
      )}

      {/* Recent Grade Card */}
      {data?.recentGrade && (
        <Card
          padding="md"
          style={{ marginBottom: 12 }}
          onPress={() => router.push("/(tabs)/academics")}
        >
          <Text className="text-sm text-text-secondary font-medium mb-2">
            Recent Grade
          </Text>
          <Text className="text-lg font-bold text-text-primary">
            {data.recentGrade.subject}:{" "}
            <Text className="text-accent">
              {data.recentGrade.marks}/{data.recentGrade.maxMarks}
            </Text>
          </Text>
          <Text className="text-xs text-text-secondary mt-1">
            {relativeTime(data.recentGrade.publishedAt)}
          </Text>
        </Card>
      )}

      {/* Fee Alert Card */}
      {data?.feeAlert && (
        <Card
          padding="md"
          style={{ marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#D4600A" }}
          onPress={() =>
            router.push(`/fees/pay/${data.feeAlert?.installmentId}`)
          }
        >
          <Text className="text-sm text-warning font-semibold mb-1">
            ⚠️ Fee Due
          </Text>
          <Text className="text-lg font-bold text-text-primary">
            {formatINR(data.feeAlert.amount)}
          </Text>
          <Text className="text-sm text-text-secondary">
            Due in {data.feeAlert.daysUntilDue} days ({data.feeAlert.dueDate})
          </Text>
        </Card>
      )}

      {/* AI Summary Card */}
      {data?.aiSummary && (
        <Card
          padding="md"
          style={{ marginBottom: 24, backgroundColor: "#EFF6FF" }}
        >
          <View className="flex-row items-center gap-1 mb-2">
            <Text>✨</Text>
            <Text className="text-sm font-semibold text-accent">
              AI Weekly Summary
            </Text>
          </View>
          <Text className="text-text-primary text-sm leading-relaxed">
            {data.aiSummary.text}
          </Text>
          <Text className="text-xs text-text-secondary mt-3">
            Powered by Claude AI · {relativeTime(data.aiSummary.generatedAt)}
          </Text>
          <Text className="text-xs text-text-secondary mt-1 italic">
            AI-generated from academic data. For details, check the relevant
            sections.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}
