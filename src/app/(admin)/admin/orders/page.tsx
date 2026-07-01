"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminOrders,
  advanceOrderStatus,
  cancelOrder,
  type AdminOrder,
} from "@/lib/api/admin";

const STATUS_TABS = [
  { id: "", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "shipping", label: "Đang giao" },
  { id: "delivered", label: "Đã giao" },
  { id: "cancelled", label: "Đã hủy" },
];

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const STATUS_NEXT: Record<string, string> = {
  pending: "Xác nhận",
  confirmed: "Giao hàng",
  shipping: "Đã giao",
};

function formatPrice(v: number) {
  return `${v.toLocaleString("vi-VN")}đ`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setOrders(await fetchAdminOrders(status || undefined, search || undefined));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  async function advance(id: string) {
    await advanceOrderStatus(id);
    await load();
  }

  async function cancel(id: string) {
    const reason = prompt("Lý do hủy đơn (tùy chọn):");
    if (reason === null) return;
    await cancelOrder(id, reason || undefined);
    await load();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-text-primary">📋 Quản lý đơn hàng</h1>

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
          placeholder="Tìm mã đơn hàng..."
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button onClick={load} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-text-secondary">Tìm</button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Đang tải...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.length === 0 ? (
            <p className="text-sm text-text-secondary">Không có đơn hàng nào.</p>
          ) : orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{order.orderNumber}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      order.status === "delivered" ? "bg-accent text-primary" :
                      order.status === "cancelled" ? "bg-zinc-100 text-error" :
                      "bg-yellow-50 text-yellow-700"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {order.pharmacy.name} · {order.pharmacy.code} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-bold text-text-primary">{formatPrice(order.total)}</span>
                <div className="flex gap-2">
                  {STATUS_NEXT[order.status] && (
                    <button onClick={() => advance(order.id)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white">
                      {STATUS_NEXT[order.status]}
                    </button>
                  )}
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <button onClick={() => cancel(order.id)}
                      className="rounded-lg border border-error px-3 py-1.5 text-xs font-medium text-error">
                      Hủy
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-xs text-text-secondary">
                    {expanded === order.id ? "▲" : "▼"}
                  </button>
                </div>
              </div>
              {expanded === order.id && (
                <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
                  <table className="w-full text-xs">
                    <thead className="text-text-secondary">
                      <tr>
                        <th className="pb-1 text-left">Sản phẩm</th>
                        <th className="pb-1 text-right">SL</th>
                        <th className="pb-1 text-right">Đơn giá</th>
                        <th className="pb-1 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} className="border-t border-zinc-50">
                          <td className="py-1">{item.productName}</td>
                          <td className="py-1 text-right">{item.quantity}</td>
                          <td className="py-1 text-right">{formatPrice(item.unitPrice)}</td>
                          <td className="py-1 text-right font-medium">{formatPrice(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {order.note && <p className="mt-2 text-xs text-text-secondary">Ghi chú: {order.note}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
