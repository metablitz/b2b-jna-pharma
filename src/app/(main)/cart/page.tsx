"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useNotificationStore } from "@/stores/notification-store";
import { COMPANY } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { createOrder } from "@/lib/api/orders";
import { fetchAddresses, type ApiAddress } from "@/lib/api/addresses";
import { fetchCredit, type CreditInfo } from "@/lib/api/profile";
import { ApiError } from "@/lib/api-client";
import AuthGuard from "@/components/auth/AuthGuard";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function CartContent() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const items = useCartStore((state) => state.items);
  const loaded = useCartStore((state) => state.loaded);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [credit, setCredit] = useState<CreditInfo | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchAddresses().then((list) => {
      setAddresses(list);
      const def = list.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    }).catch(() => {});
    fetchCredit().then(setCredit).catch(() => {});
  }, [accessToken]);
  const removeItem = useCartStore((state) => state.removeItem);
  const refresh = useCartStore((state) => state.refresh);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = items.map((item) => {
    const isDiscontinued = !item.product.isActive && !item.isFree;
    const isOutOfStock = item.product.isActive && item.product.stockQuantity === 0 && !item.isFree;
    const hasPriceChanged = !item.isFree && !isDiscontinued && item.addedPrice !== item.product.currentPrice;
    const lineTotal = item.isFree || isDiscontinued ? 0 : item.addedPrice * item.quantity;
    return { item, hasPriceChanged, lineTotal, isDiscontinued, isOutOfStock };
  });

  const changedCount = rows.filter((row) => row.hasPriceChanged).length;
  const blockedCount = rows.filter((r) => r.isDiscontinued).length; // only discontinued blocks checkout
  const preOrderCount = rows.filter((r) => r.isOutOfStock).length;
  const totalQuantity = rows.reduce((sum, row) => sum + row.item.quantity, 0);
  const totalAmount = rows.reduce((sum, row) => sum + row.lineTotal, 0);

  if (!loaded) {
    return <p className="text-sm text-text-secondary">Đang tải giỏ hàng...</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
        <span className="text-4xl">🛒</span>
        <p className="text-sm font-medium text-text-primary">Giỏ hàng trống</p>
        <Link href="/products" className="text-sm font-medium text-primary">
          Thêm sản phẩm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-text-primary">Giỏ hàng</h1>
          {changedCount > 0 && (
            <span className="rounded-full bg-price-orange/10 px-2 py-0.5 text-xs font-medium text-price-orange">
              Giá đổi ({changedCount})
            </span>
          )}
          {blockedCount > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-error">
              Ngừng bán ({blockedCount})
            </span>
          )}
          {preOrderCount > 0 && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-price-orange">
              Đặt trước ({preOrderCount})
            </span>
          )}
        </div>
        <Link href="/products" className="text-sm font-medium text-primary">
          ➕ Thêm sản phẩm
        </Link>
      </div>

      {blockedCount > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm">
          <p className="font-medium text-error">Có {blockedCount} sản phẩm đã ngừng bán — không thể đặt hàng</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Vui lòng xóa sản phẩm <strong>Ngừng bán</strong> hoặc liên hệ{" "}
            <a href={`tel:${COMPANY.hotlineTel}`} className="font-medium text-primary">{COMPANY.hotline}</a>.
          </p>
        </div>
      )}
      {preOrderCount > 0 && (
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm">
          <p className="font-medium text-price-orange">Có {preOrderCount} sản phẩm đang hết hàng — sẽ xử lý dưới dạng đặt trước</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Đội ngũ JNA Pharma sẽ liên hệ xác nhận thời gian giao khi hàng về.
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-100">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs text-text-secondary">
            <tr>
              <th className="p-2 text-left">STT</th>
              <th className="p-2 text-left">Thông tin sản phẩm</th>
              <th className="p-2 text-right">Đơn giá</th>
              <th className="p-2 text-center">SL</th>
              <th className="p-2 text-right">Thành tiền</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, hasPriceChanged, lineTotal, isDiscontinued, isOutOfStock }, index) => (
              <tr
                key={`${item.productId}-${item.isFree}`}
                className={`border-t border-zinc-100 align-top ${isDiscontinued || isOutOfStock ? "opacity-60" : ""}`}
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <div className="flex flex-col gap-1">
                    <span className={isDiscontinued || isOutOfStock ? "text-text-secondary" : ""}>
                      {item.product.name}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.isFree && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-primary">
                          QUÀ TẶNG
                        </span>
                      )}
                      {isDiscontinued && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                          Ngừng bán
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-error">
                          Hết hàng
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-2 text-right">
                  {isDiscontinued ? (
                    <a href={`tel:${COMPANY.hotlineTel}`} className="text-xs font-medium text-primary whitespace-nowrap">
                      Liên hệ
                    </a>
                  ) : item.isFree ? (
                    <span className="font-medium text-primary">Miễn phí</span>
                  ) : hasPriceChanged ? (
                    <div className="flex flex-col items-end">
                      <span className="text-price-orange">
                        {formatPrice(item.product.currentPrice)}
                      </span>
                      <span className="text-xs text-price-old line-through">
                        {formatPrice(item.addedPrice)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-price">{formatPrice(item.addedPrice)}</span>
                  )}
                </td>
                <td className="p-2">
                  {isDiscontinued || isOutOfStock ? (
                    <span className="block text-center text-xs text-text-secondary">—</span>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.isFree, item.quantity - 1)
                        }
                        className="px-2 py-1 text-text-secondary"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.isFree, item.quantity + 1)
                        }
                        className="px-2 py-1 text-text-secondary"
                      >
                        +
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-2 text-right font-medium">
                  {isDiscontinued ? (
                    <span className="text-xs text-text-secondary">—</span>
                  ) : item.isFree ? (
                    "0đ"
                  ) : (
                    formatPrice(lineTotal)
                  )}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => removeItem(item.productId, item.isFree)}
                    aria-label="Xóa sản phẩm"
                    className="text-error"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <span className="text-text-secondary">
          Tổng {rows.length} loại · {totalQuantity} sp
        </span>
        <span className="text-lg font-bold text-text-primary">
          Tổng cộng {formatPrice(totalAmount)}
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-100 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-text-primary">Địa chỉ giao hàng</span>
          <Link href="/profile" className="text-xs text-primary">Quản lý</Link>
        </div>
        {addresses.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Giao đến địa chỉ đăng ký của nhà thuốc.{" "}
            <Link href="/profile" className="text-primary">Thêm địa chỉ khác</Link>
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {addresses.map((addr) => (
              <label key={addr.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm ${
                selectedAddressId === addr.id ? "border-primary bg-accent" : "border-zinc-200"}`}>
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-text-primary">
                    {addr.label}
                    {addr.isDefault && (
                      <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">Mặc định</span>
                    )}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                  </span>
                  {addr.phone && <span className="text-xs text-text-secondary">{addr.phone}</span>}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="🖊 Ghi chú đơn..."
        className="w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-primary"
        rows={2}
      />

      {/* Credit summary */}
      {credit && (() => {
        const wouldExceed = credit.available < totalAmount;
        return (
          <div className={`flex flex-col gap-1 rounded-xl border p-3 text-sm ${
            wouldExceed ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary">Hạn mức công nợ</span>
              <span className={`text-xs font-medium ${wouldExceed ? "text-error" : "text-green-700"}`}>
                {wouldExceed ? "Vượt hạn mức" : "Đủ hạn mức"}
              </span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Còn lại: <strong className="text-text-primary">{credit.available.toLocaleString("vi-VN")}đ</strong></span>
              <span>Đơn này: <strong className={wouldExceed ? "text-error" : "text-text-primary"}>{totalAmount.toLocaleString("vi-VN")}đ</strong></span>
            </div>
            {wouldExceed && (
              <p className="text-xs text-error">
                Đơn hàng vượt hạn mức. Vui lòng liên hệ{" "}
                <a href={`tel:${COMPANY.hotlineTel}`} className="font-medium underline">{COMPANY.hotline}</a>{" "}
                để tăng hạn mức hoặc giảm số lượng sản phẩm.
              </p>
            )}
          </div>
        );
      })()}

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        disabled={placing || blockedCount > 0}
        onClick={async () => {
          setError(null);
          setPlacing(true);
          try {
            const order = await createOrder(note || undefined, selectedAddressId || undefined);
            addNotification({
              type: "order_placed",
              title: "Đặt hàng thành công",
              body: `Đơn hàng ${order.orderNumber} đã được tiếp nhận và đang chờ xác nhận.`,
              orderId: order.id,
            });
            await refresh();
            router.push("/orders");
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Đặt hàng thất bại");
          } finally {
            setPlacing(false);
          }
        }}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {placing
          ? "Đang xử lý..."
          : blockedCount > 0
          ? `Xóa ${blockedCount} sản phẩm ngừng bán trước`
          : preOrderCount > 0
          ? `✅ Xác nhận đơn (${preOrderCount} đặt trước)`
          : "✅ Xác nhận đơn hàng"}
      </button>
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGuard>
      <CartContent />
    </AuthGuard>
  );
}
