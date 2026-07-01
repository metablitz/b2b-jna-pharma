"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { toggleFavorite } from "@/lib/api/favorites";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function ProductCard({
  product,
  initialFavorited = false,
  onFavoriteChange,
}: {
  product: Product;
  initialFavorited?: boolean;
  onFavoriteChange?: (productId: string, favorited: boolean) => void;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriting, setFavoriting] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const accessToken = useAuthStore((state) => state.accessToken);

  const expiryLabel = product.expiryDate
    ? `${(product.expiryDate.getMonth() + 1).toString().padStart(2, "0")}/${product.expiryDate.getFullYear()}`
    : null;

  async function handleFavorite() {
    if (!accessToken) { router.push("/login"); return; }
    setFavoriting(true);
    try {
      const { favorited: newState } = await toggleFavorite(product.id);
      setFavorited(newState);
      onFavoriteChange?.(product.id, newState);
    } finally {
      setFavoriting(false);
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-zinc-100 p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 rounded-lg bg-zinc-100">
          {product.priceChangePercent !== undefined && (
            <span
              className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-white ${
                product.priceChangePercent > 0 ? "bg-flash-orange" : "bg-primary"
              }`}
            >
              {product.priceChangePercent > 0 ? "+" : ""}
              {product.priceChangePercent}%
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium text-text-primary">{product.name}</p>
          {expiryLabel && (
            <p className="flex items-center gap-1 text-xs text-text-secondary">
              📅 HSD {expiryLabel}
            </p>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-price">
              {formatPrice(product.currentPrice)}/{product.unit}
            </span>
            {product.previousPrice && (
              <span className="text-xs text-price-old line-through">
                {formatPrice(product.previousPrice)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleFavorite}
            disabled={favoriting}
            aria-label={favorited ? "Bỏ yêu thích" : "Yêu thích"}
            className={`text-lg transition-transform active:scale-110 disabled:opacity-50 ${
              favorited ? "text-badge-red" : "text-zinc-300"
            }`}
          >
            {favorited ? "❤️" : "🤍"}
          </button>
        </div>
      </div>

      {product.tierPricing.length > 0 && (
        <p className="text-xs text-text-secondary">
          {product.tierPricing
            .map((tier) => `Từ ${tier.minQuantity} ${product.unit}: ${formatPrice(tier.price)}`)
            .join(" · ")}
        </p>
      )}

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
            if (!accessToken) { router.push("/login"); return; }
            setAdding(true);
            try {
              await addItem(product.id, quantity);
              setQuantity(1);
            } finally {
              setAdding(false);
            }
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          🛒 Thêm
        </button>
      </div>
    </article>
  );
}
