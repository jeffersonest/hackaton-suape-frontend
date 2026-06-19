"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChartBar,
  FileText,
  ListChecks,
  WarningCircle,
  Warning,
} from "@phosphor-icons/react";
import { getOverview } from "../api/client";
import type { AnalyticsOverview } from "../types";
import { KpiCard } from "./kpi-card";
import { StatusDonut } from "./status-donut";
import styles from "./analytics-dashboard.module.css";

// Cor fixa por categoria (key), alinhada aos tokens do design system.
const LICENSE_COLORS: Record<string, string> = {
  active: "#40c057",
  expired: "#fa5252",
  suspended: "#fd7e14",
};

const REQUIREMENT_COLORS: Record<string, string> = {
  pendente: "#f4ae38",
  atende: "#40c057",
  atende_parcialmente: "#339af0",
  nao_atende: "#fa5252",
};

/** Dashboard de indicadores de licenças e exigências (GET /analytics/overview). */
export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getOverview());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os indicadores."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.titleIcon}>
          <ChartBar size={28} weight="duotone" />
        </span>
        <div>
          <h1 className={styles.title}>Relatórios</h1>
          <p className={styles.subtitle}>
            Indicadores de licenças e exigências do Porto de Suape.
          </p>
        </div>
      </header>

      {error ? (
        <div className={styles.stateBox}>
          <Warning size={48} weight="duotone" />
          <h3 className={styles.stateError}>Erro ao carregar indicadores</h3>
          <p>{error}</p>
          <button type="button" onClick={load} className="btn btn-primary">
            Tentar novamente
          </button>
        </div>
      ) : loading ? (
        <div className={styles.stateBox}>
          <div className={styles.spinner} />
          <p>Carregando indicadores...</p>
        </div>
      ) : data ? (
        <>
          <div className={styles.kpis}>
            <KpiCard label="Licenças" value={data.totals.licenses} icon={FileText} tone="primary" />
            <KpiCard
              label="Exigências"
              value={data.totals.requirements}
              icon={ListChecks}
              tone="accent"
            />
            <KpiCard
              label="Licenças vencidas"
              value={data.totals.expired_licenses}
              icon={WarningCircle}
              tone="danger"
            />
          </div>

          <div className={styles.charts}>
            <StatusDonut
              title="Licenças por status"
              data={data.licenses_by_status}
              colors={LICENSE_COLORS}
            />
            <StatusDonut
              title="Exigências por status"
              data={data.requirements_by_status}
              colors={REQUIREMENT_COLORS}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
