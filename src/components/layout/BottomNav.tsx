"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/products", icon: "🏠", label: "Sản phẩm" },
  { href: "/chat", icon: "💬", label: "Chat" },
  { href: "/cart", icon: "🛒", label: "Giỏ hàng" },
  { href: "/orders", icon: "📋", label: "Đơn hàng" },
  { href: "/profile", icon: "👤", label: "Cá nhân" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-zinc-100 bg-white">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              active ? "text-primary" : "text-text-secondary"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
