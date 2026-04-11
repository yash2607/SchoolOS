import { View, Text } from "react-native";
import { Button } from "@schoolos/ui";
import { useAuthStore } from "../../store/authStore";

export default function AdminScreen(): React.JSX.Element {
  const { user, school, logout } = useAuthStore();

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4">
        <Text className="text-white text-2xl font-bold">S</Text>
      </View>
      <Text className="text-2xl font-bold text-text-primary mb-1">SchoolOS Admin</Text>
      {school && <Text className="text-text-secondary text-base mb-2">{school.name}</Text>}
      {user && (
        <Text className="text-text-secondary text-sm mb-8">
          {user.name} · {user.role}
        </Text>
      )}
      <Text className="text-center text-text-secondary text-sm mb-8">
        The admin portal is available on web.{"\n"}
        Use a browser to access the full dashboard.
      </Text>
      <Button label="Sign Out" onPress={() => void logout()} variant="secondary" size="lg" />
    </View>
  );
}
