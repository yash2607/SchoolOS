import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function FeePayScreen(): React.JSX.Element {
  const { feeId } = useLocalSearchParams<{ feeId: string }>();

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <Text className="text-2xl font-bold text-text-primary mb-2">Pay Fee</Text>
      <Text className="text-text-secondary">Installment: {feeId}</Text>
    </View>
  );
}
