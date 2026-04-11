import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokenStorage } from "../lib/tokenStorage.js";
import { apiClient } from "../lib/api.js";

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  role: "SUPER_ADMIN" | "SCHOOL_ADMIN" | "ACADEMIC_COORD" | "CLASS_TEACHER" | "SUBJECT_TEACHER";
  schoolId: string;
  schoolName: string;
  sessionId: string;
}

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AdminUser, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (v: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: async (user, accessToken, refreshToken) => {
        await tokenStorage.setTokens(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await apiClient.post("/api/v1/auth/logout");
        } catch {
          // ignore errors on logout
        }
        await tokenStorage.clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      setLoading: (v) => set({ isLoading: v }),

      hydrate: async () => {
        set({ isLoading: true });
        try {
          const token = await tokenStorage.getAccessToken();
          if (!token) {
            set({ isLoading: false });
            return;
          }
          const { data } = await apiClient.get<{ user: AdminUser; school: { name: string } }>(
            "/api/v1/auth/me"
          );
          const user: AdminUser = {
            ...data.user,
            schoolName: data.school?.name ?? "",
          };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          await tokenStorage.clearTokens();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "schoolos-admin-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
