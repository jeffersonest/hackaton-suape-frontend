/**
 * Cliente HTTP central da aplicação.
 *
 * - Sempre envia `credentials: "include"` para o browser mandar/receber os
 *   cookies httponly (access_token / refresh_token) emitidos pelo backend.
 * - Em respostas 401 numa rota protegida, dispara um único POST /auth/refresh
 *   compartilhado (single-flight) e refaz a requisição original uma vez.
 * - Se o refresh também falhar, aciona `authFailureHandler` (limpa a sessão);
 *   a guarda de rota cuida do redirecionamento para o login.
 *
 * Os endpoints de auth (login/refresh/logout) devem usar
 * `skipAuthRefresh: true` para não recursar no interceptor nem gerar loop.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Erro com resposta HTTP do backend. `status` 0 representa falha de rede/CORS. */
export class ApiError extends Error {
  readonly status: number;
  /** Corpo `detail` do backend: string (negócio) ou array (validação 422). */
  readonly detail: unknown;

  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" && detail ? detail : `Erro de requisição (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/** Falha de rede / CORS / servidor inacessível (sem resposta HTTP). */
export function isNetworkError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 0;
}

type AuthFailureHandler = () => void;
let authFailureHandler: AuthFailureHandler | null = null;

/**
 * Registra o que fazer quando a sessão expira de vez (o refresh falhou após um
 * 401). Mantém o cliente desacoplado do store/router — o AuthProvider liga isso
 * à limpeza do estado de auth.
 */
export function setAuthFailureHandler(handler: AuthFailureHandler | null): void {
  authFailureHandler = handler;
}

export interface RequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: Record<string, string>;
  /** Pula o interceptor de refresh no 401 (use nos próprios endpoints de auth). */
  skipAuthRefresh?: boolean;
  /** Faz parse do corpo como JSON (default: true). 204/sem corpo retornam undefined. */
  parseJson?: boolean;
}

// --- single-flight refresh -------------------------------------------------
let refreshInFlight: Promise<void> | null = null;

async function performRefresh(): Promise<void> {
  // fetch cru (não passa pelo `request`) para jamais recursar no interceptor.
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor");
  }
  if (!response.ok) {
    throw await toApiError(response);
  }
}

function refreshSession(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function toApiError(response: Response): Promise<ApiError> {
  let detail: unknown;
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "detail" in data) {
      detail = (data as { detail: unknown }).detail;
    }
  } catch {
    detail = undefined;
  }
  return new ApiError(response.status, detail);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuthRefresh = false, parseJson = true, body, headers, ...rest } = options;

  const hasBody = body !== undefined && body !== null;
  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  };

  const send = async (): Promise<Response> => {
    try {
      return await fetch(`${API_URL}${path}`, init);
    } catch {
      throw new ApiError(0, "Não foi possível conectar ao servidor");
    }
  };

  let response = await send();

  if (response.status === 401 && !skipAuthRefresh) {
    let refreshed = false;
    try {
      await refreshSession();
      refreshed = true;
    } catch {
      authFailureHandler?.();
    }
    if (refreshed) {
      response = await send();
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (!parseJson || response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
