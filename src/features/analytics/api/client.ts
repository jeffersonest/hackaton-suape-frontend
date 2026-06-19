import { apiClient } from "@/lib/api-client";
import type { AnalyticsOverview } from "../types";

/**
 * GET /analytics/overview — agregados de licenças e exigências para o dashboard.
 *
 * Autenticado (qualquer usuário), sem parâmetros. Passa pelo cliente central,
 * que envia os cookies httponly e trata o refresh automático no 401.
 */
export function getOverview(): Promise<AnalyticsOverview> {
  return apiClient.get<AnalyticsOverview>("/analytics/overview");
}
