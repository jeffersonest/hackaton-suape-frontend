export type AuditAction =
  | 'license_registered'
  | 'requirement_updated'
  | 'fulfillment_updated'
  | 'sei_added'
  | 'file_attached'
  | 'file_removed'
  | 'notification_read';

export type AuditResourceType = 'license' | 'requirement' | 'notification';

export interface AuditEvent {
  identifier: string;
  license_id: string;
  action: AuditAction;
  resource_type: AuditResourceType;
  resource_id: string;
  summary: string;
  actor_id: string | null;
  actor_email: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  license_registered: 'Licença cadastrada',
  requirement_updated: 'Exigência atualizada',
  fulfillment_updated: 'Cumprimento atualizado',
  sei_added: 'Processo SEI vinculado',
  file_attached: 'Arquivo anexado',
  file_removed: 'Arquivo removido',
  notification_read: 'Notificação lida',
};

export const AUDIT_RESOURCE_LABELS: Record<AuditResourceType, string> = {
  license: 'Licença',
  requirement: 'Exigência',
  notification: 'Notificação',
};