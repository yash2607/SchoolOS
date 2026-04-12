import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card, EmptyState, SkeletonLoader } from "@schoolos/ui";
import { useMessageThread, useSendMessage } from "@schoolos/api";
import { formatTime } from "@schoolos/utils";
import { useAuthStore } from "../../../store/authStore";

export default function ParentMessageThreadScreen(): React.JSX.Element {
  const router = useRouter();
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { user } = useAuthStore();
  const [draft, setDraft] = useState("");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessageThread(threadId ?? null);
  const sendMessage = useSendMessage(threadId);

  const messages = data?.pages.slice().reverse().flatMap((page) => page.messages) ?? [];

  const submit = () => {
    const content = draft.trim();
    if (!threadId || !content || sendMessage.isPending) return;

    sendMessage.mutate(
      { threadId, content },
      {
        onSuccess: () => setDraft(""),
      }
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
            <Text className="text-xl font-bold text-text-primary">Messages</Text>
            <Text className="text-xs text-text-secondary mt-1">
              Parent-teacher conversation
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLoader key={index} variant="card" />
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 10 }}
        >
          {hasNextPage && (
            <Pressable
              className="self-center rounded-full bg-white px-4 py-2"
              onPress={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              <Text className="text-sm font-semibold text-accent">
                {isFetchingNextPage ? "Loading..." : "Load older messages"}
              </Text>
            </Pressable>
          )}

          {messages.length > 0 ? (
            messages.map((message) => {
              const mine = message.senderUserId === user?.id;
              return (
                <View
                  key={message.id}
                  className={mine ? "items-end" : "items-start"}
                >
                  <Card
                    padding="sm"
                    shadow={false}
                    style={{
                      maxWidth: "82%",
                      backgroundColor: mine ? "#DBEAFE" : "#FFFFFF",
                    }}
                  >
                    <Text className="text-sm text-text-primary">
                      {message.content}
                    </Text>
                    <Text className="text-[11px] text-text-secondary mt-2">
                      {formatTime(message.sentAt)}
                    </Text>
                  </Card>
                </View>
              );
            })
          ) : (
            <EmptyState
              icon={<Ionicons name="chatbubble-outline" size={48} color="#2E7DD1" />}
              title="No messages yet"
              description="Send the first message in this thread."
            />
          )}
        </ScrollView>
      )}

      <View className="bg-surface border-t border-gray-100 p-3">
        <View className="flex-row items-end gap-2">
          <TextInput
            className="flex-1 rounded-2xl bg-gray-100 px-4 py-3 text-text-primary"
            placeholder="Type a message"
            placeholderTextColor="#6B7280"
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable
            className="rounded-full bg-accent p-3"
            onPress={submit}
            disabled={!draft.trim() || sendMessage.isPending}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
