import { View, Text } from "react-native";
import { EmptyState } from "@schoolos/ui";
import { Ionicons } from "@expo/vector-icons";

export default function FeesScreen(): React.JSX.Element {
  // TODO: [PHASE-2] Full fees screen implementation
  return (
    <View className="flex-1 bg-background">
      <View className="bg-surface px-4 pt-12 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-text-primary">Fees</Text>
      </View>
      <EmptyState
        icon={<Ionicons name="card-outline" size={48} color="#2E7DD1" />}
        title="Fee Schedule"
        description="View and pay your child's school fees."
      />
    </View>
  );
}
