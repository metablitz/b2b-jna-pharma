"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { useChatStore } from "@/stores/chat-store";
import { useNotificationStore } from "@/stores/notification-store";

export default function StoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useAdminAuthStore.persist.rehydrate();
    useChatStore.persist.rehydrate();
    useNotificationStore.persist.rehydrate();
  }, []);

  return null;
}
