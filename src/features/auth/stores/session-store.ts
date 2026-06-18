import { create } from "zustand";
import type { AuthUser, AuthState } from "../types";
import { authCookies } from "@/lib/auth-cookies";

interface SessionStore extends AuthState {
  hydrate: () => void;
  login: (user: AuthUser, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionStore>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  hydrate: () => {
    const token = authCookies.getAccessToken();
    if (token) {
      set({
        accessToken: token,
        isAuthenticated: true,
      });
    }
  },

  login: (user, accessToken, refreshToken) => {
    authCookies.setAccessToken(accessToken);
    if (refreshToken) {
      authCookies.setRefreshToken(refreshToken);
    }
    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    authCookies.clearTokens();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
