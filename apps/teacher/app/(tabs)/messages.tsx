import { View, Text } from "react-native";
import { EmptyState } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";

export default function TeacherMessagesScreen(): React.JSX.Element {
  return (
    <View className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-text-primary">Messages</Text>
      </View>
      <EmptyState
        icon={<Ionicons name="chatbubbles-outline" size={48} color="#2E7DD1" />}
        title="Parent Messages"
        description="View and respond to parent messages."
      />
    </View>
  );
}
