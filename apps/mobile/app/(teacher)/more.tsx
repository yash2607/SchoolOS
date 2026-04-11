import { View, Text, ScrollView } from "react-native";
import { ListItem, SectionHeader } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function TeacherMoreScreen(): React.JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-text-primary">More</Text>
        {user && <Text className="text-text-secondary text-sm mt-1">{user.name}</Text>}
      </View>

      <SectionHeader title="Teaching" />
      <View className="bg-surface mx-4 rounded-xl overflow-hidden border border-gray-100">
        <ListItem
          title="Gradebook"
          left={<Ionicons name="analytics-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(teacher)/gradebook/index")}
        />
        <ListItem
          title="Students"
          left={<Ionicons name="people-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(teacher)/students/index")}
        />
        <ListItem
          title="Attendance History"
          left={<Ionicons name="checkmark-circle-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(teacher)/attendance/summary")}
        />
      </View>

      <SectionHeader title="Account" />
      <View className="bg-surface mx-4 rounded-xl overflow-hidden border border-gray-100">
        <ListItem
          title="Leave Management"
          left={<Ionicons name="calendar-outline" size={20} color="#2E7DD1" />}
          right={<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
          onPress={() => router.push("/(teacher)/leave/history")}
        />
        <ListItem
          title="Sign Out"
          left={<Ionicons name="log-out-outline" size={20} color="#B91C1C" />}
          onPress={() => void logout()}
          variant="destructive"
        />
      </View>
    </ScrollView>
  );
}
