"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/stores/auth-store";
import { COMPANY } from "@/lib/constants";
import { updateProfile, changePassword, fetchCredit, type CreditInfo } from "@/lib/api/profile";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type ApiAddress,
  type AddressPayload,
} from "@/lib/api/addresses";
import { ApiError } from "@/lib/api-client";

const TIER_LABEL: Record<string, string> = {
  bronze: "🟤 Đồng",
  silver: "⚪ Bạc",
  gold: "🟡 Vàng",
};

type Modal = null | "edit-info" | "change-password" | "add-address" | "edit-address";

const BLANK_ADDR: AddressPayload = { label: "Nhà thuốc", street: "", ward: "", district: "", province: "", phone: "" };

function ProfileContent() {
  const router = useRouter();
  const pharmacy = useAuthStore((s) => s.pharmacy);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [modal, setModal] = useState<Modal>(null);
  const [name, setName] = useState(pharmacy?.name ?? "");
  const [email, setEmail] = useState("");
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [addrForm, setAddrForm] = useState<AddressPayload>(BLANK_ADDR);
  const [editAddrId, setEditAddrId] = useState<string | null>(null);
  const [credit, setCredit] = useState<CreditInfo | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchAddresses().then(setAddresses).catch(() => {});
      fetchCredit().then(setCredit).catch(() => {});
    }
  }, [accessToken]);

  async function saveInfo() {
    setSaving(true); setMsg(null);
    try {
      const updated = await updateProfile({ name, ...(email ? { email } : {}) });
      if (accessToken && refreshToken) {
        setSession({ accessToken, refreshToken, pharmacy: { ...(pharmacy!), name: updated.name } });
      }
      setMsg({ type: "ok", text: "Đã cập nhật thông tin." });
      setModal(null);
    } catch (e) {
      setMsg({ type: "err", text: e instanceof ApiError ? e.message : "Lỗi cập nhật" });
    } finally { setSaving(false); }
  }

  async function savePwd() {
    if (newPwd !== confirmPwd) { setMsg({ type: "err", text: "Mật khẩu xác nhận không khớp" }); return; }
    setSaving(true); setMsg(null);
    try {
      await changePassword(curPwd, newPwd);
      setMsg({ type: "ok", text: "Đã đổi mật khẩu thành công." });
      setModal(null);
      setCurPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (e) {
      setMsg({ type: "err", text: e instanceof ApiError ? e.message : "Lỗi đổi mật khẩu" });
    } finally { setSaving(false); }
  }

  async function saveAddress() {
    setSaving(true);
    try {
      if (editAddrId) {
        await updateAddress(editAddrId, addrForm);
      } else {
        await createAddress(addrForm);
      }
      setAddresses(await fetchAddresses());
      setModal(null);
    } catch (e) {
      setMsg({ type: "err", text: e instanceof ApiError ? e.message : "Lỗi lưu địa chỉ" });
    } finally { setSaving(false); }
  }

  async function handleDeleteAddr(id: string) {
    if (!confirm("Xóa địa chỉ này?")) return;
    await deleteAddress(id);
    setAddresses(await fetchAddresses());
  }

  async function handleSetDefault(id: string) {
    const updated = await setDefaultAddress(id);
    setAddresses(updated);
  }

  function openAddAddr() {
    setAddrForm(BLANK_ADDR); setEditAddrId(null); setMsg(null); setModal("add-address");
  }

  function openEditAddr(addr: ApiAddress) {
    setAddrForm({ label: addr.label, street: addr.street, ward: addr.ward, district: addr.district, province: addr.province, phone: addr.phone ?? "" });
    setEditAddrId(addr.id); setMsg(null); setModal("edit-address");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div className="flex flex-col items-center gap-1 rounded-xl bg-accent p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl">🏬</div>
        <p className="text-base font-bold text-text-primary">{pharmacy?.name}</p>
        <p className="text-sm text-text-secondary">Mã {pharmacy?.code} · {pharmacy?.phone}</p>
        <span className="rounded-full bg-member-bronze px-2 py-0.5 text-xs font-medium text-white">
          {TIER_LABEL[pharmacy?.memberTier ?? "bronze"]}
        </span>
      </div>

      {/* Credit card widget */}
      {credit && <CreditCard credit={credit} />}

      {msg && (
        <p className={`rounded-lg px-3 py-2 text-sm ${msg.type === "ok" ? "bg-accent text-primary" : "bg-red-50 text-error"}`}>
          {msg.text}
        </p>
      )}

      {/* Orders / Chat links */}
      <Section title="Quản lý">
        <Row icon="📋" label="Lịch sử đơn hàng" href="/orders" />
        <Row icon="💬" label="Tin nhắn hỗ trợ" href="/chat" />
      </Section>

      {/* Account settings */}
      <Section title="Tài khoản">
        <button onClick={() => { setName(pharmacy?.name ?? ""); setModal("edit-info"); setMsg(null); }}
          className="flex items-center gap-3 p-3 text-sm text-text-primary">
          <span className="text-lg">👤</span>Thông tin cá nhân
        </button>
        <button onClick={() => { setCurPwd(""); setNewPwd(""); setConfirmPwd(""); setModal("change-password"); setMsg(null); }}
          className="flex items-center gap-3 border-t border-zinc-100 p-3 text-sm text-text-primary">
          <span className="text-lg">🔒</span>Đổi mật khẩu
        </button>
      </Section>

      {/* Address management */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase text-text-secondary">Địa chỉ giao hàng</h2>
          <button onClick={openAddAddr} className="text-xs font-medium text-primary">+ Thêm địa chỉ</button>
        </div>
        <div className="flex flex-col gap-2">
          {addresses.length === 0 ? (
            <button onClick={openAddAddr}
              className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-3 text-sm text-text-secondary">
              <span>📍</span> Thêm địa chỉ giao hàng đầu tiên
            </button>
          ) : addresses.map((addr) => (
            <div key={addr.id} className={`flex flex-col gap-1 rounded-xl border p-3 ${addr.isDefault ? "border-primary bg-accent" : "border-zinc-100"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-text-primary">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">Mặc định</span>
                  )}
                </div>
                <div className="flex gap-2 text-xs">
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-primary">Đặt mặc định</button>
                  )}
                  <button onClick={() => openEditAddr(addr)} className="text-text-secondary">Sửa</button>
                  <button onClick={() => handleDeleteAddr(addr.id)} className="text-error">Xóa</button>
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                {addr.street}, {addr.ward}, {addr.district}, {addr.province}
              </p>
              {addr.phone && <p className="text-xs text-text-secondary">{addr.phone}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <Section title="Hỗ trợ">
        <Row icon="🎧" label={`Hotline ${COMPANY.hotline}`} href={`tel:${COMPANY.hotlineTel}`} />
        <Row icon="ℹ️" label="Về ứng dụng" href="/profile" />
      </Section>

      <button onClick={() => { clear(); router.push("/login"); }}
        className="rounded-lg border border-error px-4 py-2.5 text-sm font-medium text-error">
        → Đăng xuất
      </button>
      <p className="text-center text-xs text-text-secondary">Phiên bản 1.0.0</p>

      {/* Edit info modal */}
      {modal === "edit-info" && (
        <ModalWrapper title="Thông tin cá nhân" onClose={() => setModal(null)}>
          <Field label="Tên nhà thuốc" value={name} onChange={setName} />
          <Field label="Email (tùy chọn)" type="email" value={email} onChange={setEmail} placeholder="Để trống nếu không thay đổi" />
          <ModalActions onCancel={() => setModal(null)} onSave={saveInfo} saving={saving} />
        </ModalWrapper>
      )}

      {/* Change password modal */}
      {modal === "change-password" && (
        <ModalWrapper title="Đổi mật khẩu" onClose={() => setModal(null)}>
          <Field label="Mật khẩu hiện tại" type="password" value={curPwd} onChange={setCurPwd} />
          <Field label="Mật khẩu mới" type="password" value={newPwd} onChange={setNewPwd} />
          <Field label="Xác nhận mật khẩu mới" type="password" value={confirmPwd} onChange={setConfirmPwd} />
          {msg?.type === "err" && <p className="text-xs text-error">{msg.text}</p>}
          <ModalActions onCancel={() => setModal(null)} onSave={savePwd} saving={saving} saveLabel="Đổi mật khẩu" />
        </ModalWrapper>
      )}

      {/* Add/Edit address modal */}
      {(modal === "add-address" || modal === "edit-address") && (
        <ModalWrapper title={modal === "add-address" ? "Thêm địa chỉ mới" : "Sửa địa chỉ"} onClose={() => setModal(null)}>
          <Field label="Nhãn (VD: Nhà thuốc, Kho)" value={addrForm.label ?? ""} onChange={(v) => setAddrForm((f) => ({ ...f, label: v }))} placeholder="Nhà thuốc" />
          <Field label="Số nhà, đường" placeholder="VD: 123 Đường ABC" value={addrForm.street} onChange={(v) => setAddrForm((f) => ({ ...f, street: v }))} />
          <Field label="Phường/Xã" placeholder="VD: Phường 1" value={addrForm.ward} onChange={(v) => setAddrForm((f) => ({ ...f, ward: v }))} />
          <Field label="Quận/Huyện" placeholder="VD: Quận 1" value={addrForm.district} onChange={(v) => setAddrForm((f) => ({ ...f, district: v }))} />
          <Field label="Tỉnh/Thành phố" placeholder="VD: TP. Hồ Chí Minh" value={addrForm.province} onChange={(v) => setAddrForm((f) => ({ ...f, province: v }))} />
          <Field label="SĐT liên hệ (tùy chọn)" type="tel" placeholder="VD: 0901 234 567" value={addrForm.phone ?? ""} onChange={(v) => setAddrForm((f) => ({ ...f, phone: v }))} />
          {msg?.type === "err" && <p className="text-xs text-error">{msg.text}</p>}
          <ModalActions onCancel={() => setModal(null)} onSave={saveAddress} saving={saving} saveLabel={modal === "add-address" ? "Thêm địa chỉ" : "Lưu"} />
        </ModalWrapper>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return <AuthGuard><ProfileContent /></AuthGuard>;
}

// ── Credit card widget ────────────────────────────────────────────────────────

function CreditCard({ credit }: { credit: CreditInfo }) {
  const usedPct = Math.min(100, Math.round((credit.outstanding / credit.creditLimit) * 100));
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const isNearLimit = usedPct >= 80;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-text-secondary">Hạn mức công nợ</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isNearLimit ? "bg-orange-100 text-price-orange" : "bg-green-100 text-green-700"}`}>
          {isNearLimit ? "Gần đầy" : "Còn hạn mức"}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-text-secondary">Đã sử dụng</p>
          <p className="text-lg font-bold text-price">{fmt(credit.outstanding)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary">Hạn mức tổng</p>
          <p className="text-sm font-semibold text-text-primary">{fmt(credit.creditLimit)}</p>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? "bg-price-orange" : "bg-primary"}`}
          style={{ width: `${usedPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">Còn lại: <span className="font-medium text-green-700">{fmt(credit.available)}</span></span>
        <span className="text-text-secondary">{usedPct}% đã dùng</span>
      </div>
      <p className="text-[10px] text-text-secondary">
        Hạn mức được tính dựa trên các đơn đang xử lý (chờ xác nhận, đã xác nhận, đang giao).
        Tự động hoàn lại khi đơn giao thành công.
      </p>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xs font-semibold uppercase text-text-secondary">{title}</h2>
      <div className="flex flex-col divide-y divide-zinc-100 rounded-xl border border-zinc-100">{children}</div>
    </div>
  );
}

function Row({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 text-sm text-text-primary">
      <span className="text-lg">{icon}</span>{label}
    </Link>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function ModalWrapper({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-bold">{title}</h2>
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, saving, saveLabel = "Lưu" }: {
  onCancel: () => void; onSave: () => void; saving: boolean; saveLabel?: string;
}) {
  return (
    <div className="flex gap-3 pt-1">
      <button onClick={onCancel} className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm text-text-secondary">Hủy</button>
      <button onClick={onSave} disabled={saving}
        className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white disabled:opacity-60">
        {saving ? "Đang lưu..." : saveLabel}
      </button>
    </div>
  );
}
