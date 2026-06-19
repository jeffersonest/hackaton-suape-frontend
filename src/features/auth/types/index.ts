/** Usuário autenticado, no formato retornado pelo backend (/auth/me e login). */
export interface AuthUser {
  identifier: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Resposta de /auth/login e /auth/refresh. */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
}
