"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  WarningCircle,
  FileText,
  Paperclip,
  TrashSimple,
  Bell,
  Plus,
  CircleNotch,
} from "@phosphor-icons/react";
import {
  fetchLicenseAudit,
  AuditEvent,
  AUDIT_ACTION_LABELS,
} from "@/features/audit";
import styles from "./audit-timeline.module.css";

function getActionIcon(action: AuditEvent['action']) {
  switch (action) {
    case 'license_registered':
      return Plus;
    case 'requirement_updated':
    case 'fulfillment_updated':
      return CheckCircle;
    case 'sei_added':
      return Paperclip;
    case 'file_attached':
      return Paperclip;
    case 'file_removed':
      return TrashSimple;
    case 'notification_read':
      return Bell;
    default:
      return FileText;
  }
}

function getActionColor(action: AuditEvent['action']) {
  switch (action) {
    case 'license_registered':
      return { bg: '#40c057', light: 'rgba(64, 192, 87, 0.15)' };
    case 'requirement_updated':
      return { bg: '#0e6fc4', light: 'rgba(14, 111, 196, 0.15)' };
    case 'fulfillment_updated':
      return { bg: '#f4ae38', light: 'rgba(244, 174, 56, 0.15)' };
    case 'sei_added':
      return { bg: '#f4ae38', light: 'rgba(244, 174, 56, 0.15)' };
    case 'file_attached':
      return { bg: '#0e6fc4', light: 'rgba(14, 111, 196, 0.15)' };
    case 'file_removed':
      return { bg: '#fa5252', light: 'rgba(250, 82, 82, 0.15)' };
    case 'notification_read':
      return { bg: '#868e96', light: 'rgba(134, 142, 150, 0.15)' };
    default:
      return { bg: '#868e96', light: 'rgba(134, 142, 150, 0.15)' };
  }
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'agora há pouco';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH}h`;
  if (diffD < 7) return `há ${diffD} ${diffD === 1 ? 'dia' : 'dias'}`;
  return formatDateTime(dateStr);
}

interface AuditTimelineProps {
  licenseId: string;
}

export function AuditTimeline({ licenseId }: AuditTimelineProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [licenseId]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLicenseAudit(licenseId);
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar auditoria:', err);
      setError('Não foi possível carregar o histórico de auditoria.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <CircleNotch size={28} className={styles.spinning} />
        <p>Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <WarningCircle size={32} weight="duotone" />
        <p>{error}</p>
        <button type="button" className="btn btn-secondary" onClick={loadEvents}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.empty}>
        <FileText size={48} weight="duotone" />
        <h3>Nenhum evento registrado</h3>
        <p>As ações realizadas nesta licença aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {events.map((event, index) => {
        const Icon = getActionIcon(event.action);
        const color = getActionColor(event.action);
        const label = AUDIT_ACTION_LABELS[event.action] || event.action;
        const actor = event.actor_email || 'Sistema';

        return (
          <div key={event.identifier} className={styles.event}>
            <div className={styles.iconWrapper}>
              <span
                className={styles.iconDot}
                style={{ background: color.bg }}
              >
                <Icon size={14} weight="fill" />
              </span>
              {index < events.length - 1 && (
                <span className={styles.line} />
              )}
            </div>

            <div className={styles.content}>
              <div className={styles.header}>
                <span
                  className={styles.actionBadge}
                  style={{ background: color.light, color: color.bg }}
                >
                  {label}
                </span>
                <span className={styles.time}>{formatRelative(event.created_at)}</span>
              </div>

              <p className={styles.summary}>{event.summary}</p>

              <div className={styles.meta}>
                <span>
                  Por <strong>{actor}</strong>
                </span>
                <span className={styles.metaDate}>
                  {formatDateTime(event.created_at)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}