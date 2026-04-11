import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { LoadingSpinner } from "@schoolos/ui";
import { useAuthStore } from "../store/authStore";
import { apiClient } from "@schoolos/api";
import { tokenStorage } from "../lib/tokenStorage";
import { getGroupForRole } from "../lib/roleRouter";
import type { AuthUser } from "@schoolos/types";

export default function IndexScreen(): React.JSX.Element {
  const router = useRouter();
  const { isLoading, isAuthenticated, user, setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function init() {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        router.replace("/(auth)/login");
        return;
      }
      try {
        const res = await apiClient.get<{
          user: AuthUser & { role: string };
          school: { id: string; name: string; timezone: string; logoUrl: string | null };
          teacherId?: string;
        }>("/api/v1/auth/me");
        setAuth(res.data.user, res.data.school, res.data.teacherId);
        router.replace(getGroupForRole(res.data.user.role));
      } catch {
        setLoading(false);
        router.replace("/(auth)/login");
      }
    }
    void init();
  }, [router, setAuth, setLoading]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <LoadingSpinner size="lg" />
    </View>
  );
}
