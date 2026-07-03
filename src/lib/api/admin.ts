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

// ── Import ───────────────────────────────────────────────────────────────────

export interface ParsedProductPreview {
  barcode: string;
  name: string;
  rawCategory: string;
  unit: string;
  manufacturer: string;
  currentPrice: number;
  rowIndex: number;
}

export interface MissingProduct {
  id: string;
  name: string;
  barcode: string;
}

export interface ImportPreviewResult {
  totalRows: number;
  toCreate: ParsedProductPreview[];
  toUpdate: ParsedProductPreview[];
  errors: { rowIndex: number; reason: string; name?: string }[];
  newRawCategories: string[];
  missingProducts: MissingProduct[];
  existingCategoryMappings: Record<string, string>;
}

export interface ImportResult {
  created: number;
  updated: number;
  deactivated: number;
  kept: number;
  skipped: number;
  errors: { rowIndex: number; reason: string }[];
}

export interface CategoryMapping {
  id: string;
  rawName: string;
  displayName: string;
}

export interface ImportLog {
  id: string;
  type: string;
  fileName: string;
  createdAt: string;
  totalRows: number;
  created: number;
  updated: number;
  deactivated: number;
  skipped: number;
  kept: number;
  errors: unknown;
}

export async function previewImport(file: File): Promise<ImportPreviewResult> {
  const token = (await import("@/stores/admin-auth-store"))
    .useAdminAuthStore.getState().accessToken;
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/admin/import/products/preview`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function executeImport(
  file: File,
  choices: {
    categoryMappings: { rawName: string; displayName: string }[];
    missingActions: { productId: string; action: "deactivate" | "keep"; reason?: string }[];
  }
): Promise<ImportResult> {
  const token = (await import("@/stores/admin-auth-store"))
    .useAdminAuthStore.getState().accessToken;
  const form = new FormData();
  form.append("file", file);
  form.append("choices", JSON.stringify(choices));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/admin/import/products/execute`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const fetchCategoryMappings = () =>
  adminFetch<CategoryMapping[]>("/admin/import/category-mappings");

export const saveCategoryMappings = (mappings: { rawName: string; displayName: string }[]) =>
  adminFetch<CategoryMapping[]>("/admin/import/category-mappings", {
    method: "PUT",
    body: JSON.stringify({ mappings }),
  });

export const fetchImportLogs = () =>
  adminFetch<ImportLog[]>("/admin/import/logs");
