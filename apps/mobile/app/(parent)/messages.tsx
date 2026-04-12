import { ScrollView, View, Text, RefreshControl } from "react-native";
import { EmptyState, Card, Badge, SkeletonLoader } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useConversations } from "@schoolos/api";
import { relativeTime } from "@schoolos/utils";
import { useAuthStore } from "../../store/authStore";

export default function MessagesScreen(): React.JSX.Element {
  const router = useRouter();
  const { activeChildId, activeChild } = useAuthStore();
  const { data, isLoading, isRefetching, refetch } = useConversations();
  const threads = activeChildId
    ? data?.filter((thread) => thread.studentId === activeChildId)
    : data;

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
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
      }
    >
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-text-primary">Messages</Text>
        {activeChild && (
          <Text className="text-text-secondary text-sm mt-1">
            {activeChild.fullName}
          </Text>
        )}
      </View>

      <View className="p-4 gap-3">
        {threads && threads.length > 0 ? (
          threads.map((thread) => (
            <Card
              key={thread.id}
              padding="md"
              onPress={() => router.push(`/(parent)/messages/${thread.id}`)}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-bold text-text-primary">
                    Teacher conversation
                  </Text>
                  <Text className="text-sm text-text-secondary mt-1" numberOfLines={2}>
                    {thread.lastMessage?.content ?? "No messages yet. Start the conversation."}
                  </Text>
                  {(thread.lastMessage?.sentAt ?? thread.lastMessageAt) && (
                    <Text className="text-xs text-text-secondary mt-2">
                      {relativeTime(thread.lastMessage?.sentAt ?? thread.lastMessageAt ?? "")}
                    </Text>
                  )}
                </View>
                {thread.unreadCount > 0 && (
                  <Badge label={`${thread.unreadCount}`} color="blue" size="sm" />
                )}
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<Ionicons name="chatbubbles-outline" size={48} color="#2E7DD1" />}
            title="No message threads yet"
            description="Conversations with your child's teachers will appear here."
          />
        )}
      </View>
    </ScrollView>
  );
}
