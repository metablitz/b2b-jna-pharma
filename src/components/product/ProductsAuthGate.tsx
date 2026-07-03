"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

export default function ProductsAuthGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const pharmacy = useAuthStore((s) => s.pharmacy);

  if (!hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-sm text-text-secondary">Đang tải...</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="text-5xl">💊</span>
        <h2 className="text-lg font-bold text-text-primary">
          Nền tảng B2B phân phối dược phẩm
        </h2>
        <p className="max-w-xs text-sm text-text-secondary">
          Đăng nhập để xem danh sách sản phẩm và giá sỉ dành riêng cho nhà thuốc.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-primary px-4 py-2.5 text-center text-sm font-medium text-primary"
          >
            Đăng ký nhà thuốc
          </Link>
        </div>
      </div>
    );
  }

  if (pharmacy?.status === "pending") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="text-5xl">⏳</span>
        <h2 className="text-lg font-bold text-text-primary">
          Tài khoản đang chờ xác nhận
        </h2>
        <p className="max-w-xs text-sm text-text-secondary">
          Đội ngũ JNA Pharma đang xem xét thông tin nhà thuốc của bạn.
          Chúng tôi sẽ thông báo ngay khi tài khoản được duyệt (thường trong 1 ngày làm việc).
        </p>
        <div className="flex flex-col gap-1 rounded-xl bg-accent px-4 py-3 text-xs text-text-secondary">
          <span>Cần hỗ trợ? Liên hệ hotline</span>
          <a href="tel:0966050306" className="font-bold text-primary text-sm">
            0966 050 306
          </a>
        </div>
      </div>
    );
  }

  if (pharmacy?.status === "suspended") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="text-5xl">🚫</span>
        <h2 className="text-lg font-bold text-text-primary">
          Tài khoản tạm thời bị khóa
        </h2>
        <p className="max-w-xs text-sm text-text-secondary">
          Tài khoản nhà thuốc của bạn đang bị tạm khóa.
          Vui lòng liên hệ JNA Pharma để biết thêm thông tin.
        </p>
        <div className="flex flex-col gap-1 rounded-xl bg-red-50 px-4 py-3 text-xs text-text-secondary">
          <span>Liên hệ hỗ trợ</span>
          <a href="tel:0966050306" className="font-bold text-error text-sm">
            0966 050 306
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
