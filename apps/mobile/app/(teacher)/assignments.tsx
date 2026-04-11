import { View, Text } from "react-native";
import { EmptyState } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";

export default function AssignmentsScreen(): React.JSX.Element {
  return (
    <View className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-text-primary">Assignments</Text>
      </View>
      <EmptyState
        icon={<Ionicons name="document-text-outline" size={48} color="#2E7DD1" />}
        title="Assignments"
        description="Create and manage assignments for your classes."
        action={{ label: "Create Assignment", onPress: () => {} }}
      />
    </View>
  );
}
