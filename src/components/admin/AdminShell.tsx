"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import AdminGuard from "./AdminGuard";

const NAV = [
  { href: "/admin/products", icon: "💊", label: "Sản phẩm" },
  { href: "/admin/orders", icon: "📋", label: "Đơn hàng" },
  { href: "/admin/promotions", icon: "🏷️", label: "Khuyến mãi" },
  { href: "/admin/pharmacies", icon: "🏥", label: "Nhà thuốc" },
  { href: "/admin/chat", icon: "💬", label: "Chat hỗ trợ" },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const clear = useAdminAuthStore((state) => state.clear);

  return (
    <div className="flex min-h-full bg-zinc-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-4">
          <span className="text-xl">🏥</span>
          <div>
            <p className="text-xs font-bold text-text-primary">JNA Pharma</p>
            <p className="text-[10px] text-text-secondary">Admin Panel</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                pathname?.startsWith(item.href)
                  ? "bg-accent font-medium text-primary"
                  : "text-text-secondary hover:bg-zinc-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-zinc-200 p-3">
          <p className="truncate text-xs font-medium text-text-primary">{admin?.name}</p>
          <p className="truncate text-[10px] text-text-secondary">{admin?.email}</p>
          <button
            onClick={() => {
              clear();
              router.push("/admin/login");
            }}
            className="mt-2 text-xs font-medium text-error"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <Shell>{children}</Shell>
    </AdminGuard>
  );
}
