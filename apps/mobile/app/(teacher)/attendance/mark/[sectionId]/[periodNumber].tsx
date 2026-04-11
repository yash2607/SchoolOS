import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function MarkAttendanceScreen(): React.JSX.Element {
  const { sectionId, periodNumber } = useLocalSearchParams<{ sectionId: string; periodNumber: string }>();

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <Text className="text-2xl font-bold text-text-primary mb-2">Mark Attendance</Text>
      <Text className="text-text-secondary">Section: {sectionId} · Period: {periodNumber}</Text>
    </View>
  );
}
