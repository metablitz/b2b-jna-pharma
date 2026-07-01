"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

export default function CartSync() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refresh = useCartStore((state) => state.refresh);
  const reset = useCartStore((state) => state.reset);

  useEffect(() => {
    if (!hasHydrated) return;
    if (accessToken) {
      refresh();
    } else {
      reset();
    }
  }, [hasHydrated, accessToken, refresh, reset]);

  return null;
}
