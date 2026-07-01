"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import FlashSaleCard from "./FlashSaleCard";
import PromotionCard from "./PromotionCard";
import { fetchProductCategories, fetchProducts } from "@/lib/api/products";
import { fetchFlashSales, fetchPromotions, type ApiPromotion } from "@/lib/api/promotions";
import {
  getFavoriteIds,
  fetchFavorites,
  fetchFeatured,
  fetchRecentlyOrdered,
} from "@/lib/api/favorites";
import { useAuthStore } from "@/stores/auth-store";
import type { Product } from "@/types";

type MainTab = "products" | "flash-sale" | "promotions";
type FilterMode = "all" | "favorites" | "featured" | "recent";

const FILTER_OPTIONS: { id: FilterMode; label: string; icon: string }[] = [
  { id: "all", label: "Tất cả sản phẩm", icon: "📦" },
  { id: "favorites", label: "Sản phẩm quan tâm", icon: "❤️" },
  { id: "featured", label: "Sản phẩm nổi bật", icon: "⭐" },
  { id: "recent", label: "Đã mua gần đây", icon: "🕐" },
];

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "products", label: "📦 Sản phẩm" },
  { id: "flash-sale", label: "⚡ Flash sale" },
  { id: "promotions", label: "🏷️ Khuyến mãi" },
];

export default function ProductTabs({ initialSearch }: { initialSearch?: string }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [tab, setTab] = useState<MainTab>("products");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [flashSales, setFlashSales] = useState<ApiPromotion[]>([]);
  const [promotions, setPromotions] = useState<ApiPromotion[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load base data on mount
  useEffect(() => {
    Promise.all([
      fetchProducts(initialSearch),
      fetchProductCategories(),
      fetchFlashSales(),
      fetchPromotions(),
    ])
      .then(([p, c, fs, pr]) => {
        setAllProducts(p);
        setDisplayProducts(p);
        setCategories(c);
        setFlashSales(fs);
        setPromotions(pr);
      })
      .catch(() => setError("Không tải được dữ liệu sản phẩm"))
      .finally(() => setLoading(false));
  }, [initialSearch]);

  // Load favorite IDs when authenticated
  useEffect(() => {
    if (!hasHydrated || !accessToken) return;
    getFavoriteIds()
      .then((ids) => setFavoriteIds(new Set(ids)))
      .catch(() => {});
  }, [hasHydrated, accessToken]);

  // Apply filter when mode or category changes
  const applyFilter = useCallback(
    async (mode: FilterMode, category: string) => {
      if (mode === "all") {
        const base = category ? allProducts.filter((p) => p.category === category) : allProducts;
        setDisplayProducts(base);
        return;
      }

      setFilterLoading(true);
      try {
        let filtered: Product[] = [];
        if (mode === "favorites") filtered = await fetchFavorites();
        else if (mode === "featured") filtered = await fetchFeatured();
        else if (mode === "recent") filtered = await fetchRecentlyOrdered();

        if (category) filtered = filtered.filter((p) => p.category === category);
        setDisplayProducts(filtered);
      } catch {
        setDisplayProducts([]);
      } finally {
        setFilterLoading(false);
      }
    },
    [allProducts],
  );

  useEffect(() => {
    applyFilter(filterMode, selectedCategory);
  }, [filterMode, selectedCategory, applyFilter]);

  function handleFavoriteChange(productId: string, isFav: boolean) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFav ? next.add(productId) : next.delete(productId);
      return next;
    });
    // If viewing favorites, remove unfavorited item immediately
    if (filterMode === "favorites" && !isFav) {
      setDisplayProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  }

  const activeFilterLabel = FILTER_OPTIONS.find((f) => f.id === filterMode)?.label ?? "Tất cả";

  return (
    <div className="flex flex-col gap-3">
      {/* Main tabs */}
      <div className="flex gap-2 text-sm font-medium">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 ${
              tab === t.id ? "bg-primary text-white" : "bg-zinc-100 text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {loading && <p className="text-sm text-text-secondary">Đang tải...</p>}

      {/* Products tab */}
      {!loading && tab === "products" && (
        <>
          {/* Filter row */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory("")}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                  selectedCategory === ""
                    ? "border-primary bg-primary text-white"
                    : "border-zinc-200 text-text-secondary"
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                    selectedCategory === cat
                      ? "border-primary bg-primary text-white"
                      : "border-zinc-200 text-text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilterSheet(true)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                filterMode !== "all"
                  ? "border-primary bg-accent text-primary"
                  : "border-zinc-200 text-text-secondary"
              }`}
            >
              🔽 {filterMode !== "all" ? activeFilterLabel.split(" ")[0] + "..." : "Lọc"}
            </button>
          </div>

          {filterLoading ? (
            <p className="text-sm text-text-secondary">Đang lọc...</p>
          ) : displayProducts.length === 0 ? (
            <EmptyState
              icon={filterMode === "favorites" ? "❤️" : filterMode === "recent" ? "🕐" : "📦"}
              title={
                filterMode === "favorites"
                  ? "Chưa có sản phẩm yêu thích"
                  : filterMode === "recent"
                  ? "Chưa có đơn hàng nào"
                  : "Không tìm thấy sản phẩm"
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  initialFavorited={favoriteIds.has(product.id)}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Flash sale tab */}
      {!loading && tab === "flash-sale" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-flash-orange p-4 text-center">
            <p className="text-lg font-bold text-white">⚡ FLASH SALE KHỦNG</p>
          </div>
          {flashSales.length === 0 ? (
            <EmptyState icon="📦" title="Chưa có sản phẩm flash sale" subtitle="Đang cập nhật..." />
          ) : (
            flashSales.map((fs) => <FlashSaleCard key={fs.id} flashSale={fs} />)
          )}
        </div>
      )}

      {/* Promotions tab */}
      {!loading && tab === "promotions" && (
        <div className="flex flex-col gap-3">
          {promotions.length === 0 ? (
            <EmptyState icon="🏷️" title="Chưa có chương trình khuyến mãi" />
          ) : (
            promotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))
          )}
        </div>
      )}

      {/* Filter bottom sheet */}
      {showFilterSheet && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setShowFilterSheet(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-2xl bg-white pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <p className="text-sm font-bold text-text-primary">Bộ lọc sản phẩm</p>
              <button onClick={() => setShowFilterSheet(false)} className="text-text-secondary">✕</button>
            </div>
            <div className="flex flex-col py-2">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (!accessToken && opt.id !== "all" && opt.id !== "featured") {
                      setShowFilterSheet(false);
                      return;
                    }
                    setFilterMode(opt.id);
                    setShowFilterSheet(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm ${
                    filterMode === opt.id ? "bg-accent text-primary" : "text-text-primary"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span>{opt.label}</span>
                  {filterMode === opt.id && <span className="ml-auto text-primary">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
    </div>
  );
}
