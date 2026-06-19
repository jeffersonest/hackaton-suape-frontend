export type LicenseStatus = 'active' | 'expired' | 'suspended';
export type LicenseType =
  | 'Licença Prévia'
  | 'Licença de Instalação'
  | 'Licença de Operação'
  | 'Licença de Operação Corretiva'
  | 'Licença Única'
  | 'Autorização Ambiental'
  | 'Renovação da Licença de Operação'
  | string;

export type RequirementCategory =
  | 'exigencia'
  | 'requisito_normativo'
  | 'proibicao'
  | 'condicao';

export type RequirementDeadlineType =
  | 'single_from_issue'
  | 'recurring'
  | 'event_triggered'
  | 'before_expiry'
  | 'none';

export type FulfillmentStatus =
  | 'pendente'
  | 'atende'
  | 'atende_parcialmente'
  | 'nao_atende';

export interface RequirementFulfillment {
  identifier: string;
  requirement_id: string;
  status: FulfillmentStatus;
  occurrence_due_date: string | null;
  responsible_id: string | null;
  responsible_email: string | null;
  internal_deadline: string | null;
  regulator_deadline: string | null;
  compliance_weight: number;
  sei_process_number: string | null;
  evidence_note: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicenseRequirement {
  identifier: string;
  license_id: string;
  description: string;
  item_number: string;
  raw_text?: string;
  category: RequirementCategory;
  deadline_type: RequirementDeadlineType;
  deadline_base: 'issued_at' | 'expires_at' | 'event' | 'none';
  field_origin?: number;
  expires_at?: string;
  recurrence_interval_months?: number;
  event_trigger?: string;
  fulfillments: RequirementFulfillment[];
}

export interface UpsertFulfillmentData {
  status: FulfillmentStatus;
  occurrence_due_date?: string | null;
  responsible_id?: string | null;
  internal_deadline?: string | null;
  regulator_deadline?: string | null;
  compliance_weight?: number;
  sei_process_number?: string | null;
  evidence_note?: string | null;
}

export interface LicenseFile {
  identifier: string;
  resource_type: 'license' | 'requirement';
  resource_id: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
  url: string;
}

export interface License {
  identifier: string;
  number: string;
  holder_name: string;
  license_type: LicenseType;
  status: LicenseStatus;
  issued_at: string;
  expires_at: string;
  enterprise_number?: string;
  cnpj: string;
  state_registration?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  main_activity?: string;
  legal_framework?: string;
  observations?: string;
  purpose?: string;
  auth_code?: string;
  verification_url?: string;
  issuing_agency?: string;
  issuing_agency_cnpj?: string;
  issuing_agency_phone?: string;
  issuing_agency_website?: string;
  source_file_ref?: string;
  source_template?: string;
  protocol_number?: string;
  document_title?: string;
  signed_at?: string;
  field8_label?: string;
  field10_label?: string;
  extraction_status: 'validated' | 'needs_review';
  requirements: LicenseRequirement[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface LicenseFilters {
  status?: LicenseStatus;
  license_type?: string;
  holder_name?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const STATUS_LABELS: Record<LicenseStatus, string> = {
  active: 'Ativa',
  expired: 'Vencida',
  suspended: 'Suspensa',
};

export const REQUIREMENT_CATEGORY_LABELS: Record<RequirementCategory, string> = {
  exigencia: 'Exigência',
  requisito_normativo: 'Requisito Normativo',
  proibicao: 'Proibição',
  condicao: 'Condição',
};

export const DEADLINE_TYPE_LABELS: Record<RequirementDeadlineType, string> = {
  single_from_issue: 'Prazo único a partir da emissão',
  recurring: 'Recorrente',
  event_triggered: 'Acionado por evento',
  before_expiry: 'Antes do vencimento',
  none: 'Sem prazo',
};

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  pendente: 'Pendente',
  atende: 'Atende',
  atende_parcialmente: 'Atende parcialmente',
  nao_atende: 'Não atende',
};

export const FULFILLMENT_STATUS_COLORS: Record<FulfillmentStatus, { bg: string; fg: string }> = {
  pendente: { bg: 'rgba(134, 142, 150, 0.15)', fg: '#868e96' },
  atende: { bg: 'rgba(64, 192, 87, 0.15)', fg: '#2f8132' },
  atende_parcialmente: { bg: 'rgba(244, 174, 56, 0.18)', fg: '#a3731c' },
  nao_atende: { bg: 'rgba(250, 82, 82, 0.15)', fg: '#c92a2a' },
};