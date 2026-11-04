export type ApiError = { status: number };

export const GROUPS = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O-" },
];

export function groupLabel(v: string) {
  return GROUPS.find((g) => g.value === v)?.label ?? v;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem("bb_token");
  } catch {
    return null;
  }
}

export function saveAuth(token: string, name: string) {
  localStorage.setItem("bb_token", token);
  localStorage.setItem("bb_name", name);
  window.dispatchEvent(new Event("bb-auth"));
}

export function clearAuth() {
  localStorage.removeItem("bb_token");
  localStorage.removeItem("bb_name");
  window.dispatchEvent(new Event("bb-auth"));
}

async function send(path: string, init: RequestInit, useToken: boolean) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = useToken ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(path, { ...init, headers });
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await send(path, init, true);
  // If the saved token has expired, clear it and retry without a token
  if (res.status === 401 && getToken()) {
    clearAuth();
    res = await send(path, init, false);
  }
  if (!res.ok) throw { status: res.status } as ApiError;
  return res.json() as Promise<T>;
}