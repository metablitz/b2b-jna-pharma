import { create } from "zustand";
import {
  addCartItem,
  addFromFlashSale,
  addFromPromotion,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItemWithProduct,
} from "@/lib/api/cart";

interface CartState {
  items: CartItemWithProduct[];
  loading: boolean;
  loaded: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity: number, isFree?: boolean) => Promise<void>;
  addFlashSaleItem: (promotionId: string, quantity: number) => Promise<void>;
  addPromoItem: (promotionId: string, comboQty: number) => Promise<void>;
  updateQuantity: (productId: string, isFree: boolean, quantity: number) => Promise<void>;
  removeItem: (productId: string, isFree: boolean) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  refresh: async () => {
    set({ loading: true });
    try {
      const items = await fetchCart();
      set({ items, loading: false, loaded: true });
    } catch {
      set({ loading: false, loaded: true });
    }
  },
  addItem: async (productId, quantity, isFree = false) => {
    await addCartItem(productId, quantity, isFree);
    await get().refresh();
  },
  addFlashSaleItem: async (promotionId, quantity) => {
    await addFromFlashSale(promotionId, quantity);
    await get().refresh();
  },
  addPromoItem: async (promotionId, comboQty) => {
    await addFromPromotion(promotionId, comboQty);
    await get().refresh();
  },
  updateQuantity: async (productId, isFree, quantity) => {
    await updateCartItemQuantity(productId, quantity, isFree);
    await get().refresh();
  },
  removeItem: async (productId, isFree) => {
    await removeCartItem(productId, isFree);
    await get().refresh();
  },
  clear: async () => {
    await clearCart();
    set({ items: [] });
  },
  reset: () => set({ items: [], loaded: false }),
}));
