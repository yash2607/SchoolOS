import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MarkAttendanceScreen(): React.JSX.Element {
  const router = useRouter();
  const { sectionId, periodNumber } = useLocalSearchParams<{ sectionId: string; periodNumber: string }>();

  return (
    <View className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-1 -ml-1 self-start p-1">
          <Ionicons name="chevron-back" size={24} color="#1B3A6B" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-text-primary">Mark Attendance</Text>
        <Text className="text-text-secondary text-sm mt-1">Period {periodNumber}</Text>
      </View>
    </View>
  );
}
