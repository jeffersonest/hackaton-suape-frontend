import { apiClient } from "@/lib/api-client";
import type {
  CreateUserData,
  PaginatedUsers,
  UpdateUserData,
  User,
} from "../types";

/**
 * Service da feature de usuários (rotas admin-only /users).
 *
 * Passa pelo cliente HTTP central, que envia os cookies httponly, trata o
 * refresh no 401 e lança `ApiError` com `status`/`detail` — usado pela camada
 * de UI para exibir mensagens de negócio (409) e mapear erros de validação (422).
 */

/** GET /users?limit&offset — lista paginada. */
export function listUsers(
  params: { limit?: number; offset?: number } = {}
): Promise<PaginatedUsers> {
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  return apiClient.get<PaginatedUsers>(`/users?limit=${limit}&offset=${offset}`);
}

/** POST /users — cria um usuário (201 → User criado). */
export function createUser(data: CreateUserData): Promise<User> {
  return apiClient.post<User>("/users", data);
}

/** PATCH /users/{id} — atualização parcial (200 → User atualizado). */
export function updateUser(id: string, data: UpdateUserData): Promise<User> {
  return apiClient.patch<User>(`/users/${id}`, data);
}

/** DELETE /users/{id} — exclui (204, sem corpo). */
export function deleteUser(id: string): Promise<void> {
  return apiClient.delete<void>(`/users/${id}`, { parseJson: false });
}
