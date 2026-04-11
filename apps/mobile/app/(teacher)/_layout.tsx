import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { LoadingSpinner } from "@schoolos/ui";
import { View } from "react-native";

export default function TeacherLayout(): React.JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner size="lg" />
      </View>
    );
  }

  if (!isAuthenticated || !user || (user.role !== "CLASS_TEACHER" && user.role !== "SUBJECT_TEACHER")) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#1B3A6B",
        tabBarInactiveTintColor: "#6B7280",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="today-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: "Assignments",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Non-tab screens */}
      <Tabs.Screen name="attendance/index" options={{ href: null }} />
      <Tabs.Screen name="attendance/mark/[sectionId]/[periodNumber]" options={{ href: null }} />
      <Tabs.Screen name="attendance/summary" options={{ href: null }} />
      <Tabs.Screen name="gradebook/index" options={{ href: null }} />
      <Tabs.Screen name="leave/history" options={{ href: null }} />
      <Tabs.Screen name="students/index" options={{ href: null }} />
      <Tabs.Screen name="settings/profile" options={{ href: null }} />
    </Tabs>
  );
}
