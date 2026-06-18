import { apiClient } from "@/lib/api-client";
import type { AuthResponse, AuthUser, LoginCredentials } from "../types";

/**
 * Camada de service de autenticação.
 *
 * Todas as chamadas passam pelo cliente central (credentials:include), então o
 * browser troca os cookies httponly automaticamente. Os endpoints de auth usam
 * `skipAuthRefresh` para não disparar o interceptor de refresh do 401 — um 401
 * aqui significa "credenciais/sessão inválida", não "token expirado".
 */
const SKIP_REFRESH = { skipAuthRefresh: true } as const;

/** POST /auth/login — autentica e seta os cookies httponly. */
export function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", credentials, SKIP_REFRESH);
}

/** POST /auth/refresh — renova a sessão via cookie refresh_token. */
export function refresh(): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/refresh", undefined, SKIP_REFRESH);
}

/** POST /auth/logout — limpa os cookies no backend (204, sem corpo). */
export function logout(): Promise<void> {
  return apiClient.post<void>("/auth/logout", undefined, {
    ...SKIP_REFRESH,
    parseJson: false,
  });
}

/** GET /auth/me — hidrata a sessão. Passa pelo interceptor (refresh no 401). */
export function getCurrentUser(): Promise<AuthUser> {
  return apiClient.get<AuthUser>("/auth/me");
}
