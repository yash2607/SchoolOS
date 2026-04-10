import { View, Text } from "react-native";
import { EmptyState } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";

export default function AcademicsScreen(): React.JSX.Element {
  // TODO: [PHASE-2] Full academics screen implementation
  return (
    <View className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-text-primary">Academics</Text>
      </View>
      <EmptyState
        icon={<Ionicons name="book-outline" size={48} color="#2E7DD1" />}
        title="Academics"
        description="View grades, assignments, and report cards for your child."
      />
    </View>
  );
}
