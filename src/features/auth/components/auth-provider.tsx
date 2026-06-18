"use client";

import { useEffect } from "react";
import { setAuthFailureHandler } from "@/lib/api-client";
import { getCurrentUser } from "../api/auth-api";
import { useSessionStore } from "../stores/session-store";

/**
 * Bootstrap da sessão.
 *
 * No mount: chama GET /auth/me para hidratar o store (200 = logado via cookie,
 * 401 = deslogado). Também registra o handler de falha de auth do cliente HTTP:
 * quando um refresh falha num 401, a sessão é limpa e a guarda de rota
 * redireciona para o login.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useSessionStore((state) => state.setUser);
  const clearSession = useSessionStore((state) => state.clearSession);

  useEffect(() => {
    setAuthFailureHandler(() => clearSession());

    let active = true;
    getCurrentUser()
      .then((user) => {
        if (active) setUser(user);
      })
      .catch(() => {
        if (active) clearSession();
      });

    return () => {
      active = false;
      setAuthFailureHandler(null);
    };
  }, [setUser, clearSession]);

  return <>{children}</>;
}
