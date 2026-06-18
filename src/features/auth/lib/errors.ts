import { ApiError, isNetworkError } from "@/lib/api-client";

/** Mensagem amigável (pt-BR) para erros do fluxo de login. */
export function loginErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return "E-mail ou senha incorretos.";
    if (error.status === 422) return "Verifique o e-mail e a senha informados.";
  }
  return "Não foi possível entrar. Tente novamente em instantes.";
}
