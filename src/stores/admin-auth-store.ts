import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AdminAuthState {
  accessToken: string | null;
  admin: AdminUser | null;
  hasHydrated: boolean;
  setSession: (data: { accessToken: string; admin: AdminUser }) => void;
  clear: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      admin: null,
      hasHydrated: false,
      setSession: ({ accessToken, admin }) => set({ accessToken, admin }),
      clear: () => set({ accessToken: null, admin: null }),
    }),
    {
      name: "jna-pharma-admin-auth",
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useAdminAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
