"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchProduct, type RawPromotion } from "@/lib/api/products";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { toggleFavorite } from "@/lib/api/favorites";
import AuthGuard from "@/components/auth/AuthGuard";
import type { Product } from "@/types";

function formatPrice(v: number) {
  return `${v.toLocaleString("vi-VN")}đ`;
}

function formatDate(d: Date) {
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function ProductDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<(Product & { promotions: RawPromotion[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    fetchProduct(id)
      .then((p) => { setProduct(p); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  async function handleAdd() {
    if (!accessToken) { router.push("/login"); return; }
    setAdding(true);
    try {
      await addItem(id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  }

  async function handleFavorite() {
    if (!accessToken) { router.push("/login"); return; }
    const { favorited: newState } = await toggleFavorite(id);
    setFavorited(newState);
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-text-secondary">Đang tải...</p>;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm font-medium text-text-primary">Không tìm thấy sản phẩm</p>
        <Link href="/products" className="text-sm font-medium text-primary">← Quay lại danh sách</Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity === 0;
  const isDiscontinued = !product.isActive;

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-text-secondary">
        ← Quay lại
      </button>

      {/* Image placeholder + badges */}
      <div className="relative flex h-48 items-center justify-center rounded-2xl bg-zinc-100">
        <span className="text-6xl">💊</span>
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.priceChangePercent !== undefined && (
            <span className={`rounded px-2 py-0.5 text-xs font-bold text-white ${product.priceChangePercent > 0 ? "bg-flash-orange" : "bg-primary"}`}>
              {product.priceChangePercent > 0 ? "+" : ""}{product.priceChangePercent}%
            </span>
          )}
          {isDiscontinued && (
            <span className="rounded bg-zinc-400 px-2 py-0.5 text-xs font-bold text-white">Ngừng bán</span>
          )}
          {!isDiscontinued && isOutOfStock && (
            <span className="rounded bg-price-orange px-2 py-0.5 text-xs font-bold text-white">Hết hàng</span>
          )}
        </div>
        <button
          onClick={handleFavorite}
          className={`absolute right-3 top-3 text-2xl ${favorited ? "text-badge-red" : "text-zinc-300"}`}
        >
          {favorited ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Name + price */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-text-secondary">{product.category} · {product.manufacturer}</p>
        <h1 className="text-base font-bold text-text-primary leading-snug">{product.name}</h1>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold text-price">{formatPrice(product.currentPrice)}</span>
          <span className="text-sm text-text-secondary">/{product.unit}</span>
          {product.previousPrice && (
            <span className="text-sm text-price-old line-through">{formatPrice(product.previousPrice)}</span>
          )}
        </div>
        {product.isVAT && (
          <span className="self-start rounded-full bg-accent px-2 py-0.5 text-[10px] text-primary">Đã bao gồm VAT</span>
        )}
      </div>

      {/* Product info */}
      <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-100">
        <InfoRow label="Quy cách" value={product.packagingInfo} />
        {product.barcode && <InfoRow label="Mã vạch" value={product.barcode} />}
        <InfoRow label="Tồn kho" value={isOutOfStock ? "Hết hàng (có thể đặt trước)" : `${product.stockQuantity.toLocaleString()} ${product.unit}`} highlight={isOutOfStock} />
        {product.expiryDate && <InfoRow label="HSD" value={formatDate(product.expiryDate)} />}
        {product.isLimitedStock && <InfoRow label="Lưu ý" value="Hàng số lượng có hạn" highlight />}
      </div>

      {/* Tier pricing */}
      {product.tierPricing.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-primary">Giá theo số lượng</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-100">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-xs text-text-secondary">
                <tr>
                  <th className="p-2.5 text-left">Số lượng</th>
                  <th className="p-2.5 text-right">Đơn giá</th>
                  <th className="p-2.5 text-right">Tiết kiệm</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-100">
                  <td className="p-2.5 text-text-secondary">1 {product.unit} trở lên</td>
                  <td className="p-2.5 text-right font-medium text-text-primary">{formatPrice(product.currentPrice)}</td>
                  <td className="p-2.5 text-right text-text-secondary">—</td>
                </tr>
                {product.tierPricing.map((tier) => (
                  <tr key={tier.minQuantity} className="border-t border-zinc-100">
                    <td className="p-2.5 text-text-secondary">Từ {tier.minQuantity} {product.unit}</td>
                    <td className="p-2.5 text-right font-bold text-primary">{formatPrice(tier.price)}</td>
                    <td className="p-2.5 text-right text-xs text-primary">
                      -{formatPrice(product.currentPrice - tier.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active promotions */}
      {product.promotions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-primary">Khuyến mãi đang áp dụng</h2>
          {product.promotions.map((promo) => (
            <div key={promo.id} className="rounded-xl border border-primary/20 bg-accent p-3">
              <p className="text-sm font-medium text-primary">{promo.title}</p>
              {promo.giveProducts.length > 0 && (
                <p className="mt-1 text-xs text-text-secondary">
                  🎁 Tặng kèm: {promo.giveProducts.map((g) => `${g.quantity} ${g.product.unit} ${g.product.name}`).join(", ")}
                </p>
              )}
              {promo.totalSaving > 0 && (
                <p className="mt-0.5 text-xs text-primary">Tiết kiệm {formatPrice(promo.totalSaving)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add to cart — sticky bottom */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-zinc-100 bg-white p-3 shadow-lg max-w-lg mx-auto">
        {isDiscontinued ? (
          <a
            href="tel:0825777705"
            className="block w-full rounded-lg bg-zinc-200 py-3 text-center text-sm font-medium text-zinc-600"
          >
            📞 Liên hệ hỏi hàng
          </a>
        ) : (
          <div className="flex gap-3">
            <div className="flex items-center rounded-lg border border-zinc-200">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-text-secondary">-</button>
              <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 text-text-secondary">+</button>
            </div>
            <button
              disabled={adding}
              onClick={handleAdd}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                added ? "bg-green-500" : isOutOfStock ? "bg-price-orange" : "bg-primary"
              }`}
            >
              {added ? "✅ Đã thêm vào giỏ" : isOutOfStock ? "📋 Đặt trước" : "🛒 Thêm vào giỏ"}
            </button>
          </div>
        )}
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-16" />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <AuthGuard>
      <ProductDetailContent />
    </AuthGuard>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-price-orange" : "text-text-primary"}`}>{value}</span>
    </div>
  );
}
