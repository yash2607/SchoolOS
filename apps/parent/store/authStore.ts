import { create } from "zustand";
import { tokenStorage, clearBiometricRefreshToken } from "../lib/tokenStorage";
import type { AuthUser, ChildProfile } from "@schoolos/types";

export interface School {
  id: string;
  name: string;
  timezone: string;
  logoUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  school: School | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Which child is currently active (parent-specific) */
  activeChildId: string | null;
  activeChild: ChildProfile | null;
  linkedChildren: ChildProfile[];

  setAuth: (user: AuthUser, school: School) => void;
  setLinkedChildren: (children: ChildProfile[]) => void;
  setActiveChild: (childId: string, child: ChildProfile) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  school: null,
  isAuthenticated: false,
  isLoading: true,
  activeChildId: null,
  activeChild: null,
  linkedChildren: [],

  setAuth: (user, school) =>
    set({ user, school, isAuthenticated: true, isLoading: false }),

  setLinkedChildren: (children) => {
    const first = children[0];
    set({
      linkedChildren: children,
      activeChildId: first?.id ?? null,
      activeChild: first ?? null,
    });
  },

  setActiveChild: (childId, child) =>
    set({ activeChildId: childId, activeChild: child }),

  logout: async () => {
    await tokenStorage.clearTokens();
    await clearBiometricRefreshToken().catch(() => {});
    set({
      user: null,
      school: null,
      isAuthenticated: false,
      isLoading: false,
      activeChildId: null,
      activeChild: null,
      linkedChildren: [],
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
