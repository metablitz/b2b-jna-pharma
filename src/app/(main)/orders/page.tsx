"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchOrders, cancelOrder, type ApiOrder } from "@/lib/api/orders";
import { addCartItem } from "@/lib/api/cart";
import { useCartStore } from "@/stores/cart-store";
import { ApiError } from "@/lib/api-client";
import { OrderStatus } from "@/types";
import AuthGuard from "@/components/auth/AuthGuard";

const STATUS_TABS: { id: OrderStatus; label: string }[] = [
  { id: "pending", label: "Chờ xác nhận" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "shipping", label: "Đang giao" },
  { id: "delivered", label: "Đã giao" },
  { id: "cancelled", label: "Đã hủy" },
];

const CANCELLABLE: OrderStatus[] = ["pending", "confirmed"];

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function formatDate(date: Date) {
  return date.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function OrdersContent() {
  const router = useRouter();
  const refreshCart = useCartStore((s) => s.refresh);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<ApiOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<ApiOrder | null>(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    fetchOrders(status).then(setOrders).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [status]);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(cancelTarget.id, cancelReason || undefined);
      setCancelTarget(null);
      setCancelReason("");
      await load();
    } catch (e) {
      setCancelError(e instanceof ApiError ? e.message : "Hủy đơn thất bại");
    } finally {
      setCancelling(false);
    }
  }

  async function handleEdit() {
    if (!editTarget) return;
    setEditing(true);
    setEditError(null);
    try {
      await cancelOrder(editTarget.id, "Nhà thuốc yêu cầu sửa đơn");
      // Add each non-free item back to cart (skip if product deactivated)
      await Promise.allSettled(
        editTarget.items
          .filter((item) => item.unitPrice > 0)
          .map((item) => addCartItem(item.productId, item.quantity))
      );
      await refreshCart();
      setEditTarget(null);
      router.push("/cart");
    } catch (e) {
      setEditError(e instanceof ApiError ? e.message : "Không thể sửa đơn hàng");
    } finally {
      setEditing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-text-primary">📋 Đơn hàng của tôi</h1>
        <Link href="/products" className="text-sm font-medium text-primary">
          🔄 Tái đơn mới
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 text-sm">
        {STATUS_TABS.map((tab) => (
          <button key={tab.id} onClick={() => setStatus(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 ${
              status === tab.id ? "bg-primary text-white" : "bg-zinc-100 text-text-secondary"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Đang tải đơn hàng...</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
          <span className="text-4xl">🧾</span>
          <p className="text-sm font-medium text-text-primary">Chưa có đơn hàng nào</p>
          <Link href="/products" className="text-sm font-medium text-primary">
            Đặt hàng ngay từ tab Trang chủ
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={() => { setCancelTarget(order); setCancelReason(""); setCancelError(null); }}
              onEdit={() => { setEditTarget(order); setEditError(null); }}
            />
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-text-primary">Hủy đơn hàng</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Đơn <span className="font-medium text-text-primary">{cancelTarget.orderNumber}</span>
              {" "}— {formatPrice(cancelTarget.total)}
            </p>

            <div className="mt-3 flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">
                Lý do hủy <span className="text-text-secondary">(tùy chọn)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="VD: Đặt nhầm sản phẩm, cần thay đổi địa chỉ..."
                rows={3}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-error"
              />
            </div>

            {cancelError && (
              <p className="mt-2 text-xs text-error">{cancelError}</p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-sm text-text-secondary"
              >
                Không hủy
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-lg bg-error py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit order confirmation modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-text-primary">Sửa đơn hàng</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Đơn <span className="font-medium text-text-primary">{editTarget.orderNumber}</span> sẽ bị hủy,
              và tất cả sản phẩm sẽ được chuyển vào giỏ hàng để bạn chỉnh sửa lại.
            </p>
            <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs text-text-secondary">
              ⚠️ Giá hiển thị trong giỏ hàng có thể đã thay đổi so với lúc đặt.
            </div>

            {editError && (
              <p className="mt-2 text-xs text-error">{editError}</p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setEditTarget(null)}
                className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-sm text-text-secondary"
              >
                Không sửa
              </button>
              <button
                onClick={handleEdit}
                disabled={editing}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {editing ? "Đang xử lý..." : "Sửa đơn hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}

function OrderCard({
  order,
  onCancel,
  onEdit,
}: {
  order: ApiOrder;
  onCancel: () => void;
  onEdit: () => void;
}) {
  const itemSummary =
    order.items.length === 1
      ? order.items[0].productName
      : `${order.items[0].productName} và ${order.items.length - 1} sản phẩm khác`;

  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-100 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{order.orderNumber}</span>
        <span className="text-xs text-text-secondary">{formatDate(order.createdAt)}</span>
      </div>
      <p className="text-sm text-text-secondary">{itemSummary}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-primary">{formatPrice(order.total)}</p>
        {canCancel && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-text-secondary"
            >
              Sửa đơn
            </button>
            <button
              onClick={onCancel}
              className="rounded-lg border border-error px-3 py-1 text-xs font-medium text-error"
            >
              Hủy đơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
