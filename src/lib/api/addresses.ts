import { apiFetch } from "@/lib/api-client";

export interface ApiAddress {
  id: string;
  label: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressPayload {
  label?: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  phone?: string;
}

export const fetchAddresses = () =>
  apiFetch<ApiAddress[]>("/profile/addresses");

export const createAddress = (data: AddressPayload) =>
  apiFetch<ApiAddress>("/profile/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAddress = (id: string, data: AddressPayload) =>
  apiFetch<ApiAddress>(`/profile/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteAddress = (id: string) =>
  apiFetch<{ deleted: boolean }>(`/profile/addresses/${id}`, { method: "DELETE" });

export const setDefaultAddress = (id: string) =>
  apiFetch<ApiAddress[]>(`/profile/addresses/${id}/default`, { method: "PUT" });
