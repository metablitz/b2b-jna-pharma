"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { COMPANY } from "@/lib/constants";

type Step = 1 | 2 | 3;

interface FormState {
  // Step 1 — nhà thuốc
  name: string;
  ownerName: string;
  street: string;
  province: string;
  phone: string;
  // Step 2 — tài khoản
  password: string;
  confirmPassword: string;
  // Step 3 — giấy tờ
  licenseSubmitMethod: "uploaded" | "via_zalo" | "";
  businessLicenseFile: File | null;
  pharmacyLicenseFile: File | null;
}

const INITIAL: FormState = {
  name: "",
  ownerName: "",
  street: "",
  province: "",
  phone: "",
  password: "",
  confirmPassword: "",
  licenseSubmitMethod: "",
  businessLicenseFile: null,
  pharmacyLicenseFile: null,
};

const STEP_LABELS: Record<Step, string> = {
  1: "Nhà thuốc",
  2: "Tài khoản",
  3: "Giấy tờ",
};

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bizFileRef = useRef<HTMLInputElement>(null);
  const pharFileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep1() {
    if (!form.name.trim()) return "Vui lòng nhập tên nhà thuốc";
    if (!form.street.trim()) return "Vui lòng nhập địa chỉ";
    if (!form.phone.trim()) return "Vui lòng nhập số điện thoại";
    if (!/^(0|\+84)[0-9]{8,10}$/.test(form.phone))
      return "Số điện thoại không hợp lệ";
    return null;
  }

  function validateStep2() {
    if (!form.password) return "Vui lòng nhập mật khẩu";
    if (form.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    if (form.password !== form.confirmPassword)
      return "Mật khẩu xác nhận không khớp";
    return null;
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      setStep(3);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.licenseSubmitMethod) {
      setError("Vui lòng chọn cách nộp giấy tờ");
      return;
    }
    setLoading(true);
    try {
      const data = await register({
        name: form.name,
        ownerName: form.ownerName || undefined,
        street: form.street,
        province: form.province || undefined,
        phone: form.phone,
        password: form.password,
        licenseSubmitMethod: form.licenseSubmitMethod,
        businessLicenseFile: form.businessLicenseFile ?? undefined,
        pharmacyLicenseFile: form.pharmacyLicenseFile ?? undefined,
      });
      setSession(data);
      // Mark first login for welcome banner
      if (typeof window !== "undefined") {
        localStorage.setItem("jna_show_welcome", "1");
      }
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

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-6 bg-zinc-300" />}
            <span
              className={`flex items-center gap-1.5 font-medium ${
                step === s ? "text-primary" : step > s ? "text-green-600" : "text-text-secondary"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${
                  step === s ? "bg-primary" : step > s ? "bg-green-500" : "bg-zinc-300"
                }`}
              >
                {step > s ? "✓" : s}
              </span>
              {STEP_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1 — Thông tin nhà thuốc */}
      {step === 1 && (
        <form className="flex flex-col gap-4" onSubmit={handleNext}>
          <Field
            label="Tên nhà thuốc *"
            placeholder="VD: Nhà thuốc Bình An"
            value={form.name}
            onChange={(v) => set("name", v)}
          />
          <Field
            label="Họ tên chủ nhà thuốc"
            placeholder="Không bắt buộc"
            required={false}
            value={form.ownerName}
            onChange={(v) => set("ownerName", v)}
          />
          <Field
            label="Địa chỉ *"
            placeholder="VD: 123 Đường Lê Lợi, Phường 5, Quận 3, TP.HCM"
            value={form.street}
            onChange={(v) => set("street", v)}
          />
          <Field
            label="Tỉnh/Thành phố"
            placeholder="Không bắt buộc nếu đã ghi trong địa chỉ"
            required={false}
            value={form.province}
            onChange={(v) => set("province", v)}
          />
          <Field
            label="Số điện thoại *"
            placeholder="VD: 0901234567"
            type="tel"
            value={form.phone}
            onChange={(v) => set("phone", v)}
          />

          {error && <p className="text-sm text-error">{error}</p>}

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium uppercase text-white"
          >
            Tiếp theo →
          </button>
          <p className="text-center text-xs text-text-secondary">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-primary font-medium">
              Đăng nhập
            </Link>
          </p>
        </form>
      )}

      {/* Step 2 — Tạo mật khẩu */}
      {step === 2 && (
        <form className="flex flex-col gap-4" onSubmit={handleNext}>
          <Field
            label="Mật khẩu *"
            placeholder="Ít nhất 6 ký tự"
            type="password"
            value={form.password}
            onChange={(v) => set("password", v)}
          />
          <Field
            label="Xác nhận mật khẩu *"
            placeholder="Nhập lại mật khẩu"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => set("confirmPassword", v)}
          />

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setError(null); setStep(1); }}
              className="flex-1 rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary"
            >
              ← Quay lại
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium uppercase text-white"
            >
              Tiếp theo →
            </button>
          </div>
        </form>
      )}

      {/* Step 3 — Nộp giấy tờ */}
      {step === 3 && (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <p className="text-sm text-text-secondary">
            Cần nộp: <strong>Giấy phép đăng ký kinh doanh (GPDKKD)</strong> và{" "}
            <strong>Giấy phép hoạt động nhà thuốc</strong>.
          </p>

          {/* Method choice */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">
              Cách nộp giấy tờ *
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="method"
                value="uploaded"
                checked={form.licenseSubmitMethod === "uploaded"}
                onChange={() => set("licenseSubmitMethod", "uploaded")}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">Tải lên ngay</p>
                <p className="text-xs text-text-secondary">Ảnh chụp hoặc file PDF, tối đa 10MB mỗi file</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="method"
                value="via_zalo"
                checked={form.licenseSubmitMethod === "via_zalo"}
                onChange={() => set("licenseSubmitMethod", "via_zalo")}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">Gửi qua Zalo sau</p>
                <p className="text-xs text-text-secondary">
                  Gửi ảnh chụp tới Zalo hotline{" "}
                  <a
                    href={`https://zalo.me/${COMPANY.hotlineTel}`}
                    className="text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {COMPANY.hotline}
                  </a>
                </p>
              </div>
            </label>
          </div>

          {/* File uploads — shown only when "uploaded" is chosen */}
          {form.licenseSubmitMethod === "uploaded" && (
            <div className="flex flex-col gap-3">
              <FileUploadField
                label="GPDKKD (Giấy phép kinh doanh)"
                file={form.businessLicenseFile}
                inputRef={bizFileRef}
                onChange={(f) => set("businessLicenseFile", f)}
              />
              <FileUploadField
                label="Giấy phép hoạt động nhà thuốc"
                file={form.pharmacyLicenseFile}
                inputRef={pharFileRef}
                onChange={(f) => set("pharmacyLicenseFile", f)}
              />
            </div>
          )}

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setError(null); setStep(2); }}
              className="flex-1 rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary"
            >
              ← Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium uppercase text-white disabled:opacity-60"
            >
              {loading ? "Đang đăng ký..." : "Hoàn tất đăng ký"}
            </button>
          </div>
        </form>
      )}

      <div className="border-t border-zinc-100 pt-4 text-center text-xs text-text-secondary">
        {COMPANY.fullName}
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  required = true,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function FileUploadField({
  label,
  file,
  inputRef,
  onChange,
}: {
  label: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm text-text-secondary hover:border-primary hover:text-primary"
      >
        {file ? (
          <>
            <span className="text-green-600">✓</span>
            <span className="flex-1 truncate text-left text-green-700">{file.name}</span>
            <span
              role="button"
              className="text-xs text-zinc-400 hover:text-error"
              onClick={(e) => { e.stopPropagation(); onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
            >
              Xóa
            </span>
          </>
        ) : (
          <>
            <span>📎</span>
            <span>Chọn file ảnh hoặc PDF</span>
          </>
        )}
      </button>
    </div>
  );
}
