"use client";

import styles from "./status-badge.module.css";

// Status do backend
type LicenseStatus = 'active' | 'expired' | 'suspended';
// Status local para exigências
type RequirementStatus = 'pendente' | 'em_andamento' | 'cumprida' | 'nao_cumprida' | 'vencida';

type Status = LicenseStatus | RequirementStatus;

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  variant?: 'light' | 'dark';
}

const licenseStatusConfig: Record<LicenseStatus, { label: string; lightClass: string; darkClass: string }> = {
  active: { label: "Ativa", lightClass: styles.approvedLight, darkClass: styles.approvedDark },
  expired: { label: "Vencida", lightClass: styles.expiredLight, darkClass: styles.expiredDark },
  suspended: { label: "Suspensa", lightClass: styles.rejectedLight, darkClass: styles.rejectedDark },
};

const requirementStatusConfig: Record<RequirementStatus, { label: string; lightClass: string; darkClass: string }> = {
  pendente: { label: "Pendente", lightClass: styles.pendingLight, darkClass: styles.pendingDark },
  em_andamento: { label: "Em Andamento", lightClass: styles.analysisLight, darkClass: styles.analysisDark },
  cumprida: { label: "Cumprida", lightClass: styles.approvedLight, darkClass: styles.approvedDark },
  nao_cumprida: { label: "Não Cumprida", lightClass: styles.rejectedLight, darkClass: styles.rejectedDark },
  vencida: { label: "Vencida", lightClass: styles.expiredLight, darkClass: styles.expiredDark },
};

function isLicenseStatus(status: string): status is LicenseStatus {
  return status === 'active' || status === 'expired' || status === 'suspended';
}

export function StatusBadge({ status, size = 'md', showIcon = true, variant = 'dark' }: StatusBadgeProps) {
  const config = isLicenseStatus(status)
    ? licenseStatusConfig[status]
    : requirementStatusConfig[status as RequirementStatus];

  const className = variant === 'light' ? config.lightClass : config.darkClass;

  return (
    <span
      className={`${styles.badge} ${className} ${size === 'sm' ? styles.sm : ''}`}
    >
      {showIcon && <span className={styles.icon} />}
      <span>{config.label}</span>
    </span>
  );
}
