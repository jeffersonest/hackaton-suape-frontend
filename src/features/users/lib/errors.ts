import { ApiError } from "@/lib/api-client";

/** Erros de validação por campo do formulário (ex.: { email, password }). */
export type FieldErrors = Partial<Record<"email" | "password" | "is_admin" | "is_active", string>>;

export interface ParsedApiError {
  /** Erros mapeados por campo (preenchido em respostas 422). */
  fieldErrors: FieldErrors;
  /** Mensagem geral para banner/toast (negócio: 409, 403, rede, etc.). */
  message: string | null;
}

interface ValidationItem {
  loc?: unknown[];
  msg?: string;
}

const KNOWN_FIELDS = new Set(["email", "password", "is_admin", "is_active"]);

/**
 * Traduz um erro do cliente HTTP no que a UI precisa exibir.
 *
 * - 422: `detail` é uma lista `{ loc, msg }`; mapeamos o último segmento de
 *   `loc` (o nome do campo) para a mensagem. Campos desconhecidos viram a
 *   mensagem geral.
 * - Demais erros de negócio (409, 403, ...): `detail` é string e vai direto
 *   para `message`.
 */
export function parseApiError(error: unknown): ParsedApiError {
  if (error instanceof ApiError) {
    if (error.status === 422 && Array.isArray(error.detail)) {
      const fieldErrors: FieldErrors = {};
      let fallback: string | null = null;
      for (const item of error.detail as ValidationItem[]) {
        const field = Array.isArray(item.loc) ? String(item.loc[item.loc.length - 1]) : "";
        const msg = item.msg ?? "Valor inválido";
        if (KNOWN_FIELDS.has(field)) {
          if (!fieldErrors[field as keyof FieldErrors]) {
            fieldErrors[field as keyof FieldErrors] = msg;
          }
        } else if (!fallback) {
          fallback = msg;
        }
      }
      const hasFieldErrors = Object.keys(fieldErrors).length > 0;
      return { fieldErrors, message: hasFieldErrors ? null : fallback ?? "Dados inválidos." };
    }

    return {
      fieldErrors: {},
      message: typeof error.detail === "string" && error.detail ? error.detail : error.message,
    };
  }

  return { fieldErrors: {}, message: "Algo deu errado. Tente novamente." };
}
