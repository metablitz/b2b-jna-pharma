import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthPharmacy {
  id: string;
  code: string;
  name: string;
  phone: string;
  memberTier: string;
  street: string;
  ward: string;
  district: string;
  province: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  pharmacy: AuthPharmacy | null;
  hasHydrated: boolean;
  setSession: (data: {
    accessToken: string;
    refreshToken: string;
    pharmacy: AuthPharmacy;
  }) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      pharmacy: null,
      hasHydrated: false,
      setSession: ({ accessToken, refreshToken, pharmacy }) =>
        set({ accessToken, refreshToken, pharmacy }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clear: () => set({ accessToken: null, refreshToken: null, pharmacy: null }),
    }),
    {
      name: "jna-pharma-auth",
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
