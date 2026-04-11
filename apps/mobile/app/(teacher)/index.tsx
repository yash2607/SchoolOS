import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useTeacherTimetable } from "@schoolos/api";
import { Card, SkeletonLoader, Button } from "@schoolos/ui";
import { useRouter } from "expo-router";
import { formatTime } from "@schoolos/utils";

export default function TeacherTodayScreen(): React.JSX.Element {
  const { teacherId, user } = useAuthStore();
  const router = useRouter();
  const { data: schedule, isLoading, refetch, isRefetching } = useTeacherTimetable(teacherId);

  const today = new Date();
  const dayOfWeek = today.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const todaySchedule = schedule?.find((d) => d.dayOfWeek === dayOfWeek);
  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const currentPeriod = todaySchedule?.periods.find(
    (p) => p.startTime <= currentTimeStr && p.endTime >= currentTimeStr
  );
  const upcomingPeriods = todaySchedule?.periods
    .filter((p) => p.startTime > currentTimeStr)
    .slice(0, 3);

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
        <View className="gap-3">
          <SkeletonLoader variant="card" height={120} />
          {[1, 2, 3].map((i) => <SkeletonLoader key={i} variant="card" />)}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
    >
      <View className="mb-4">
        <Text className="text-2xl font-bold text-text-primary">Today&apos;s Schedule</Text>
        {user && <Text className="text-text-secondary text-sm mt-1">{user.name}</Text>}
      </View>

      {currentPeriod ? (
        <Card padding="lg" style={{ marginBottom: 16, backgroundColor: "#1B3A6B" }}>
          <Text className="text-white text-sm font-medium mb-1">Current Period</Text>
          <Text className="text-white text-2xl font-bold">{currentPeriod.subjectName}</Text>
          <Text style={{ color: "#93C5FD" }} className="text-sm mt-1">{currentPeriod.sectionId}</Text>
          <Text style={{ color: "#93C5FD" }} className="text-sm">
            {currentPeriod.startTime} – {currentPeriod.endTime}
            {currentPeriod.room ? ` · Room ${currentPeriod.room}` : ""}
          </Text>
          <Button
            label="Mark Attendance"
            onPress={() => router.push(`/(teacher)/attendance/mark/${currentPeriod.sectionId}/${currentPeriod.periodNumber}`)}
            variant="secondary"
            size="sm"
            style={{ marginTop: 12 }}
          />
        </Card>
      ) : (
        <Card padding="md" style={{ marginBottom: 16 }}>
          <View className="flex-row items-center gap-3">
            <Text className="text-3xl">☀️</Text>
            <View>
              <Text className="font-semibold text-text-primary">No active period</Text>
              <Text className="text-text-secondary text-sm">
                {upcomingPeriods && upcomingPeriods.length > 0 ? "Next class coming up" : "No more classes today"}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {upcomingPeriods && upcomingPeriods.length > 0 && (
        <>
          <Text className="text-lg font-bold text-text-primary mb-3">Upcoming</Text>
          {upcomingPeriods.map((period) => (
            <Card
              key={period.id}
              padding="md"
              style={{ marginBottom: 8 }}
              onPress={() => router.push(`/(teacher)/attendance/mark/${period.sectionId}/${period.periodNumber}`)}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-semibold text-text-primary">{period.subjectName}</Text>
                  <Text className="text-text-secondary text-sm">{period.sectionId}</Text>
                </View>
                <Text className="text-accent font-medium">{period.startTime}</Text>
              </View>
            </Card>
          ))}
        </>
      )}

      {!currentPeriod && (!upcomingPeriods || upcomingPeriods.length === 0) && (
        <View className="items-center py-8">
          <Text className="text-4xl mb-2">🎉</Text>
          <Text className="text-text-secondary text-base">All done for today!</Text>
        </View>
      )}
    </ScrollView>
  );
}
