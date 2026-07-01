"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SUPPORT_ROOMS } from "@/lib/mock-data";
import { fetchChatMessages, sendChatMessage, type ChatMessageItem } from "@/lib/api/chat";
import AuthGuard from "@/components/auth/AuthGuard";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function ChatRoomContent({ roomType }: { roomType: string }) {
  const room = SUPPORT_ROOMS.find((r) => r.type === roomType);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!room) return;
    fetchChatMessages(roomType)
      .then(({ messages: msgs }) => setMessages(msgs))
      .catch(() => {});
  }, [roomType, room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!room) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm font-medium text-text-primary">Không tìm thấy phòng hỗ trợ</p>
        <Link href="/chat" className="text-sm font-medium text-primary">Quay lại</Link>
      </div>
    );
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const msg = await sendChatMessage(roomType, trimmed);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        <Link href="/chat" aria-label="Quay lại" className="text-lg">←</Link>
        <span className="text-xl">{room.icon}</span>
        <span className="text-sm font-medium text-text-primary">{room.label}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-center text-xs text-text-secondary">
            Bắt đầu cuộc trò chuyện — đội ngũ hỗ trợ sẽ phản hồi sớm nhất.
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderType === "pharmacy" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
              msg.senderType === "pharmacy" ? "bg-primary text-white" : "bg-zinc-100 text-text-primary"}`}>
              {msg.content}
            </div>
            <span className="mt-0.5 text-[10px] text-text-secondary">{formatTime(msg.sentAt)}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="flex gap-2 border-t border-zinc-100 pt-3" onSubmit={handleSend}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button type="submit" disabled={sending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          Gửi
        </button>
      </form>
    </div>
  );
}

export default function ChatRoomPage({ params }: { params: Promise<{ roomType: string }> }) {
  const { roomType } = use(params);
  return (
    <AuthGuard>
      <ChatRoomContent roomType={roomType} />
    </AuthGuard>
  );
}
