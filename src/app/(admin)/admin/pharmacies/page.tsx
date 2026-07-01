"use client";

import { useEffect, useState } from "react";
import { fetchAdminPharmacies, updatePharmacyStatus, type AdminPharmacy } from "@/lib/api/admin";

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

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<AdminPharmacy[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-text-secondary">
              <tr>
                <th className="p-3 text-left">Mã</th>
                <th className="p-3 text-left">Tên nhà thuốc</th>
                <th className="p-3 text-left">SĐT</th>
                <th className="p-3 text-left">Địa chỉ</th>
                <th className="p-3 text-center">Đơn hàng</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {pharmacies.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-text-secondary">Không có nhà thuốc nào.</td></tr>
              ) : pharmacies.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100">
                  <td className="p-3 font-mono text-xs text-text-secondary">{p.code}</td>
                  <td className="p-3 font-medium text-text-primary">{p.name}</td>
                  <td className="p-3 text-text-secondary">{p.phone}</td>
                  <td className="p-3 text-xs text-text-secondary">{p.district}, {p.province}</td>
                  <td className="p-3 text-center">{p._count.orders}</td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[p.status] ?? ""}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 text-xs">
                      {p.status !== "active" && (
                        <button onClick={() => setPharmacyStatus(p.id, "active")} className="text-primary">Duyệt</button>
                      )}
                      {p.status !== "suspended" && (
                        <button onClick={() => setPharmacyStatus(p.id, "suspended")} className="text-error">Khóa</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
