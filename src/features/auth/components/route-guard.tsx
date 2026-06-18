"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "../stores/session-store";
import { AuthSplash } from "./auth-splash";

/**
 * Guarda de rotas protegidas.
 *
 * - "loading": ainda verificando a sessão -> mostra o splash.
 * - "unauthenticated": redireciona para /entrar (e segura o splash até navegar).
 * - "authenticated": renderiza o conteúdo.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useSessionStore((state) => state.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/entrar");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <AuthSplash />;
  }

  return <>{children}</>;
}
