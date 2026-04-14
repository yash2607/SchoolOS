import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Badge, EmptyState, SkeletonLoader } from "@schoolos/ui";
import { useParentDashboard } from "@schoolos/api";
import { formatINR, relativeTime } from "@schoolos/utils";
import { useAuthStore } from "../../store/authStore";

function StatCard({
  label,
  value,
  tone = "light",
}: {
  label: string;
  value: string;
  tone?: "light" | "dark";
}): React.JSX.Element {
  return (
    <View
      style={{
        backgroundColor: tone === "dark" ? "#1F3A68" : "#FFFFFF",
        width: "48%",
      }}
      className="mb-3 rounded-[24px] px-4 py-4"
    >
      <Text
        className={`text-xs font-bold uppercase tracking-[1.1px] ${
          tone === "dark" ? "text-[#9FB3C8]" : "text-[#627D98]"
        }`}
      >
        {label}
      </Text>
      <Text
        className={`mt-2 text-2xl font-black ${
          tone === "dark" ? "text-white" : "text-[#102A43]"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function SurfaceCard({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: string;
}): React.JSX.Element {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderLeftWidth: accent ? 4 : 0,
        borderLeftColor: accent,
      }}
      className="mb-4 rounded-[28px] p-5 shadow-sm"
    >
      {children}
    </View>
  );
}

export default function PremiumParentDashboardScreen(): React.JSX.Element {
  const { activeChildId, activeChild, school } = useAuthStore();
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useParentDashboard(activeChildId);

  if (!activeChildId) {
    return (
      <View className="flex-1 bg-[#F4EFE6] px-5 pt-14">
        <View className="rounded-[32px] bg-[#102A43] p-6">
          <Text className="text-sm font-bold uppercase tracking-[1.2px] text-[#F0B429]">
            Parent Portal
          </Text>
          <Text className="mt-3 text-3xl font-black text-white">SchoolOS</Text>
          <Text className="mt-2 text-base leading-6 text-[#BCCCDC]">
            Your account is active, but no child profile is linked yet.
          </Text>
        </View>

        <View className="mt-6 rounded-[28px] bg-white p-5">
          <EmptyState
            icon={<Ionicons name="people-outline" size={48} color="#0F766E" />}
            title="No linked child yet"
            description="Ask your school admin to connect your student profile so attendance, fees, and academics can appear here."
          />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <ScrollView
        className="flex-1 bg-[#F4EFE6]"
        contentContainerStyle={{ padding: 20, paddingTop: 56 }}
      >
        <View className="gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonLoader key={index} variant="card" />
          ))}
        </View>
      </ScrollView>
    );
  }

  const attendanceLabel =
    data?.attendance.status === "present"
      ? "Present"
      : data?.attendance.status === "absent"
        ? "Absent"
        : data?.attendance.status === "late"
          ? "Late"
          : "Not Marked";

  const attendanceTone =
    data?.attendance.status === "present"
      ? "green"
      : data?.attendance.status === "absent"
        ? "red"
        : data?.attendance.status === "late"
          ? "orange"
          : "gray";

  return (
    <ScrollView
      className="flex-1 bg-[#F4EFE6]"
      contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 28 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
      }
    >
      <View className="rounded-[34px] bg-[#0F766E] p-6">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-bold uppercase tracking-[1.3px] text-[#CCFBF1]">
              Parent Dashboard
            </Text>
            <Text className="mt-3 text-3xl font-black leading-[36px] text-white">
              {activeChild?.fullName ?? "Your child"}
            </Text>
            <Text className="mt-2 text-sm leading-6 text-[#D1FAE5]">
              {school?.name}
            </Text>
          </View>
          <View className="rounded-[20px] bg-white/20 px-4 py-3">
            <Text className="text-xs font-bold uppercase tracking-[1px] text-[#CCFBF1]">
              Admission
            </Text>
            <Text className="mt-1 text-sm font-bold text-white">
              {activeChild?.admissionNo ?? "N/A"}
            </Text>
          </View>
        </View>

        <View className="mt-6 flex-row flex-wrap justify-between">
          <StatCard label="Attendance" value={attendanceLabel} />
          <StatCard
            label="Next Class"
            value={data?.nextClass?.subject ?? "Free"}
            tone="dark"
          />
          <StatCard
            label="Homework"
            value={`${data?.pendingHomework.count ?? 0} pending`}
          />
          <StatCard
            label="Recent Grade"
            value={
              data?.recentGrade
                ? `${data.recentGrade.marks}/${data.recentGrade.maxMarks}`
                : "No grades"
            }
            tone="dark"
          />
        </View>
      </View>

      {data?.attendance && (
        <SurfaceCard accent="#0F766E">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#627D98]">
                Today&apos;s Attendance
              </Text>
              <Text className="mt-2 text-2xl font-black text-[#102A43]">
                {attendanceLabel}
              </Text>
              {data.attendance.markedAt && (
                <Text className="mt-2 text-sm text-[#627D98]">
                  Marked {relativeTime(data.attendance.markedAt)}
                </Text>
              )}
            </View>
            <Badge label={attendanceLabel} color={attendanceTone} />
          </View>
        </SurfaceCard>
      )}

      <SurfaceCard>
        <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#627D98]">
          Schedule Snapshot
        </Text>
        {data?.nextClass ? (
          <>
            <Text className="mt-2 text-2xl font-black text-[#102A43]">
              {data.nextClass.subject}
            </Text>
            <Text className="mt-1 text-base text-[#486581]">
              {data.nextClass.teacher}
            </Text>
            <Text className="mt-3 text-sm font-semibold text-[#0F766E]">
              {data.nextClass.startTime}
              {data.nextClass.room ? ` · Room ${data.nextClass.room}` : ""}
            </Text>
          </>
        ) : (
          <Text className="mt-3 text-base leading-6 text-[#486581]">
            No more classes are scheduled today.
          </Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#627D98]">
          Learning Progress
        </Text>

        <View className="mt-4 rounded-[22px] bg-[#F8FAFC] px-4 py-4">
          <Text className="text-sm font-semibold text-[#102A43]">
            Homework Queue
          </Text>
          <Text className="mt-2 text-2xl font-black text-[#1F3A68]">
            {data?.pendingHomework.count ?? 0}
          </Text>
          <Text className="mt-1 text-sm text-[#627D98]">
            {data?.pendingHomework.nextDueDate
              ? `Next due ${data.pendingHomework.nextDueDate}`
              : "No due date scheduled"}
          </Text>
        </View>

        <View className="mt-3 rounded-[22px] bg-[#FFF7ED] px-4 py-4">
          <Text className="text-sm font-semibold text-[#102A43]">
            Recent Grade
          </Text>
          {data?.recentGrade ? (
            <>
              <Text className="mt-2 text-lg font-black text-[#9A3412]">
                {data.recentGrade.subject}
              </Text>
              <Text className="mt-1 text-sm text-[#7C2D12]">
                {data.recentGrade.marks}/{data.recentGrade.maxMarks} ·{" "}
                {relativeTime(data.recentGrade.publishedAt)}
              </Text>
            </>
          ) : (
            <Text className="mt-2 text-sm text-[#7C2D12]">
              No recent grades available.
            </Text>
          )}
        </View>
      </SurfaceCard>

      {data?.feeAlert && (
        <SurfaceCard accent="#C2410C">
          <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#9A3412]">
            Fee Alert
          </Text>
          <Text className="mt-2 text-3xl font-black text-[#102A43]">
            {formatINR(data.feeAlert.amount)}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-[#7C2D12]">
            Due in {data.feeAlert.daysUntilDue} days on {data.feeAlert.dueDate}
          </Text>
          <Text
            className="mt-4 text-sm font-bold text-[#C2410C]"
            onPress={() => router.push(`/(parent)/fees/pay/${data.feeAlert?.installmentId}`)}
          >
            Review payment →
          </Text>
        </SurfaceCard>
      )}

      {data?.aiSummary && (
        <View className="rounded-[28px] bg-[#1F3A68] p-5">
          <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#F0B429]">
            AI Weekly Summary
          </Text>
          <Text className="mt-3 text-base leading-7 text-[#E6EEF7]">
            {data.aiSummary.text}
          </Text>
          <Text className="mt-4 text-xs text-[#9FB3C8]">
            Generated {relativeTime(data.aiSummary.generatedAt)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
