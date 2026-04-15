import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokenStorage } from "../lib/tokenStorage.js";
import { apiClient } from "../lib/api.js";
import axios from "axios";
import type { UserRole } from "@schoolos/types";

export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  mobileE164: string | null;
  role: UserRole;
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
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: async (user, accessToken, refreshToken) => {
        await tokenStorage.setTokens(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        try { await apiClient.post("/api/v1/auth/logout"); } catch { /* ignore */ }
        await tokenStorage.clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      setLoading: (v) => set({ isLoading: v }),

      hydrate: async () => {
        set({ isLoading: true });
        try {
          const token = await tokenStorage.getAccessToken();
          if (!token) {
            // No token — but if we have persisted user, keep them logged in
            const { user } = get();
            set({ isLoading: false, isAuthenticated: !!user });
            return;
          }
          const { data } = await apiClient.get<{ user: AdminUser; school: { name: string } }>(
            "/api/v1/auth/me"
          );
          const user: AdminUser = { ...data.user, schoolName: data.school?.name ?? "" };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          // Only logout on 401 Unauthorized — keep session on network errors
          const status = axios.isAxiosError(err) ? err.response?.status : null;
          if (status === 401) {
            await tokenStorage.clearTokens();
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            // Network error / timeout — keep existing auth state from localStorage
            const { user } = get();
            set({ isLoading: false, isAuthenticated: !!user });
          }
        }
      },
    }),
    {
      name: "schoolos-admin-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
