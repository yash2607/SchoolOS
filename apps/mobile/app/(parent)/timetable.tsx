import { View, Text } from "react-native";
import { EmptyState } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";

export default function TimetableScreen(): React.JSX.Element {
  return (
    <View className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
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
