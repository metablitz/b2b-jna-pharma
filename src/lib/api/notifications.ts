import { apiFetch } from "@/lib/api-client";

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}

export function fetchNotifications() {
  return apiFetch<ApiNotification[]>("/notifications");
}

export function markNotificationRead(id: string) {
  return apiFetch<ApiNotification>(`/notifications/${id}/read`, { method: "PUT" });
}

export function fetchUnreadCount() {
  return apiFetch<{ count: number }>("/notifications/unread-count");
}
