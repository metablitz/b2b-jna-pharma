import { apiFetch } from "@/lib/api-client";
import type { AuthPharmacy } from "@/stores/auth-store";

export interface AuthResponse {
  pharmacy: AuthPharmacy;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  name: string;
  businessLicense: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export function register(payload: RegisterPayload) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
