import { create } from "zustand";
import type { AuthUser } from "@schoolos/types";

export interface School {
  id: string;
  name: string;
  timezone: string;
  logoUrl: string | null;
}

interface TeacherAuthState {
  user: AuthUser | null;
  school: School | null;
  teacherId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: AuthUser, school: School, teacherId: string) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<TeacherAuthState>((set) => ({
  user: null,
  school: null,
  teacherId: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, school, teacherId) =>
    set({ user, school, teacherId, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    const { tokenStorage } = await import("../lib/tokenStorage");
    await tokenStorage.clearTokens();
    set({
      user: null,
      school: null,
      teacherId: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
