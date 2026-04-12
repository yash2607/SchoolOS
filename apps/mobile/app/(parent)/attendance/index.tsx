import { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Card, EmptyState, SkeletonLoader, Badge } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/authStore";
import { useStudentAttendance } from "@schoolos/api";

function labelForStatus(status: "present" | "absent" | "late" | "authorized_absent" | "not_marked" | "weekend" | "holiday") {
  switch (status) {
    case "present":
      return { text: "Present", color: "green" as const, icon: "checkmark-circle-outline" as const };
    case "absent":
      return { text: "Absent", color: "red" as const, icon: "close-circle-outline" as const };
    case "late":
      return { text: "Late", color: "orange" as const, icon: "time-outline" as const };
    case "authorized_absent":
      return { text: "On Leave", color: "gray" as const, icon: "document-text-outline" as const };
    default:
      return { text: "Not Marked", color: "gray" as const, icon: "remove-circle-outline" as const };
  }
}

export default function AttendanceScreen(): React.JSX.Element {
  const router = useRouter();
  const { activeChildId, activeChild } = useAuthStore();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data, isLoading } = useStudentAttendance(activeChildId, currentMonth);

  const summary = useMemo(() => {
    const days = data ?? [];
    return days.reduce(
      (acc, day) => {
        if (day.status === "present") acc.present += 1;
        if (day.status === "absent") acc.absent += 1;
        if (day.status === "late") acc.late += 1;
        if (day.status === "authorized_absent") acc.leave += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, leave: 0 }
    );
  }, [data]);

  if (!activeChildId) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mb-1 -ml-1 self-start p-1">
            <Ionicons name="chevron-back" size={24} color="#2E7DD1" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text-primary">Attendance</Text>
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
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
        <View className="gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoader key={index} variant="card" />
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-1 -ml-1 self-start p-1">
          <Ionicons name="chevron-back" size={24} color="#2E7DD1" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-text-primary">Attendance</Text>
        {activeChild && (
          <Text className="text-text-secondary text-sm mt-1">
            {activeChild.fullName} · {currentMonth}
          </Text>
        )}
      </View>

      <View className="p-4 gap-3">
        <View className="flex-row gap-3">
          <Card padding="md" style={{ flex: 1 }}>
            <Text className="text-text-secondary text-xs mb-1">Present</Text>
            <Text className="text-2xl font-bold text-text-primary">{summary.present}</Text>
          </Card>
          <Card padding="md" style={{ flex: 1 }}>
            <Text className="text-text-secondary text-xs mb-1">Absent</Text>
            <Text className="text-2xl font-bold text-text-primary">{summary.absent}</Text>
          </Card>
          <Card padding="md" style={{ flex: 1 }}>
            <Text className="text-text-secondary text-xs mb-1">Late</Text>
            <Text className="text-2xl font-bold text-text-primary">{summary.late}</Text>
          </Card>
        </View>

        {data && data.length > 0 ? (
          data.map((day) => {
            const meta = labelForStatus(day.status);
            return (
              <Card key={day.date} padding="md">
                <View className="flex-row items-start justify-between">
                  <View>
                    <Text className="text-base font-semibold text-text-primary">{day.date}</Text>
                    <Text className="text-text-secondary text-sm mt-1">
                      {day.periods?.length
                        ? `${day.periods.length} period${day.periods.length === 1 ? "" : "s"} recorded`
                        : "Daily attendance record"}
                    </Text>
                  </View>
                  <Badge label={meta.text} color={meta.color} />
                </View>

                {day.periods && day.periods.length > 0 && (
                  <View className="mt-3 gap-2">
                    {day.periods.map((period) => (
                      <View
                        key={`${day.date}-${period.periodNumber}`}
                        className="flex-row items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                      >
                        <Text className="text-sm text-text-primary">
                          Period {period.periodNumber}
                        </Text>
                        <Text className="text-xs text-text-secondary">
                          {labelForStatus(period.status).text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon={<Ionicons name="checkmark-circle-outline" size={48} color="#2E7DD1" />}
            title="No attendance yet"
            description="Attendance records will appear here once teachers start marking them."
          />
        )}
      </View>
    </ScrollView>
  );
}
