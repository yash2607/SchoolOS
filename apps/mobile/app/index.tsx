import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { LoadingSpinner } from "@schoolos/ui";
import { useAuthStore } from "../store/authStore";
import { apiClient } from "@schoolos/api";
import { tokenStorage } from "../lib/tokenStorage";
import { getGroupForRole } from "../lib/roleRouter";
import type { AuthUser, ChildProfile } from "@schoolos/types";

export default function IndexScreen(): React.JSX.Element {
  const router = useRouter();
  const { isLoading, isAuthenticated, user, setAuth, setLinkedChildren, setLoading } = useAuthStore();

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
        if (res.data.user.role === "PARENT") {
          try {
            const childrenRes = await apiClient.get<Array<{
              id: string;
              firstName: string;
              lastName: string;
              gradeId: string;
              sectionId: string;
              studentCode: string;
              photoUrl?: string | null;
              blurhash?: string | null;
            }>>("/api/v1/me/children");

            const children = childrenRes.data.map<ChildProfile>((child) => ({
              id: child.id,
              fullName: `${child.firstName} ${child.lastName}`.trim(),
              photoUrl: child.photoUrl ?? null,
              blurhash: child.blurhash ?? null,
              gradeId: child.gradeId,
              sectionId: child.sectionId,
              admissionNo: child.studentCode,
            }));
            setLinkedChildren(children);
          } catch {
            setLinkedChildren([]);
          }
        }
        router.replace(getGroupForRole(res.data.user.role));
      } catch {
        setLoading(false);
        router.replace("/(auth)/login");
      }
    }
    void init();
  }, [router, setAuth, setLinkedChildren, setLoading]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <LoadingSpinner size="lg" />
    </View>
  );
}
