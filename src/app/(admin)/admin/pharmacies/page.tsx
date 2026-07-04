"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminPharmacies,
  updatePharmacyStatus,
  resetPharmacyPassword,
  setPharmacyCreditLimit,
  downloadPharmacyDocument,
  type AdminPharmacy,
} from "@/lib/api/admin";

const STATUS_TABS = [
  { id: "", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "active", label: "Đang hoạt động" },
  { id: "suspended", label: "Đã tạm khóa" },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  active: "bg-accent text-primary",
  suspended: "bg-zinc-100 text-error",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ duyệt",
  active: "Đang hoạt động",
  suspended: "Tạm khóa",
};

const SUBMIT_LABEL: Record<string, string> = {
  uploaded: "✅ Đã tải lên",
  via_zalo: "📱 Gửi Zalo",
};

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<AdminPharmacy[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [tempPassword, setTempPassword] = useState<{ name: string; password: string } | null>(null);
  const [creditModal, setCreditModal] = useState<AdminPharmacy | null>(null);
  const [creditInput, setCreditInput] = useState("");
  const [savingCredit, setSavingCredit] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setPharmacies(await fetchAdminPharmacies(status || undefined, search || undefined));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  async function setPharmacyStatus(id: string, newStatus: string) {
    await updatePharmacyStatus(id, newStatus);
    await load();
  }

  async function handleResetPassword(pharmacy: AdminPharmacy) {
    if (!confirm(`Reset mật khẩu cho nhà thuốc "${pharmacy.name}"?`)) return;
    const res = await resetPharmacyPassword(pharmacy.id);
    setTempPassword({ name: pharmacy.name, password: res.tempPassword });
  }

  function openCreditModal(p: AdminPharmacy) {
    setCreditModal(p);
    setCreditInput(String(p.creditLimit));
  }

  async function handleSaveCredit() {
    if (!creditModal) return;
    const val = parseInt(creditInput.replace(/\D/g, ""), 10);
    if (isNaN(val) || val < 0) return;
    setSavingCredit(true);
    try {
      await setPharmacyCreditLimit(creditModal.id, val);
      await load();
      setCreditModal(null);
    } finally {
      setSavingCredit(false);
    }
  }

  async function downloadDoc(p: AdminPharmacy, docType: "business" | "pharmacy") {
    await downloadPharmacyDocument(p.id, docType);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-text-primary">🏥 Quản lý nhà thuốc</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 text-sm">
        {STATUS_TABS.map((tab) => (
          <button key={tab.id} onClick={() => setStatus(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 ${status === tab.id ? "bg-primary text-white" : "bg-zinc-100 text-text-secondary"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Tìm theo tên, mã DT, SĐT..."
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button onClick={load} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-text-secondary">Tìm</button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Đang tải...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pharmacies.length === 0 ? (
            <p className="text-center text-sm text-text-secondary py-4">Không có nhà thuốc nào.</p>
          ) : pharmacies.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-text-secondary">{p.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${STATUS_BADGE[p.status] ?? ""}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                  <p className="font-medium text-text-primary">{p.name}</p>
                  {p.ownerName && <p className="text-xs text-text-secondary">Chủ: {p.ownerName}</p>}
                  <p className="text-xs text-text-secondary">{p.phone} · {p.street}</p>
                </div>
                <span className="text-xs text-text-secondary">{p._count.orders} đơn</span>
              </div>

              {/* Credit limit */}
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                <div>
                  <span className="text-xs text-text-secondary">Hạn mức công nợ</span>
                  <p className="font-semibold text-text-primary">{fmt(p.creditLimit)}</p>
                </div>
                <button
                  onClick={() => openCreditModal(p)}
                  className="text-xs text-primary font-medium"
                >
                  Thay đổi
                </button>
              </div>

              {/* License documents */}
              {p.licenseSubmitMethod && (
                <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Giấy tờ:</span>
                    <span className="font-medium">{SUBMIT_LABEL[p.licenseSubmitMethod] ?? p.licenseSubmitMethod}</span>
                  </div>
                  {p.licenseSubmitMethod === "uploaded" && (
                    <div className="flex gap-3">
                      {p.businessLicenseName ? (
                        <button
                          onClick={() => downloadDoc(p, "business")}
                          className="text-primary underline"
                        >
                          GPDKKD
                        </button>
                      ) : (
                        <span className="text-zinc-400">GPDKKD (chưa có)</span>
                      )}
                      {p.pharmacyLicenseName ? (
                        <button
                          onClick={() => downloadDoc(p, "pharmacy")}
                          className="text-primary underline"
                        >
                          GP nhà thuốc
                        </button>
                      ) : (
                        <span className="text-zinc-400">GP nhà thuốc (chưa có)</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 text-xs border-t border-zinc-100 pt-2">
                {p.status !== "active" && (
                  <button onClick={() => setPharmacyStatus(p.id, "active")} className="rounded bg-accent px-2 py-1 text-primary font-medium">Duyệt</button>
                )}
                {p.status !== "suspended" && (
                  <button onClick={() => setPharmacyStatus(p.id, "suspended")} className="rounded bg-red-50 px-2 py-1 text-error">Khóa</button>
                )}
                {p.status !== "pending" && (
                  <button onClick={() => setPharmacyStatus(p.id, "pending")} className="rounded bg-zinc-100 px-2 py-1 text-text-secondary">Chờ duyệt</button>
                )}
                <button onClick={() => handleResetPassword(p)} className="ml-auto rounded bg-zinc-100 px-2 py-1 text-text-secondary">Reset MK</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset password modal */}
      {tempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">🔑</span>
              <h2 className="text-base font-bold text-text-primary">Mật khẩu tạm thời</h2>
              <p className="text-sm text-text-secondary">
                Nhà thuốc <strong>{tempPassword.name}</strong> đã được reset mật khẩu.
                Thông báo cho chủ nhà thuốc mật khẩu dưới đây:
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
              <span className="font-mono text-lg font-bold text-text-primary tracking-wider">
                {tempPassword.password}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(tempPassword.password)}
                className="text-xs text-primary"
              >
                Sao chép
              </button>
            </div>
            <p className="text-center text-xs text-text-secondary">
              Yêu cầu nhà thuốc đổi mật khẩu sau khi đăng nhập.
            </p>
            <button
              onClick={() => setTempPassword(null)}
              className="rounded-lg bg-primary py-2.5 text-sm font-medium text-white"
            >
              Đã thông báo xong
            </button>
          </div>
        </div>
      )}

      {/* Credit limit modal */}
      {creditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-text-primary">Chỉnh hạn mức công nợ</h2>
            <p className="text-sm text-text-secondary">
              Nhà thuốc: <strong>{creditModal.name}</strong>
              <br />Hạn mức hiện tại: <strong>{fmt(creditModal.creditLimit)}</strong>
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">Hạn mức mới (đồng)</label>
              <input
                type="number"
                min={0}
                step={500000}
                value={creditInput}
                onChange={(e) => setCreditInput(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <p className="text-xs text-text-secondary">
                = {parseInt(creditInput || "0", 10).toLocaleString("vi-VN")}đ
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1000000, 3000000, 5000000, 10000000, 20000000, 50000000].map((v) => (
                <button
                  key={v}
                  onClick={() => setCreditInput(String(v))}
                  className={`rounded-lg border px-2 py-1.5 text-xs ${creditInput === String(v) ? "border-primary bg-accent text-primary" : "border-zinc-200 text-text-secondary"}`}
                >
                  {(v / 1000000).toFixed(0)}tr
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCreditModal(null)}
                className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm text-text-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCredit}
                disabled={savingCredit}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {savingCredit ? "Đang lưu..." : "Lưu hạn mức"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
