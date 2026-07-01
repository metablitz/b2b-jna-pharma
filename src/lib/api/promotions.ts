import { apiFetch } from "@/lib/api-client";
import type { Product } from "@/types";
import { mapProduct, type RawProduct } from "@/lib/api/products";

export interface ApiPromotionProduct {
  productId: string;
  quantity: number;
  price: number;
  isFree: boolean;
  product: Product;
}

interface RawPromotionProduct extends Omit<ApiPromotionProduct, "product"> {
  product: RawProduct;
}

export interface ApiPromotion {
  id: string;
  type: string;
  manufacturerName: string;
  title: string;
  totalSaving: number;
  minOrderQuantity: number;
  endDate: string;
  buyProducts: ApiPromotionProduct[];
  giveProducts: ApiPromotionProduct[];
}

interface RawPromotion extends Omit<ApiPromotion, "buyProducts" | "giveProducts"> {
  buyProducts: RawPromotionProduct[];
  giveProducts: RawPromotionProduct[];
}

function mapPromotion(raw: RawPromotion): ApiPromotion {
  return {
    ...raw,
    buyProducts: raw.buyProducts.map((p) => ({ ...p, product: mapProduct(p.product) })),
    giveProducts: raw.giveProducts.map((p) => ({ ...p, product: mapProduct(p.product) })),
  };
}

export async function fetchPromotions(): Promise<ApiPromotion[]> {
  const raw = await apiFetch<RawPromotion[]>("/promotions");
  return raw.map(mapPromotion);
}

export async function fetchFlashSales(): Promise<ApiPromotion[]> {
  const raw = await apiFetch<RawPromotion[]>("/promotions/flash-sale");
  return raw.map(mapPromotion);
}
