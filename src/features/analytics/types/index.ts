/**
 * Tipos da feature de indicadores (endpoint /analytics/overview).
 * O formato é "chart-friendly": cada série é um array de { key, label, count }.
 */

export interface StatusCount {
  /** Valor estável (enum) — usado como id e para fixar a cor por categoria. */
  key: string;
  /** Rótulo em PT — usado na legenda/eixo. */
  label: string;
  /** Valor numérico. */
  count: number;
}

export interface AnalyticsTotals {
  licenses: number;
  requirements: number;
  /** Licenças com data vencida (expires_at < hoje). Use para o card "vencidas". */
  expired_licenses: number;
}

export interface AnalyticsOverview {
  totals: AnalyticsTotals;
  licenses_by_status: StatusCount[];
  requirements_by_status: StatusCount[];
}
