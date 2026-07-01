import { apiFetch } from "@/lib/api-client";
import type { OrderStatus } from "@/types";

export interface ApiOrderItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  note: string | null;
  createdAt: Date;
  items: ApiOrderItem[];
}

interface RawOrder extends Omit<ApiOrder, "createdAt"> {
  createdAt: string;
}

function mapOrder(raw: RawOrder): ApiOrder {
  return { ...raw, createdAt: new Date(raw.createdAt) };
}

export async function createOrder(note?: string, addressId?: string): Promise<ApiOrder> {
  const raw = await apiFetch<RawOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ note, addressId }),
  });
  return mapOrder(raw);
}

export async function fetchOrders(status?: OrderStatus): Promise<ApiOrder[]> {
  const query = status ? `?status=${status}` : "";
  const raw = await apiFetch<RawOrder[]>(`/orders${query}`);
  return raw.map(mapOrder);
}

export async function cancelOrder(id: string, reason?: string): Promise<ApiOrder> {
  const raw = await apiFetch<RawOrder>(`/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return mapOrder(raw);
}
