"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Buildings,
  MapPin,
  Calendar,
  User,
  ClipboardText,
  Clock,
  CheckCircle,
  Warning,
  DownloadSimple,
  Paperclip,
  File,
  FilePdf,
  FileXls,
  FileImage,
  FileDoc,
  IdentificationCard,
  Tag,
  Hash,
  CalendarDots,
  ShieldCheck,
  ListChecks,
  WarningCircle,
  ClipboardText as AuditIcon,
} from "@phosphor-icons/react";
import {
  fetchLicenseById,
  fetchLicenseFiles,
  License,
  LicenseFile,
  LicenseRequirement,
  REQUIREMENT_CATEGORY_LABELS,
  DEADLINE_TYPE_LABELS,
  formatFileSize,
} from "@/features/licenses/api";
import {
  StatusBadge,
  RequirementModal,
  LicenseFiles,
} from "@/features/licenses/components";
import { AuditTimeline } from "@/features/audit";
import styles from "./licenca-detalhe.module.css";

function getFileIcon(tipo: string) {
  const upper = tipo.toUpperCase();
  if (upper.includes("PDF")) return <FilePdf size={20} weight="duotone" className={styles.pdfIcon} />;
  if (upper.includes("XLS") || upper.includes("XLSX")) return <FileXls size={20} weight="duotone" className={styles.xlsIcon} />;
  if (upper.includes("JPG") || upper.includes("JPEG") || upper.includes("PNG")) return <FileImage size={20} weight="duotone" className={styles.imgIcon} />;
  if (upper.includes("DOC") || upper.includes("DOCX")) return <FileDoc size={20} weight="duotone" className={styles.docIcon} />;
  return <File size={20} weight="duotone" />;
}

function getRequirementIcon(req: LicenseRequirement) {
  // Status derivado do último cumprimento (ou pendente se vazio)
  const lastFulfillment = req.fulfillments?.[req.fulfillments.length - 1];
  const status = lastFulfillment?.status || "pendente";

  if (status === "atende") {
    return <CheckCircle size={18} weight="fill" className={styles.iconSuccess} />;
  }
  if (status === "nao_atende") {
    return <WarningCircle size={18} weight="fill" className={styles.iconError} />;
  }
  if (req.expires_at && new Date(req.expires_at) < new Date()) {
    return <WarningCircle size={18} weight="fill" className={styles.iconExpired} />;
  }
  if (status === "atende_parcialmente") {
    return <Clock size={18} weight="fill" className={styles.iconWarning} />;
  }
  return <Clock size={18} weight="fill" className={styles.iconPending} />;
}

function getRequirementBadgeText(req: LicenseRequirement): string {
  const total = req.fulfillments?.length || 0;
  const last = req.fulfillments?.[req.fulfillments.length - 1];
  if (total === 0) return "Pendente";
  if (last?.status === "atende") return "Cumprida";
  if (last?.status === "atende_parcialmente") return "Parcial";
  if (last?.status === "nao_atende") return "Não atende";
  return `${total} ${total === 1 ? "ocorrência" : "ocorrências"}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export default function LicencaDetalhePage() {
  const params = useParams();
  const [licenca, setLicenca] = useState<License | null>(null);
  const [arquivosCount, setArquivosCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"informacoes" | "exigencias" | "documentos" | "auditoria">(
    "informacoes"
  );
  const [selectedRequirement, setSelectedRequirement] = useState<LicenseRequirement | null>(null);

  useEffect(() => {
    loadLicenca();
  }, [params.id]);

  const loadLicenca = async () => {
    setLoading(true);
    setError(null);
    try {
      const [licencaData, filesData] = await Promise.all([
        fetchLicenseById(params.id as string),
        fetchLicenseFiles(params.id as string).catch(() => []),
      ]);
      setLicenca(licencaData);
      setArquivosCount(filesData.length);
    } catch (err) {
      console.error("Erro ao carregar licença:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar a licença. Verifique se o backend está rodando."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Carregando detalhes da licença...</p>
      </div>
    );
  }

  if (error || !licenca) {
    return (
      <div className={styles.notFound}>
        <Warning size={48} weight="duotone" />
        <h2>Licença não encontrada</h2>
        <p>{error || "A licença solicitada não foi encontrada."}</p>
        <Link href="/licencas" className="btn btn-primary">
          <ArrowLeft size={18} />
          Voltar para listagem
        </Link>
      </div>
    );
  }

  const exigencias = licenca.requirements || [];
  const totalExigencias = exigencias.length;
  const totalFulfillments = exigencias.reduce(
    (acc, r) => acc + (r.fulfillments?.length || 0),
    0
  );
  const attendidas = exigencias.reduce(
    (acc, r) =>
      acc +
      (r.fulfillments?.filter((f) => f.status === "atende").length || 0),
    0
  );

  // Agrupar por categoria
  const exigenciasPorCategoria = exigencias.reduce<Record<string, LicenseRequirement[]>>(
    (acc, req) => {
      const cat = req.category || "exigencia";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(req);
      return acc;
    },
    {}
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/licencas" className={styles.backLink}>
          <ArrowLeft size={20} weight="bold" />
          Voltar para listagem
        </Link>
      </div>

      {/* Card Principal */}
      <div className={styles.mainCard}>
        <div className={styles.mainHeader}>
          <div className={styles.mainInfo}>
            <div className={styles.numeroRow}>
              <span className={styles.numero}>{licenca.number}</span>
              <StatusBadge status={licenca.status} variant="light" />
            </div>
            <h1 className={styles.titulo}>
              {licenca.document_title || licenca.license_type}
            </h1>
            <div className={styles.meta}>
              <span>
                <Buildings size={16} weight="duotone" />
                {licenca.license_type}
              </span>
              <span>
                <Calendar size={16} weight="duotone" />
                Emissão: {formatDate(licenca.issued_at)}
              </span>
              <span>
                <Clock size={16} weight="duotone" />
                Validade: {formatDate(licenca.expires_at)}
              </span>
              {licenca.protocol_number && (
                <span>
                  <Hash size={16} weight="duotone" />
                  Protocolo: {licenca.protocol_number}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Resumo (4 cards no topo) */}
      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <Buildings size={22} weight="duotone" />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Titular</span>
            <span className={styles.infoValue} title={licenca.holder_name}>
              {licenca.holder_name}
            </span>
            <span className={styles.infoSub}>CNPJ: {licenca.cnpj}</span>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <MapPin size={22} weight="duotone" />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Localização</span>
            <span className={styles.infoValue}>
              {licenca.city && licenca.state
                ? `${licenca.city}/${licenca.state}`
                : "—"}
            </span>
            {licenca.zip_code && (
              <span className={styles.infoSub}>CEP: {licenca.zip_code}</span>
            )}
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <User size={22} weight="duotone" />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Órgão Emissor</span>
            <span className={styles.infoValue} title={licenca.issuing_agency || ""}>
              {licenca.issuing_agency || "—"}
            </span>
            {licenca.auth_code && (
              <span className={styles.infoSub}>Autenticação: {licenca.auth_code}</span>
            )}
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <ListChecks size={22} weight="duotone" />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Exigências</span>
            <span className={styles.infoValue}>
              {totalExigencias} {totalExigencias === 1 ? "exigência" : "exigências"}
            </span>
            <span className={styles.infoSub}>
              {attendidas}/{totalFulfillments} cumprimentos
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "informacoes" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("informacoes")}
          >
            <IdentificationCard size={18} />
            Informações
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "exigencias" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("exigencias")}
          >
            <ClipboardText size={18} />
            Exigências ({totalExigencias})
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "documentos" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("documentos")}
          >
            <Paperclip size={18} />
            Documentos ({arquivosCount})
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "auditoria" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("auditoria")}
          >
            <AuditIcon size={18} />
            Auditoria
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* Informações Cadastrais */}
          {activeTab === "informacoes" && (
            <div className={styles.cadastralSection}>
              <h3 className={styles.sectionTitle}>Dados do Empreendimento</h3>
              <div className={styles.cadastralGrid}>
                {licenca.enterprise_number && (
                  <div className={styles.cadastralItem}>
                    <span className={styles.cadastralLabel}>Nº do Empreendimento</span>
                    <span className={`${styles.cadastralValue} ${styles.cadastralValueMono}`}>
                      {licenca.enterprise_number}
                    </span>
                  </div>
                )}
                <div className={styles.cadastralItem}>
                  <span className={styles.cadastralLabel}>Razão Social</span>
                  <span className={styles.cadastralValue}>{licenca.holder_name}</span>
                </div>
                <div className={styles.cadastralItem}>
                  <span className={styles.cadastralLabel}>CNPJ</span>
                  <span className={`${styles.cadastralValue} ${styles.cadastralValueMono}`}>
                    {licenca.cnpj}
                  </span>
                </div>
                {licenca.state_registration && (
                  <div className={styles.cadastralItem}>
                    <span className={styles.cadastralLabel}>Inscrição Estadual</span>
                    <span className={`${styles.cadastralValue} ${styles.cadastralValueMono}`}>
                      {licenca.state_registration}
                    </span>
                  </div>
                )}
                {(licenca.address || licenca.city) && (
                  <div className={`${styles.cadastralItem} ${styles.fullWidth}`}>
                    <span className={styles.cadastralLabel}>Endereço</span>
                    <span className={styles.cadastralValue}>
                      {[
                        licenca.address,
                        licenca.city && licenca.state ? `${licenca.city}/${licenca.state}` : null,
                        licenca.zip_code ? `CEP ${licenca.zip_code}` : null,
                      ]
                        .filter(Boolean)
                        .join(" — ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Caracterização */}
              {(licenca.main_activity || licenca.legal_framework) && (
                <>
                  <h3 className={styles.sectionTitle} style={{ marginTop: 32 }}>
                    Caracterização do Empreendimento
                  </h3>
                  <div className={styles.caracterizacaoBox}>
                    {licenca.main_activity && (
                      <p className={styles.caracterizacaoDescricao}>{licenca.main_activity}</p>
                    )}
                    {licenca.legal_framework && (
                      <div className={styles.caracterizacaoHeader}>
                        <span><strong>Legislação:</strong> {licenca.legal_framework}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Objetivo da Autorização */}
              {licenca.purpose && (
                <>
                  <h3 className={styles.sectionTitle} style={{ marginTop: 32 }}>
                    Objetivo
                  </h3>
                  <p className={styles.cadastralValue}>{licenca.purpose}</p>
                </>
              )}

              {/* Dados da Emissão */}
              <h3 className={styles.sectionTitle} style={{ marginTop: 32 }}>
                Dados da Emissão
              </h3>
              <div className={styles.cadastralGrid}>
                {licenca.protocol_number && (
                  <div className={styles.cadastralItem}>
                    <span className={styles.cadastralLabel}>Nº do Protocolo</span>
                    <span className={`${styles.cadastralValue} ${styles.cadastralValueMono}`}>
                      {licenca.protocol_number}
                    </span>
                  </div>
                )}
                {licenca.auth_code && (
                  <div className={styles.cadastralItem}>
                    <span className={styles.cadastralLabel}>Código de Autenticação</span>
                    <span className={`${styles.cadastralValue} ${styles.cadastralValueMono}`}>
                      {licenca.auth_code}
                    </span>
                  </div>
                )}
                {licenca.issuing_agency && (
                  <div className={styles.cadastralItem}>
                    <span className={styles.cadastralLabel}>Órgão Emissor</span>
                    <span className={styles.cadastralValue}>{licenca.issuing_agency}</span>
                  </div>
                )}
                {licenca.issuing_agency_cnpj && (
                  <div className={styles.cadastralItem}>
                    <span className={styles.cadastralLabel}>CNPJ do Órgão</span>
                    <span className={`${styles.cadastralValue} ${styles.cadastralValueMono}`}>
                      {licenca.issuing_agency_cnpj}
                    </span>
                  </div>
                )}
                <div className={styles.cadastralItem}>
                  <span className={styles.cadastralLabel}>Data de Emissão</span>
                  <span className={styles.cadastralValue}>{formatDate(licenca.issued_at)}</span>
                </div>
                <div className={styles.cadastralItem}>
                  <span className={styles.cadastralLabel}>Data de Validade</span>
                  <span className={styles.cadastralValue}>{formatDate(licenca.expires_at)}</span>
                </div>
                {licenca.signed_at && (
                  <div className={styles.cadastralItem}>
                    <span className={styles.cadastralLabel}>Assinada em</span>
                    <span className={styles.cadastralValue}>
                      {new Date(licenca.signed_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                )}
                <div className={styles.cadastralItem}>
                  <span className={styles.cadastralLabel}>Status da Extração</span>
                  <span className={styles.cadastralValue}>
                    {licenca.extraction_status === "validated" ? "Validada" : "Em revisão"}
                  </span>
                </div>
              </div>

              {/* Observações */}
              {licenca.observations && (
                <>
                  <h3 className={styles.sectionTitle} style={{ marginTop: 32 }}>
                    Observações
                  </h3>
                  <p className={styles.cadastralValue}>{licenca.observations}</p>
                </>
              )}

              {/* Verificação */}
              {licenca.verification_url && (
                <>
                  <h3 className={styles.sectionTitle} style={{ marginTop: 32 }}>
                    Verificação
                  </h3>
                  <a
                    href={licenca.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cadastralValue}
                    style={{ color: "var(--color-primary)", textDecoration: "underline" }}
                  >
                    {licenca.verification_url}
                  </a>
                </>
              )}
            </div>
          )}

          {/* Exigências */}
          {activeTab === "exigencias" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {exigencias.length === 0 ? (
                <p style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                  Nenhuma exigência cadastrada para esta licença.
                </p>
              ) : (
                Object.entries(exigenciasPorCategoria).map(([categoria, reqs]) => (
                  <div key={categoria}>
                    <h4
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'Montserrat', sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        color: "var(--text-secondary)",
                        margin: "0 0 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <ShieldCheck size={16} />
                      {REQUIREMENT_CATEGORY_LABELS[categoria as keyof typeof REQUIREMENT_CATEGORY_LABELS] || categoria}
                      <span style={{ fontWeight: 400, color: "var(--text-muted)", textTransform: "none", fontFamily: "inherit", letterSpacing: 0 }}>
                        ({reqs.length})
                      </span>
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {reqs.map((req) => (
                        <button
                          key={req.identifier}
                          type="button"
                          onClick={() => setSelectedRequirement(req)}
                          className={styles.requirementItem}
                        >
                          <div className={styles.requirementHeader}>
                            <span className={styles.requirementNumber}>
                              Item {req.item_number}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span className={styles.requirementMeta}>
                                <Clock size={12} />
                                {DEADLINE_TYPE_LABELS[req.deadline_type] || req.deadline_type}
                              </span>
                              {req.expires_at && (
                                <span className={styles.requirementMeta}>
                                  <CalendarDots size={12} />
                                  {formatDateShort(req.expires_at)}
                                </span>
                              )}
                              {getRequirementIcon(req)}
                            </div>
                          </div>
                          <p className={styles.requirementDescription}>{req.description}</p>
                          <span className={styles.requirementHint}>Clique para abrir detalhes</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Documentos */}
          {activeTab === "documentos" && (
            <LicenseFiles
              licenseId={licenca.identifier}
              onCountChange={setArquivosCount}
            />
          )}

          {/* Auditoria */}
          {activeTab === "auditoria" && (
            <AuditTimeline licenseId={licenca.identifier} />
          )}
        </div>
      </div>

      {/* Modal de Exigência */}
      {selectedRequirement && (
        <RequirementModal
          requirement={selectedRequirement}
          onClose={() => setSelectedRequirement(null)}
          onUpdated={async () => {
            // Recarrega a licença inteira para pegar fulfillments atualizados
            try {
              const updated = await fetchLicenseById(licenca.identifier);
              setLicenca(updated);
              const refreshed = updated.requirements.find(
                (r) => r.identifier === selectedRequirement.identifier
              );
              if (refreshed) setSelectedRequirement(refreshed);
            } catch (err) {
              console.error("Erro ao recarregar licença:", err);
            }
          }}
        />
      )}
    </div>
  );
}
