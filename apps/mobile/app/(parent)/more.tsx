import { View, Text, ScrollView } from "react-native";
import { ListItem, SectionHeader } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function ParentMoreScreen(): React.JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-text-primary">More</Text>
        {user && <Text className="text-text-secondary text-sm mt-1">{user.name}</Text>}
      </View>

      <SectionHeader title="My Child" />
      <View className="bg-surface mx-4 rounded-xl overflow-hidden border border-gray-100">
        <ListItem
          title="Attendance"
          left={<Ionicons name="checkmark-circle-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(parent)/attendance/index")}
        />
        <ListItem
          title="Timetable"
          left={<Ionicons name="calendar-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(parent)/timetable")}
        />
        <ListItem
          title="School Calendar"
          left={<Ionicons name="today-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(parent)/calendar")}
        />
        <ListItem
          title="Notifications"
          left={<Ionicons name="notifications-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(parent)/notifications/index")}
        />
      </View>

      <SectionHeader title="Account" />
      <View className="bg-surface mx-4 rounded-xl overflow-hidden border border-gray-100">
        <ListItem
          title="My Profile"
          left={<Ionicons name="person-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(parent)/settings/profile")}
        />
        <ListItem
          title="Notification Preferences"
          left={<Ionicons name="settings-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(parent)/settings/notifications")}
        />
        <ListItem
          title="Sign Out"
          left={<Ionicons name="log-out-outline" size={20} color="#B91C1C" />}
          onPress={() => void logout()}
          variant="destructive"
        />
      </View>

      <View className="p-4 mt-8">
        <Text className="text-center text-xs text-text-secondary">
          SchoolOS v1.0.0 · Powered by Claude AI
        </Text>
      </View>
    </ScrollView>
  );
}
