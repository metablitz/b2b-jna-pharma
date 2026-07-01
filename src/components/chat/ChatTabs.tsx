"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SUPPORT_ROOMS } from "@/lib/mock-data";
import { fetchChatRooms, type ChatRoomWithLastMsg } from "@/lib/api/chat";
import { fetchNotifications, markNotificationRead, type ApiNotification } from "@/lib/api/notifications";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";

const NOTIF_ICON: Record<string, string> = {
  order_placed: "🛍️",
  order_confirmed: "✅",
  order_shipping: "🚚",
  order_delivered: "🎉",
  order_cancelled: "❌",
  system: "🔔",
};

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

type Tab = "support" | "notifications";

export default function ChatTabs() {
  const [tab, setTab] = useState<Tab>("support");
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  // Support rooms — real from backend
  const [rooms, setRooms] = useState<ChatRoomWithLastMsg[]>([]);

  // Notifications — real from backend
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const localNotifications = useNotificationStore((s) => s.notifications);

  const loadRooms = useCallback(async () => {
    if (!accessToken) return;
    try { setRooms(await fetchChatRooms()); } catch {}
  }, [accessToken]);

  const loadNotifications = useCallback(async () => {
    if (!accessToken) return;
    try { setNotifications(await fetchNotifications()); } catch {}
  }, [accessToken]);

  useEffect(() => {
    loadRooms();
    loadNotifications();
  }, [loadRooms, loadNotifications]);

  type NotifItem = { id: string; type: string; title: string; body: string; isRead: boolean; createdAt: string; orderId?: string | null };

  // Merge local (order_placed from cart checkout) with backend notifications
  const allNotifications: NotifItem[] = [
    ...notifications,
    ...localNotifications
      .filter((ln) => !notifications.some((n) => n.orderId === (ln.orderId ?? null) && n.type === ln.type))
      .map((ln): NotifItem => ({ id: ln.id, type: ln.type, title: ln.title, body: ln.body, isRead: ln.isRead, createdAt: ln.createdAt, orderId: ln.orderId })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const groups: { dateLabel: string; items: NotifItem[] }[] = [];
  for (const notif of allNotifications) {
    const dateLabel = formatDateLabel(notif.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.dateLabel === dateLabel) last.items.push(notif);
    else groups.push({ dateLabel, items: [notif] });
  }

  function getRoomLastMsg(type: string) {
    const room = rooms.find((r) => r.type === type);
    return room?.messages[0]?.content ?? "Nhấn để bắt đầu trò chuyện";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 text-sm font-medium">
        {(["support", "notifications"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 ${tab === t ? "bg-primary text-white" : "bg-zinc-100 text-text-secondary"}`}>
            {t === "support" ? "Hỗ trợ" : "Thông báo"}
          </button>
        ))}
      </div>

      {tab === "support" ? (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase text-text-secondary">Phòng hỗ trợ</h2>
            {SUPPORT_ROOMS.map((room) => (
              <Link key={room.type} href={`/chat/${room.type}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3">
                <span className="text-xl">{room.icon}</span>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-text-primary">{room.label}</span>
                  <span className="truncate text-xs text-text-secondary">{getRoomLastMsg(room.type)}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase text-text-secondary">Hỗ trợ sản phẩm</h2>
            <p className="text-sm text-text-secondary">Chưa có sản phẩm nào được hỏi.</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="text-4xl">🔔</span>
              <p className="text-sm text-text-primary">Chưa có thông báo</p>
            </div>
          ) : groups.map((group) => (
            <div key={group.dateLabel} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-text-secondary">{group.dateLabel}</p>
              {group.items.map((notif) => (
                <button key={notif.id}
                  onClick={async () => {
                    if (!notif.isRead && notifications.some(n => n.id === notif.id)) {
                      await markNotificationRead(notif.id);
                      await loadNotifications();
                    }
                    if (notif.orderId) router.push("/orders");
                  }}
                  className="flex items-start gap-3 rounded-xl border border-zinc-100 p-3 text-left">
                  <span className="text-xl">{NOTIF_ICON[notif.type] ?? "🔔"}</span>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-text-primary">{notif.title}</span>
                    <span className="text-xs text-text-secondary">{notif.body}</span>
                    <span className="text-[10px] text-text-secondary">{formatTime(notif.createdAt)}</span>
                  </div>
                  {!notif.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
