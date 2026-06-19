/**
 * Tipos da feature de gerenciamento de usuários (rotas /users, admin-only).
 * O backend nunca retorna senha/hash; `created_at` é UTC (ISO 8601).
 */

/** Usuário no formato de resposta de todos os endpoints de /users. */
export interface User {
  identifier: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

/** Corpo do POST /users. */
export interface CreateUserData {
  email: string;
  password: string;
  is_admin?: boolean;
  is_active?: boolean;
}

/** Corpo do PATCH /users/{id} — envie apenas os campos que mudaram. */
export interface UpdateUserData {
  email?: string;
  password?: string;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

/** Resposta paginada do GET /users. */
export interface PaginatedUsers {
  data: User[];
  pagination: Pagination;
}
