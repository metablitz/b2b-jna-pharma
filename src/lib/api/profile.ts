import { apiFetch } from "@/lib/api-client";
import type { AuthPharmacy } from "@/stores/auth-store";

export function updateProfile(data: { name?: string; email?: string }) {
  return apiFetch<AuthPharmacy>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ success: boolean }>("/profile/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
