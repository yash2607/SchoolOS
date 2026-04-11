import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { LoadingSpinner } from "@schoolos/ui";
import { View } from "react-native";

export default function AdminLayout(): React.JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner size="lg" />
      </View>
    );
  }

  const isAdmin =
    user?.role === "SCHOOL_ADMIN" ||
    user?.role === "ACADEMIC_COORD" ||
    user?.role === "SUPER_ADMIN";

  if (!isAuthenticated || !isAdmin) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
