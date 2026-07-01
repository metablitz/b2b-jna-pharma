import { apiFetch } from "@/lib/api-client";

export interface ChatMessageItem {
  id: string;
  senderType: "pharmacy" | "admin";
  content: string;
  sentAt: string;
}

export interface ChatRoomWithLastMsg {
  id: string;
  type: string;
  lastMessageAt: string;
  messages: ChatMessageItem[];
}

export function fetchChatRooms() {
  return apiFetch<ChatRoomWithLastMsg[]>("/chat/rooms");
}

export function fetchChatMessages(type: string) {
  return apiFetch<{ room: { id: string }; messages: ChatMessageItem[] }>(
    `/chat/rooms/${type}/messages`
  );
}

export function sendChatMessage(type: string, content: string) {
  return apiFetch<ChatMessageItem>(`/chat/rooms/${type}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
