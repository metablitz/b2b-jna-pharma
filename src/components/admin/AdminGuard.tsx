"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth-store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAdminAuthStore((state) => state.hasHydrated);
  const accessToken = useAdminAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (hasHydrated && !accessToken) router.replace("/admin/login");
  }, [hasHydrated, accessToken, router]);

  if (!hasHydrated || !accessToken) return null;
  return <>{children}</>;
}
