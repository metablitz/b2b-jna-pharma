import { apiFetch } from "@/lib/api-client";
import { mapProduct, type RawProduct } from "@/lib/api/products";
import type { Product } from "@/types";

export function toggleFavorite(productId: string) {
  return apiFetch<{ favorited: boolean }>(`/products/${productId}/favorite`, {
    method: "POST",
  });
}

export function getFavoriteIds() {
  return apiFetch<string[]>("/products/favorite-ids");
}

export async function fetchFavorites(): Promise<Product[]> {
  const raw = await apiFetch<RawProduct[]>("/products/favorites");
  return raw.map(mapProduct);
}

export async function fetchFeatured(): Promise<Product[]> {
  const raw = await apiFetch<RawProduct[]>("/products/featured");
  return raw.map(mapProduct);
}

export async function fetchRecentlyOrdered(): Promise<Product[]> {
  const raw = await apiFetch<RawProduct[]>("/products/recent");
  return raw.map(mapProduct);
}
