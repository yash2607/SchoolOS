import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortalState {
  activeStudentId: string | null;
  setActiveStudentId: (studentId: string | null) => void;
}

export const usePortalStore = create<PortalState>()(
  persist(
    (set) => ({
      activeStudentId: null,
      setActiveStudentId: (activeStudentId) => set({ activeStudentId }),
    }),
    {
      name: "schoolos-web-portal",
    },
  ),
);
