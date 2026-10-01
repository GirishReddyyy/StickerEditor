import { create } from "zustand";

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  role?: "user" | "admin";
};

type AuthState = {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: UserProfile | null, token: string | null) => void;
  logout: () => void;
};

const SAVED_USER = localStorage.getItem("sticker_user");
const SAVED_TOKEN = localStorage.getItem("sticker_token");

export const useAuthStore = create<AuthState>((set) => ({
  user: SAVED_USER ? JSON.parse(SAVED_USER) : null,
  token: SAVED_TOKEN || null,
  isLoading: false,

  setAuth: (user, token) => {
    if (user && token) {
      localStorage.setItem("sticker_user", JSON.stringify(user));
      localStorage.setItem("sticker_token", token);
    } else {
      localStorage.removeItem("sticker_user");
      localStorage.removeItem("sticker_token");
    }
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("sticker_user");
    localStorage.removeItem("sticker_token");
    set({ user: null, token: null });
  },
}));
