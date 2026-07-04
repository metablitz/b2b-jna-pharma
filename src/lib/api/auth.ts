import { apiFetch } from "@/lib/api-client";
import type { AuthPharmacy } from "@/stores/auth-store";

export interface AuthResponse {
  pharmacy: AuthPharmacy;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  name: string;
  ownerName?: string;
  street: string;
  province?: string;
  phone: string;
  password: string;
  licenseSubmitMethod?: "uploaded" | "via_zalo";
  businessLicenseFile?: File;
  pharmacyLicenseFile?: File;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export function register(payload: RegisterPayload) {
  const fd = new FormData();
  fd.append("name", payload.name);
  if (payload.ownerName) fd.append("ownerName", payload.ownerName);
  fd.append("street", payload.street);
  if (payload.province) fd.append("province", payload.province);
  fd.append("phone", payload.phone);
  fd.append("password", payload.password);
  if (payload.licenseSubmitMethod) fd.append("licenseSubmitMethod", payload.licenseSubmitMethod);
  if (payload.businessLicenseFile) fd.append("businessLicenseFile", payload.businessLicenseFile);
  if (payload.pharmacyLicenseFile) fd.append("pharmacyLicenseFile", payload.pharmacyLicenseFile);

  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: fd,
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
