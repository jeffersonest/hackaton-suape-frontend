"use client";

import type { Icon } from "@phosphor-icons/react";
import styles from "./kpi-card.module.css";

export type KpiTone = "primary" | "accent" | "danger";

interface KpiCardProps {
  label: string;
  value: number;
  icon: Icon;
  tone?: KpiTone;
}

/** Card de indicador numérico (KPI) para o topo do dashboard. */
export function KpiCard({ label, value, icon: Icon, tone = "primary" }: KpiCardProps) {
  return (
    <div className={`${styles.card} ${styles[tone]}`}>
      <span className={styles.iconWrap}>
        <Icon size={26} weight="duotone" />
      </span>
      <div className={styles.info}>
        <span className={styles.value}>{value.toLocaleString("pt-BR")}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
