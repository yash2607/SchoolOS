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
      <View className="flex-1 bg-[#F4EFE6]">
        <View className="mx-4 mt-12 rounded-[30px] bg-[#102A43] px-5 py-5">
          <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#F0B429]">
            Premium ERP
          </Text>
          <Text className="mt-2 text-3xl font-black text-white">Academics</Text>
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
    <ScrollView className="flex-1 bg-[#F4EFE6]" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="mx-4 mt-12 rounded-[30px] bg-[#102A43] px-5 py-5">
        <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#F0B429]">
          Academic Overview
        </Text>
        <Text className="mt-2 text-3xl font-black text-white">Academics</Text>
        {activeChild && (
          <Text className="mt-2 text-sm text-[#BCCCDC]">
            {activeChild.fullName}
          </Text>
        )}
      </View>

      <View className="p-4 gap-3">
        {data && data.length > 0 ? (
          data.map((group) => (
            <Card key={group.subjectId} padding="md" style={{ borderRadius: 28 }}>
              <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#627D98] mb-2">
                Subject
              </Text>
              <Text className="text-xl font-black text-[#102A43] mb-3">
                {group.subjectName}
              </Text>

              <View className="gap-2">
                {group.items.map((item) => (
                  <View
                    key={item.id}
                    className="rounded-[22px] bg-[#F8FAFC] px-4 py-4"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-bold text-[#102A43]">
                          {item.title}
                        </Text>
                        {item.publishedAt && (
                          <Text className="text-xs text-[#627D98] mt-2">
                            Published {relativeTime(item.publishedAt)}
                          </Text>
                        )}
                      </View>

                      <Text className="text-sm font-black text-[#0F766E]">
                        {item.score ?? "-"} / {item.maxScore}
                      </Text>
                    </View>

                    {item.feedback && (
                      <Text className="text-xs text-[#486581] mt-3 leading-5">
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
