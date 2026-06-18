import { create } from "zustand";
import type { AuthStatus, AuthUser } from "../types";

/**
 * Estado de autenticação.
 *
 * No modelo de cookies httponly o JS NÃO guarda/lê token — quem mantém a sessão
 * é o browser via cookies. Aqui guardamos apenas o usuário atual e o `status`
 * do bootstrap (`/auth/me`). `isAuthenticated` é derivado do status.
 */
interface SessionStore {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  /** Define o usuário logado (após login bem-sucedido ou /auth/me). */
  setUser: (user: AuthUser) => void;
  /** Marca a sessão como deslogada e limpa o usuário. */
  clearSession: () => void;
  /** Atualiza apenas o status (ex.: voltar para "loading" num re-bootstrap). */
  setStatus: (status: AuthStatus) => void;
}

export const useSessionStore = create<SessionStore>()((set) => ({
  user: null,
  status: "loading",
  isAuthenticated: false,

  setUser: (user) => set({ user, status: "authenticated", isAuthenticated: true }),

  clearSession: () => set({ user: null, status: "unauthenticated", isAuthenticated: false }),

  setStatus: (status) => set({ status }),
}));
