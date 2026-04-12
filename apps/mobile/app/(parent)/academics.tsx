import { ScrollView, View, Text } from "react-native";
import { Card, EmptyState, SkeletonLoader } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useStudentGrades } from "@schoolos/api";
import { relativeTime } from "@schoolos/utils";

export default function AcademicsScreen(): React.JSX.Element {
  const { activeChildId, activeChild } = useAuthStore();
  const { data, isLoading } = useStudentGrades(activeChildId);

  if (!activeChildId) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
          <Text className="text-2xl font-bold text-text-primary">Academics</Text>
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
        <Text className="text-2xl font-bold text-text-primary">Academics</Text>
        {activeChild && (
          <Text className="text-text-secondary text-sm mt-1">
            {activeChild.fullName}
          </Text>
        )}
      </View>

      <View className="p-4 gap-3">
        {data && data.length > 0 ? (
          data.map((group) => (
            <Card key={group.subjectId} padding="md">
              <Text className="text-lg font-bold text-text-primary mb-3">
                {group.subjectName}
              </Text>

              <View className="gap-2">
                {group.items.map((item) => (
                  <View
                    key={item.id}
                    className="rounded-xl bg-gray-50 px-3 py-3"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-semibold text-text-primary">
                          {item.title}
                        </Text>
                        {item.publishedAt && (
                          <Text className="text-xs text-text-secondary mt-1">
                            Published {relativeTime(item.publishedAt)}
                          </Text>
                        )}
                      </View>

                      <Text className="text-sm font-bold text-accent">
                        {item.score ?? "-"} / {item.maxScore}
                      </Text>
                    </View>

                    {item.feedback && (
                      <Text className="text-xs text-text-secondary mt-2">
                        {item.feedback}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<Ionicons name="book-outline" size={48} color="#2E7DD1" />}
            title="No grades yet"
            description="Grades and assignment feedback will appear here once teachers publish them."
          />
        )}
      </View>
    </ScrollView>
  );
}
