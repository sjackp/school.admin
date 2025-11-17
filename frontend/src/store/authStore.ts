import { create } from "zustand";

type Role = "admin" | "editor" | "viewer";

export interface AuthUser {
  id: number;
  username: string;
  full_name?: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

const STORAGE_KEY = "school_admin_auth";

function loadInitialState(): Pick<AuthState, "token" | "user"> {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    return JSON.parse(raw);
  } catch {
    return { token: null, user: null };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitialState(),
  setAuth: (token, user) => {
    const data = { token, user };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    set(data);
  },
  clearAuth: () => {
    window.localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
  },
}));


