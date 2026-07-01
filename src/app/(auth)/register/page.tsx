"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

interface FormState {
  name: string;
  businessLicense: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  businessLicense: "",
  street: "",
  ward: "",
  district: "",
  province: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        name: form.name,
        businessLicense: form.businessLicense,
        street: form.street,
        ward: form.ward,
        district: form.district,
        province: form.province,
        phone: form.phone,
        password: form.password,
      });
      setSession(data);
      router.push("/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-xl font-bold text-text-primary">
        Đăng ký nhà thuốc mới
      </h1>

      <div className="flex items-center justify-center gap-3 text-sm">
        <span
          className={`flex items-center gap-1 font-medium ${
            step === 1 ? "text-primary" : "text-text-secondary"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${
              step === 1 ? "bg-primary" : "bg-zinc-300"
            }`}
          >
            1
          </span>
          Nhà thuốc
        </span>
        <span className="h-px w-8 bg-zinc-300" />
        <span
          className={`flex items-center gap-1 font-medium ${
            step === 2 ? "text-primary" : "text-text-secondary"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${
              step === 2 ? "bg-primary" : "bg-zinc-300"
            }`}
          >
            2
          </span>
          Tài khoản
        </span>
      </div>

      {step === 1 ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <Field
            label="Tên nhà thuốc"
            placeholder="Nhập tên nhà thuốc"
            value={form.name}
            onChange={(v) => update("name", v)}
          />
          <Field
            label="Số giấy phép kinh doanh"
            placeholder="Nhập số giấy phép"
            value={form.businessLicense}
            onChange={(v) => update("businessLicense", v)}
          />
          <Field
            label="Địa chỉ"
            placeholder="Số nhà, đường"
            value={form.street}
            onChange={(v) => update("street", v)}
          />
          <Field
            label="Phường/Xã"
            placeholder="Nhập phường/xã"
            value={form.ward}
            onChange={(v) => update("ward", v)}
          />
          <Field
            label="Quận/Huyện"
            placeholder="Nhập quận/huyện"
            value={form.district}
            onChange={(v) => update("district", v)}
          />
          <Field
            label="Tỉnh/Thành phố"
            placeholder="Nhập tỉnh/thành phố"
            value={form.province}
            onChange={(v) => update("province", v)}
          />

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium uppercase text-white"
          >
            Tiếp theo
          </button>

          <Link href="/terms" className="text-center text-sm font-medium text-primary">
            Điều khoản sử dụng
          </Link>
        </form>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            type="tel"
            value={form.phone}
            onChange={(v) => update("phone", v)}
          />
          <Field
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
          />
          <Field
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => update("confirmPassword", v)}
          />

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium uppercase text-white disabled:opacity-60"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </div>
        </form>
      )}

      <div className="border-t border-zinc-100 pt-4 text-center text-xs text-text-secondary">
        Công ty TNHH Thương mại và Dịch vụ Đầu tư Hùng Dũng
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
