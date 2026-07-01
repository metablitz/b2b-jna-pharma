import { apiFetch } from "@/lib/api-client";
import { mapProduct, type RawProduct } from "@/lib/api/products";
import type { Product } from "@/types";

export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  addedPrice: number;
  isFree: boolean;
  product: Product;
}

interface RawCartItem {
  id: string;
  productId: string;
  quantity: number;
  addedPrice: number;
  isFree: boolean;
  product: RawProduct;
}

function mapCartItem(raw: RawCartItem): CartItemWithProduct {
  return { ...raw, product: mapProduct(raw.product) };
}

export async function fetchCart(): Promise<CartItemWithProduct[]> {
  const raw = await apiFetch<RawCartItem[]>("/cart");
  return raw.map(mapCartItem);
}

export function addCartItem(productId: string, quantity: number, isFree = false) {
  return apiFetch<RawCartItem>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity, isFree }),
  }).then(mapCartItem);
}

export function updateCartItemQuantity(
  productId: string,
  quantity: number,
  isFree = false,
) {
  return apiFetch<RawCartItem | { removed: true }>(`/cart/items/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity, isFree }),
  });
}

export function removeCartItem(productId: string, isFree = false) {
  return apiFetch<{ removed: true }>(
    `/cart/items/${productId}?isFree=${isFree}`,
    { method: "DELETE" },
  );
}

export function clearCart() {
  return apiFetch<{ cleared: true }>("/cart", { method: "DELETE" });
}

export function addFromFlashSale(promotionId: string, quantity: number) {
  return apiFetch<RawCartItem>(`/cart/flash-sale/${promotionId}?quantity=${quantity}`, {
    method: "POST",
  }).then(mapCartItem);
}

export function addFromPromotion(promotionId: string, comboQty: number) {
  return apiFetch<{ added: number }>(
    `/cart/promotions/${promotionId}?comboQty=${comboQty}`,
    { method: "POST" },
  );
}
