import { apiFetch } from "@/lib/api-client";
import type { Product } from "@/types";

export interface RawProduct extends Omit<Product, "expiryDate" | "createdAt" | "updatedAt"> {
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapProduct(raw: RawProduct): Product {
  return {
    ...raw,
    barcode: raw.barcode ?? undefined,
    previousPrice: raw.previousPrice ?? undefined,
    priceChangePercent: raw.priceChangePercent ?? undefined,
    expiryDate: raw.expiryDate ? new Date(raw.expiryDate) : undefined,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

export async function fetchProducts(search?: string): Promise<Product[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  const raw = await apiFetch<RawProduct[]>(`/products${q}`);
  return raw.map(mapProduct);
}

export async function fetchProductCategories(): Promise<string[]> {
  return apiFetch<string[]>("/products/categories");
}
