import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";

export default function TimetableScreen(): React.JSX.Element {
  const router = useRouter();
  return (
    <View className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-1 -ml-1 self-start p-1">
          <Ionicons name="chevron-back" size={24} color="#2E7DD1" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-text-primary">Timetable</Text>
      </View>
      <EmptyState
        icon={<Ionicons name="calendar-outline" size={48} color="#2E7DD1" />}
        title="Timetable"
        description="View your child's weekly class schedule."
      />
    </View>
  );
}
