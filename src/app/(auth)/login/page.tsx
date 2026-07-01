"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ phone, password });
      setSession(data);
      router.push("/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl">
          💊
        </div>
        <h1 className="text-xl font-bold text-text-primary">Chào mừng trở lại</h1>
        <p className="text-sm text-text-secondary">
          Đăng nhập để tiếp tục sử dụng hệ thống
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium text-text-primary">
            Số điện thoại
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-text-primary">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <Link
          href="/forgot-password"
          className="self-end text-sm font-medium text-primary"
        >
          Quên mật khẩu?
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium uppercase text-white disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <Link
          href="/register"
          className="rounded-lg border border-primary px-4 py-2.5 text-center text-sm font-medium text-primary"
        >
          Đăng ký nhà thuốc mới
        </Link>

        <Link href="/products" className="text-center text-sm text-text-secondary">
          👁 Xem sản phẩm trước khi đăng nhập
        </Link>
      </form>

      <div className="flex flex-col items-center gap-0.5 border-t border-zinc-100 pt-4 text-center text-xs text-text-secondary">
        <p>Hotline hỗ trợ: 0966 050306</p>
        <p>Công ty TNHH Thương mại và Dịch vụ Đầu tư Hùng Dũng</p>
      </div>
    </div>
  );
}
