import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { LoadingSpinner } from "@schoolos/ui";
import { View } from "react-native";

export default function TeacherTabLayout(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner size="lg" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E5E7EB", height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: "#2E7DD1",
        tabBarInactiveTintColor: "#6B7280",
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Today", tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="assignments" options={{ title: "Assignments", tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: "Alerts", tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
