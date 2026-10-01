import type { Role } from "@/types";

const TOKEN_KEYS: Record<Role, string> = {
  superadmin: "superadmin_token",
  admin: "admin_token",
  teamlead: "teamlead_token",
  customer: "customer_token",
};

export const setToken = (role: Role, token: string) =>
  localStorage.setItem(TOKEN_KEYS[role], token);

export const getToken = (role: Role) => localStorage.getItem(TOKEN_KEYS[role]);

export const clearToken = (role: Role) =>
  localStorage.removeItem(TOKEN_KEYS[role]);

export const clearAllTokens = () =>
  Object.values(TOKEN_KEYS).forEach((k) => localStorage.removeItem(k));

export const isLoggedIn = (role: Role) => !!getToken(role);