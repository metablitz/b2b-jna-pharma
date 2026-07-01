import { adminFetch } from "@/lib/admin-api-client";
import type { AdminUser } from "@/stores/admin-auth-store";

// ── Auth ────────────────────────────────────────────────────────────────────

export function adminLogin(email: string, password: string) {
  return adminFetch<{ admin: AdminUser; accessToken: string }>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Products ────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  manufacturer: string;
  unit: string;
  packagingInfo: string;
  basePrice: number;
  currentPrice: number;
  previousPrice: number | null;
  priceChangePercent: number | null;
  isVAT: boolean;
  stockQuantity: number;
  isLimitedStock: boolean;
  isFeatured: boolean;
  isActive: boolean;
  expiryDate: string | null;
  tierPricing: { id: string; minQuantity: number; price: number }[];
  createdAt: string;
}

export interface ProductPayload {
  name: string;
  sku: string;
  category: string;
  manufacturer: string;
  unit: string;
  packagingInfo: string;
  basePrice: number;
  currentPrice: number;
  previousPrice?: number;
  priceChangePercent?: number;
  isVAT: boolean;
  stockQuantity: number;
  isLimitedStock: boolean;
  isFeatured: boolean;
  isActive: boolean;
  expiryDate?: string | null;
  tierPricing: { minQuantity: number; price: number }[];
}

export const fetchAdminProducts = (search?: string) =>
  adminFetch<AdminProduct[]>(`/admin/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const createAdminProduct = (data: ProductPayload) =>
  adminFetch<AdminProduct>("/admin/products", { method: "POST", body: JSON.stringify(data) });

export const updateAdminProduct = (id: string, data: ProductPayload) =>
  adminFetch<AdminProduct>(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteAdminProduct = (id: string) =>
  adminFetch<{ deleted: boolean }>(`/admin/products/${id}`, { method: "DELETE" });

// ── Orders ──────────────────────────────────────────────────────────────────

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  note: string | null;
  createdAt: string;
  pharmacy: { name: string; code: string; phone: string };
  items: { productName: string; quantity: number; unitPrice: number; totalPrice: number }[];
}

export const fetchAdminOrders = (status?: string, search?: string) => {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (search) q.set("search", search);
  return adminFetch<AdminOrder[]>(`/admin/orders${q.toString() ? `?${q}` : ""}`);
};

export const advanceOrderStatus = (id: string) =>
  adminFetch<AdminOrder>(`/admin/orders/${id}/advance`, { method: "PUT" });

export const cancelOrder = (id: string, reason?: string) =>
  adminFetch<AdminOrder>(`/admin/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

// ── Promotions ──────────────────────────────────────────────────────────────

export interface AdminPromotion {
  id: string;
  type: string;
  manufacturerName: string;
  title: string;
  totalSaving: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  buyProducts: { productId: string; quantity: number; price: number; product: { name: string; unit: string } }[];
  giveProducts: { productId: string; quantity: number; price: number; product: { name: string; unit: string } }[];
}

export const fetchAdminPromotions = () =>
  adminFetch<AdminPromotion[]>("/admin/promotions");

export const togglePromotion = (id: string) =>
  adminFetch<AdminPromotion>(`/admin/promotions/${id}/toggle`, { method: "PUT" });

export const deletePromotion = (id: string) =>
  adminFetch<{ deleted: boolean }>(`/admin/promotions/${id}`, { method: "DELETE" });

export interface PromotionPayload {
  type: string;
  manufacturerName: string;
  title: string;
  totalSaving: number;
  minOrderQuantity?: number;
  startDate: string;
  endDate: string;
  buyProducts: { productId: string; quantity: number; price: number; isFree: boolean }[];
  giveProducts: { productId: string; quantity: number; price: number; isFree: boolean }[];
}

export const createPromotion = (data: PromotionPayload) =>
  adminFetch<AdminPromotion>("/admin/promotions", { method: "POST", body: JSON.stringify(data) });

// ── Pharmacies ──────────────────────────────────────────────────────────────

export interface AdminPharmacy {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string | null;
  businessLicense: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  memberTier: string;
  status: string;
  createdAt: string;
  _count: { orders: number };
}

export const fetchAdminPharmacies = (status?: string, search?: string) => {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (search) q.set("search", search);
  return adminFetch<AdminPharmacy[]>(`/admin/pharmacies${q.toString() ? `?${q}` : ""}`);
};

export const updatePharmacyStatus = (id: string, status: string) =>
  adminFetch<{ id: string; name: string; status: string }>(
    `/admin/pharmacies/${id}/status`,
    { method: "PUT", body: JSON.stringify({ status }) }
  );

// ── Admin Chat ──────────────────────────────────────────────────────────────

export interface AdminChatRoom {
  id: string;
  type: string;
  lastMessageAt: string;
  pharmacy: { name: string; code: string };
  messages: { content: string; senderType: string; sentAt: string }[];
}

export interface ChatMessageItem {
  id: string;
  senderType: string;
  content: string;
  sentAt: string;
}

export const fetchAdminChatRooms = () =>
  adminFetch<AdminChatRoom[]>("/admin/chat/rooms");

export const fetchAdminChatMessages = (roomId: string) =>
  adminFetch<ChatMessageItem[]>(`/admin/chat/rooms/${roomId}/messages`);

export const adminSendChatMessage = (roomId: string, content: string) =>
  adminFetch<ChatMessageItem>(`/admin/chat/rooms/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
