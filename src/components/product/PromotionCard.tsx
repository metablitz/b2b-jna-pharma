"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { type ApiPromotion } from "@/lib/api/promotions";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function PromotionCard({ promotion }: { promotion: ApiPromotion }) {
  const router = useRouter();
  const [comboQty, setComboQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const addPromoItem = useCartStore((state) => state.addPromoItem);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timeout);
  }, [added]);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-promo-purple/30 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-promo-purple px-2 py-1 text-xs font-medium text-white">
          MUA TẶNG {promotion.manufacturerName.toUpperCase()}
        </span>
        <span className="text-xs font-medium text-promo-purple">
          Tiết kiệm {formatPrice(promotion.totalSaving * comboQty)}
        </span>
      </div>

      <p className="text-sm font-medium text-text-primary">{promotion.title}</p>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase text-text-secondary">Cần mua</p>
        {promotion.buyProducts.map((bp) => (
          <div key={bp.productId} className="flex items-center justify-between text-sm">
            <span className="text-text-primary">
              {bp.product.name} × {bp.quantity * comboQty}
            </span>
            <span className="text-text-secondary">
              {formatPrice(bp.price)}/{bp.product.unit}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase text-text-secondary">
          Được tặng miễn phí
        </p>
        {promotion.giveProducts.map((gp) => (
          <div key={gp.productId} className="flex items-center justify-between text-sm">
            <span className="text-text-primary">
              {gp.product.name} × {gp.quantity * comboQty}
            </span>
            <span className="font-medium text-primary">MIỄN PHÍ</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200">
          <button
            onClick={() => setComboQty((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-text-secondary"
          >
            -
          </button>
          <span className="text-sm">{comboQty}</span>
          <button
            onClick={() => setComboQty((q) => q + 1)}
            className="px-3 py-1.5 text-text-secondary"
          >
            +
          </button>
        </div>
        <button
          disabled={adding}
          onClick={async () => {
            if (!accessToken) {
              router.push("/login");
              return;
            }
            setAdding(true);
            try {
              await addPromoItem(promotion.id, comboQty);
              setAdded(true);
              setComboQty(1);
            } finally {
              setAdding(false);
            }
          }}
          className="rounded-lg bg-promo-purple px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {adding ? "..." : "⚡ Đặt ngay"}
        </button>
      </div>

      {added && (
        <p className="text-xs font-medium text-primary">Đã thêm combo vào giỏ hàng</p>
      )}
    </article>
  );
}
