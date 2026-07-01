import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NotificationType } from "@/types";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export interface StoredNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NewNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  orderId?: string;
}

interface NotificationState {
  notifications: StoredNotification[];
  addNotification: (input: NewNotificationInput) => void;
  markRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: MOCK_NOTIFICATIONS,
      addNotification: (input) =>
        set((state) => ({
          notifications: [
            {
              id: `notif-${Date.now()}`,
              isRead: false,
              createdAt: new Date().toISOString(),
              ...input,
            },
            ...state.notifications,
          ],
        })),
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
    }),
    { name: "jna-pharma-notifications", skipHydration: true }
  )
);
