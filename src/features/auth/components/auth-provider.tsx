"use client";

import { useEffect } from "react";
import { setAuthFailureHandler } from "@/lib/api-client";
import { useChatStore } from "@/features/chat/stores/chat-store";
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
    // Ao encerrar a sessão (logout, refresh falho ou bootstrap sem auth),
    // limpamos o chat persistido para não vazar histórico entre usuários do
    // mesmo navegador.
    const endSession = () => {
      clearSession();
      useChatStore.getState().clear();
    };
    setAuthFailureHandler(endSession);

    let active = true;
    getCurrentUser()
      .then((user) => {
        if (active) setUser(user);
      })
      .catch(() => {
        if (active) endSession();
      });

    return () => {
      active = false;
      setAuthFailureHandler(null);
    };
  }, [setUser, clearSession]);

  return <>{children}</>;
}
