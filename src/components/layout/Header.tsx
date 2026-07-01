"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";
import { fetchUnreadCount } from "@/lib/api/notifications";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [backendUnread, setBackendUnread] = useState(0);

  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // local order_placed notifications (created client-side on checkout)
  const localUnread = useNotificationStore(
    (state) => state.notifications.filter((n) => !n.isRead && n.type === "order_placed").length
  );

  useEffect(() => {
    if (!hasHydrated || !accessToken) {
      setBackendUnread(0);
      return;
    }
    fetchUnreadCount()
      .then(({ count }) => setBackendUnread(count))
      .catch(() => {});
  }, [hasHydrated, accessToken]);

  const unreadCount = backendUnread + localUnread;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  }

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-zinc-100 bg-white px-3 py-2.5">
      <form className="flex flex-1 items-center rounded-lg bg-zinc-100 px-3 py-2" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm thuốc..."
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); router.push("/products"); }}
            className="text-text-secondary">×</button>
        )}
      </form>
      <button aria-label="Quét mã QR" className="text-xl">📷</button>
      <Link href="/chat" aria-label="Thông báo" className="relative text-xl">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-badge-red px-1 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </Link>
      <Link href="/cart" aria-label="Giỏ hàng" className="relative text-xl">
        🛒
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-badge-red px-1 text-[10px] text-white">
            {cartCount}
          </span>
        )}
      </Link>
    </header>
  );
}
