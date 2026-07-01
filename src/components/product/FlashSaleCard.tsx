"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { type ApiPromotion } from "@/lib/api/promotions";
import FlashSaleCountdown from "./FlashSaleCountdown";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function FlashSaleCard({ flashSale }: { flashSale: ApiPromotion }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const addFlashSaleItem = useCartStore((state) => state.addFlashSaleItem);
  const accessToken = useAuthStore((state) => state.accessToken);

  const flashProduct = flashSale.buyProducts[0];
  if (!flashProduct) return null;

  const regularPrice = flashProduct.product.currentPrice;
  const flashPrice = flashProduct.price;
  const discountPercent = Math.round(((regularPrice - flashPrice) / regularPrice) * 100);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-flash-orange/30 p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 rounded-lg bg-zinc-100">
          <span className="absolute bottom-1 left-1 rounded bg-badge-red px-1.5 py-0.5 text-[10px] font-medium text-white">
            -{discountPercent}%
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium text-text-primary">{flashProduct.product.name}</p>
          <FlashSaleCountdown endsAt={new Date(flashSale.endDate)} />
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-flash-orange">
              {formatPrice(flashPrice)}/{flashProduct.product.unit}
            </span>
            <span className="text-xs text-price-old line-through">
              {formatPrice(regularPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-text-secondary"
          >
            -
          </button>
          <span className="text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
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
              await addFlashSaleItem(flashSale.id, quantity);
              setQuantity(1);
            } finally {
              setAdding(false);
            }
          }}
          className="rounded-lg bg-flash-orange px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {adding ? "..." : "⚡ Thêm"}
        </button>
      </div>
    </article>
  );
}
