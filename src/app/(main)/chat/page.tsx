import ChatTabs from "@/components/chat/ChatTabs";
import AuthGuard from "@/components/auth/AuthGuard";

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatTabs />
    </AuthGuard>
  );
}
