"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAdminChatRooms,
  fetchAdminChatMessages,
  adminSendChatMessage,
  type AdminChatRoom,
  type ChatMessageItem,
} from "@/lib/api/admin";

const ROOM_LABEL: Record<string, { icon: string; label: string }> = {
  general:     { icon: "🎧", label: "Hỗ trợ chung" },
  merchandise: { icon: "📦", label: "Hỗ trợ hàng hóa" },
  accounting:  { icon: "🧾", label: "Hóa đơn / Kế toán" },
  technical:   { icon: "🔧", label: "Kỹ thuật" },
  product:     { icon: "💊", label: "Hỗ trợ sản phẩm" },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminChatPage() {
  const [rooms, setRooms] = useState<AdminChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<AdminChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      const data = await fetchAdminChatRooms();
      setRooms(data);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    setLoadingMsgs(true);
    try {
      const data = await fetchAdminChatMessages(roomId);
      setMessages(data);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (!selectedRoom) return;
    loadMessages(selectedRoom.id);

    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(() => {
      loadMessages(selectedRoom.id);
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedRoom, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSelect(room: AdminChatRoom) {
    if (pollRef.current) clearInterval(pollRef.current);
    setSelectedRoom(room);
    setMessages([]);
    setInput("");
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom || !input.trim()) return;
    setSending(true);
    try {
      const msg = await adminSendChatMessage(selectedRoom.id, input.trim());
      setMessages((prev) => [...prev, msg]);
      setInput("");
      await loadRooms(); // refresh last message preview
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col gap-0">
      <h1 className="mb-4 text-xl font-bold text-text-primary">💬 Chat hỗ trợ</h1>

      <div className="flex flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {/* Room list */}
        <div className="flex w-64 shrink-0 flex-col border-r border-zinc-100">
          <div className="border-b border-zinc-100 p-3">
            <p className="text-xs font-semibold uppercase text-text-secondary">
              Phòng chat ({rooms.length})
            </p>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            {loadingRooms ? (
              <p className="p-3 text-xs text-text-secondary">Đang tải...</p>
            ) : rooms.length === 0 ? (
              <p className="p-3 text-xs text-text-secondary">Chưa có cuộc trò chuyện nào.</p>
            ) : rooms.map((room) => {
              const meta = ROOM_LABEL[room.type] ?? { icon: "💬", label: room.type };
              const lastMsg = room.messages[0];
              const isSelected = selectedRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => handleSelect(room)}
                  className={`flex flex-col gap-0.5 border-b border-zinc-50 px-3 py-2.5 text-left transition-colors ${
                    isSelected ? "bg-accent" : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-text-primary">
                      {room.pharmacy.code} · {room.pharmacy.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{meta.icon}</span>
                    <span className="text-[11px] text-text-secondary">{meta.label}</span>
                  </div>
                  {lastMsg && (
                    <p className="truncate text-[11px] text-text-secondary">
                      {lastMsg.senderType === "admin" ? "Bạn: " : ""}
                      {lastMsg.content}
                    </p>
                  )}
                  <p className="text-[10px] text-text-secondary">
                    {formatTime(room.lastMessageAt)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat thread */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {!selectedRoom ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <span className="text-4xl">💬</span>
              <p className="text-sm text-text-secondary">
                Chọn một phòng chat để bắt đầu hỗ trợ
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
                <span className="text-lg">
                  {ROOM_LABEL[selectedRoom.type]?.icon ?? "💬"}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {ROOM_LABEL[selectedRoom.type]?.label ?? selectedRoom.type}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {selectedRoom.pharmacy.name} · {selectedRoom.pharmacy.code}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
                {loadingMsgs && messages.length === 0 ? (
                  <p className="text-center text-xs text-text-secondary">Đang tải tin nhắn...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-xs text-text-secondary">
                    Chưa có tin nhắn nào trong phòng này.
                  </p>
                ) : messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.senderType === "admin" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                        msg.senderType === "admin"
                          ? "bg-primary text-white"
                          : "bg-zinc-100 text-text-primary"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="mt-0.5 text-[10px] text-text-secondary">
                      {msg.senderType === "admin" ? "Admin · " : "Nhà thuốc · "}
                      {formatTime(msg.sentAt)}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              <form
                onSubmit={handleSend}
                className="flex gap-2 border-t border-zinc-100 p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập phản hồi hỗ trợ..."
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {sending ? "..." : "Gửi"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
