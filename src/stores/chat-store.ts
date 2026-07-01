import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatRoomType } from "@/types";

export interface StoredChatMessage {
  id: string;
  senderType: "pharmacy" | "admin";
  content: string;
  sentAt: string;
}

const ROOM_GREETINGS: Record<ChatRoomType, string> = {
  general: "Xin chào! Đội ngũ hỗ trợ chung có thể giúp gì cho bạn?",
  merchandise: "Xin chào! Bạn cần hỗ trợ gì về hàng hóa, đổi trả?",
  accounting: "Xin chào! Bạn cần hỗ trợ gì về hóa đơn, công nợ?",
  technical: "Xin chào! Bạn đang gặp vấn đề kỹ thuật gì?",
  product: "Xin chào! Bạn muốn hỏi gì về sản phẩm này?",
};

const AUTO_REPLY =
  "Cảm ơn bạn đã liên hệ. Đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.";

export function seedMessages(roomType: ChatRoomType): StoredChatMessage[] {
  return [
    {
      id: `${roomType}-seed`,
      senderType: "admin",
      content: ROOM_GREETINGS[roomType],
      sentAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ];
}

interface ChatState {
  messagesByRoom: Partial<Record<ChatRoomType, StoredChatMessage[]>>;
  sendMessage: (roomType: ChatRoomType, content: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messagesByRoom: {},
      sendMessage: (roomType, content) => {
        const trimmed = content.trim();
        if (!trimmed) return;
        const current = get().messagesByRoom[roomType] ?? seedMessages(roomType);
        const message: StoredChatMessage = {
          id: `${roomType}-${Date.now()}`,
          senderType: "pharmacy",
          content: trimmed,
          sentAt: new Date().toISOString(),
        };
        set((state) => ({
          messagesByRoom: { ...state.messagesByRoom, [roomType]: [...current, message] },
        }));

        setTimeout(() => {
          const reply: StoredChatMessage = {
            id: `${roomType}-${Date.now()}-reply`,
            senderType: "admin",
            content: AUTO_REPLY,
            sentAt: new Date().toISOString(),
          };
          set((state) => ({
            messagesByRoom: {
              ...state.messagesByRoom,
              [roomType]: [...(state.messagesByRoom[roomType] ?? []), reply],
            },
          }));
        }, 1200);
      },
    }),
    { name: "jna-pharma-chat", skipHydration: true }
  )
);
