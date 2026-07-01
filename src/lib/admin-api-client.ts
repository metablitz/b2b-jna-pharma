import { useAdminAuthStore } from "@/stores/admin-auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = useAdminAuthStore.getState().accessToken;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (res.status === 401) {
    useAdminAuthStore.getState().clear();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new ApiError(401, "Phiên đăng nhập đã hết hạn");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new ApiError(res.status, message ?? "Có lỗi xảy ra");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
