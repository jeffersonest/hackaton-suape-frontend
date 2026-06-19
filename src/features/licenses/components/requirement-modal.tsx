"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  UploadSimple,
  TrashSimple,
  File,
  FilePdf,
  FileImage,
  DownloadSimple,
  CheckCircle,
  Clock,
  CalendarDots,
  TextAlignLeft,
  Paperclip,
  CircleNotch,
  WarningCircle,
  Tag,
  Plus,
  FloppyDisk,
  Buildings,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import {
  LicenseRequirement,
  LicenseFile,
  RequirementFulfillment,
  FulfillmentStatus,
  InternalClient,
  REQUIREMENT_CATEGORY_LABELS,
  DEADLINE_TYPE_LABELS,
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUS_COLORS,
  fetchRequirementFiles,
  uploadRequirementFile,
  deleteFile,
  fetchFulfillments,
  upsertFulfillment,
  fetchInternalClients,
  formatFileSize,
  isImage,
} from "@/features/licenses/api";
import { useSessionStore } from "@/features/auth";
import styles from "./requirement-modal.module.css";

interface RequirementModalProps {
  requirement: LicenseRequirement;
  onClose: () => void;
  onUpdated?: () => void;
}

const STATUS_OPTIONS: FulfillmentStatus[] = [
  "pendente",
  "atende",
  "atende_parcialmente",
  "nao_atende",
];

function getFileIcon(file: LicenseFile) {
  if (isImage(file.content_type)) return <FileImage size={20} weight="duotone" />;
  if (file.content_type.includes("pdf")) return <FilePdf size={20} weight="duotone" />;
  return <File size={20} weight="duotone" />;
}

function isRecurring(req: LicenseRequirement) {
  return req.deadline_type === "recurring";
}

export function RequirementModal({
  requirement,
  onClose,
  onUpdated,
}: RequirementModalProps) {
  const currentUser = useSessionStore((s) => s.user);

  const [files, setFiles] = useState<LicenseFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fulfillments
  const [fulfillments, setFulfillments] = useState<RequirementFulfillment[]>(
    requirement.fulfillments || []
  );
  const [selectedOccurrence, setSelectedOccurrence] = useState<string | null>(
    null
  );

  // Nova ocorrência (inline)
  const [showNewOccurrence, setShowNewOccurrence] = useState(false);
  const [newOccurrenceDate, setNewOccurrenceDate] = useState("");
  const [creatingOccurrence, setCreatingOccurrence] = useState(false);

  // Sugere a próxima data: se a última ocorrência for hoje/futura,
  // sugere +1 dia. Senão, sugere hoje.
  const suggestedNextDate = () => {
    if (fulfillments.length === 0) {
      return new Date().toISOString().split("T")[0];
    }
    const last = fulfillments[fulfillments.length - 1];
    if (!last.occurrence_due_date) {
      return new Date().toISOString().split("T")[0];
    }
    const lastDate = new Date(last.occurrence_due_date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const base = lastDate >= today ? lastDate : today;
    base.setMonth(base.getMonth() + (requirement.recurrence_interval_months || 1));
    return base.toISOString().split("T")[0];
  };

  useEffect(() => {
    loadFiles();
    // Inicializa seleção: 1ª ocorrência pendente ou a última
    if (fulfillments.length > 0) {
      const pending = fulfillments.find((f) => f.status === "pendente");
      setSelectedOccurrence(
        pending?.occurrence_due_date || fulfillments[fulfillments.length - 1].occurrence_due_date
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const data = await fetchRequirementFiles(requirement.identifier);
      setFiles(data);
    } catch (err) {
      console.error("Erro ao carregar arquivos:", err);
      setError("Não foi possível carregar os anexos.");
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(selected)) {
        const uploaded = await uploadRequirementFile(requirement.identifier, file);
        setFiles((prev) => [uploaded, ...prev]);
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      setError("Falha ao enviar arquivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Deseja realmente excluir este anexo?")) return;
    setDeletingId(fileId);
    try {
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.identifier !== fileId));
    } catch (err) {
      console.error("Erro ao deletar:", err);
      setError("Não foi possível excluir o arquivo.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateShort = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  // Recarrega lista de fulfillments do backend
  const reloadFulfillments = async () => {
    try {
      const data = await fetchFulfillments(requirement.identifier);
      setFulfillments(data);
    } catch (err) {
      console.error("Erro ao recarregar cumprimentos:", err);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <TextAlignLeft size={22} weight="duotone" />
            </div>
            <div className={styles.headerInfo}>
              <span className={styles.headerEyebrow}>Exigência</span>
              <h2 className={styles.headerTitle}>Item {requirement.item_number}</h2>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Categoria</span>
              <span className={styles.metaValue}>
                <Tag size={14} />
                {REQUIREMENT_CATEGORY_LABELS[requirement.category as keyof typeof REQUIREMENT_CATEGORY_LABELS] || requirement.category}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Prazo</span>
              <span className={styles.metaValue}>
                <Clock size={14} />
                {DEADLINE_TYPE_LABELS[requirement.deadline_type as keyof typeof DEADLINE_TYPE_LABELS] || requirement.deadline_type}
              </span>
            </div>
            {requirement.recurrence_interval_months && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Recorrência</span>
                <span className={styles.metaValue}>
                  A cada {requirement.recurrence_interval_months} meses
                </span>
              </div>
            )}
          </div>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Descrição da Exigência</h3>
            <p className={styles.description}>{requirement.description}</p>
          </section>

          {/* Cumprimentos */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <CheckCircle size={16} />
              Cumprimentos
            </h3>

            {fulfillments.length === 0 ? (
              <p className={styles.emptyHint}>
                Nenhum cumprimento registrado ainda. Clique em "Novo cumprimento" para criar.
              </p>
            ) : (
              <div className={styles.fulfillmentList}>
                {fulfillments.map((f) => {
                  const isSelected = selectedOccurrence === f.occurrence_due_date
                    || (!selectedOccurrence && fulfillments[0] === f);
                  const color = FULFILLMENT_STATUS_COLORS[f.status];
                  return (
                    <button
                      type="button"
                      key={f.identifier}
                      className={`${styles.occurrenceChip} ${isSelected ? styles.occurrenceChipActive : ""}`}
                      onClick={() => setSelectedOccurrence(f.occurrence_due_date)}
                    >
                      <span className={styles.occurrenceDate}>
                        <CalendarDots size={12} />
                        {isRecurring(requirement)
                          ? formatDateShort(f.occurrence_due_date)
                          : "Prazo único"}
                      </span>
                      <span
                        className={styles.occurrenceStatus}
                        style={{ background: color.bg, color: color.fg }}
                      >
                        {FULFILLMENT_STATUS_LABELS[f.status]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {isRecurring(requirement) && (
              showNewOccurrence ? (
                <div className={styles.newOccurrenceForm}>
                  <input
                    type="date"
                    className={styles.newOccurrenceInput}
                    value={newOccurrenceDate}
                    onChange={(e) => setNewOccurrenceDate(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className={styles.newOccurrenceConfirm}
                    disabled={!newOccurrenceDate || creatingOccurrence}
                    onClick={async () => {
                      setCreatingOccurrence(true);
                      try {
                        await upsertFulfillment(requirement.identifier, {
                          status: "pendente",
                          occurrence_due_date: newOccurrenceDate,
                        });
                        await reloadFulfillments();
                        setSelectedOccurrence(newOccurrenceDate);
                        setShowNewOccurrence(false);
                        setNewOccurrenceDate("");
                        onUpdated?.();
                      } catch (err) {
                        console.error(err);
                        setError("Falha ao criar ocorrência.");
                      } finally {
                        setCreatingOccurrence(false);
                      }
                    }}
                  >
                    {creatingOccurrence ? (
                      <CircleNotch size={14} className={styles.spinning} />
                    ) : (
                      <CheckCircle size={14} weight="bold" />
                    )}
                    Confirmar
                  </button>
                  <button
                    type="button"
                    className={styles.newOccurrenceCancel}
                    onClick={() => {
                      setShowNewOccurrence(false);
                      setNewOccurrenceDate("");
                    }}
                    disabled={creatingOccurrence}
                    aria-label="Cancelar"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.addOccurrenceBtn}
                  onClick={() => {
                    setNewOccurrenceDate(suggestedNextDate());
                    setShowNewOccurrence(true);
                  }}
                >
                  <Plus size={14} weight="bold" />
                  Nova ocorrência
                </button>
              )
            )}
          </section>

          {/* Editor do cumprimento selecionado */}
          {(() => {
            const current = selectedOccurrence
              ? fulfillments.find((f) => f.occurrence_due_date === selectedOccurrence)
              : fulfillments[0];

            if (!current) return null;

            return (
              <FulfillmentEditor
                key={current.identifier}
                fulfillment={current}
                requirement={requirement}
                responsibleEmail={currentUser?.email}
                responsibleName={currentUser?.email}
                isRecurring={isRecurring(requirement)}
                onSaved={async () => {
                  await reloadFulfillments();
                  onUpdated?.();
                }}
                onError={(msg) => setError(msg)}
              />
            );
          })()}

          {error && (
            <div className={styles.errorBox}>
              <WarningCircle size={16} />
              {error}
              <button type="button" className={styles.errorDismiss} onClick={() => setError(null)}>
                <X size={12} />
              </button>
            </div>
          )}

          {/* Anexos */}
          <section className={styles.section}>
            <div className={styles.attachmentsHeader}>
              <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
                <Paperclip size={16} />
                Anexos
              </h3>
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <CircleNotch size={14} className={styles.spinning} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UploadSimple size={14} weight="bold" />
                    Anexar
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </div>

            <div
              className={styles.dropZone}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(styles.dragOver);
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove(styles.dragOver)}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(styles.dragOver);
                if (e.dataTransfer.files?.length) {
                  const dt = new DataTransfer();
                  Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f));
                  handleFileSelect({ target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <UploadSimple size={24} weight="duotone" />
              <p>Clique ou arraste arquivos</p>
            </div>

            {loadingFiles ? (
              <div className={styles.loadingFiles}>
                <CircleNotch size={16} className={styles.spinning} />
                Carregando...
              </div>
            ) : files.length === 0 ? (
              <p className={styles.emptyFiles}>Nenhum anexo.</p>
            ) : (
              <div className={styles.filesGrid}>
                {files.map((file) => (
                  <div key={file.identifier} className={styles.fileCard}>
                    {isImage(file.content_type) ? (
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.filePreview}>
                        <img src={file.url} alt={file.filename} loading="lazy" />
                      </a>
                    ) : (
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className={`${styles.filePreview} ${styles.fileIconPreview}`}>
                        {getFileIcon(file)}
                      </a>
                    )}
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName} title={file.filename}>{file.filename}</span>
                      <span className={styles.fileMeta}>
                        {formatFileSize(file.size)} • {formatDateTime(file.created_at)}
                      </span>
                    </div>
                    <div className={styles.fileActions}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.fileActionBtn} title="Baixar">
                        <DownloadSimple size={14} weight="bold" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.identifier)}
                        className={`${styles.fileActionBtn} ${styles.fileActionDelete}`}
                        title="Excluir"
                        disabled={deletingId === file.identifier}
                      >
                        {deletingId === file.identifier ? (
                          <CircleNotch size={14} className={styles.spinning} />
                        ) : (
                          <TrashSimple size={14} weight="bold" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className={styles.footer}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}

// Sub-componente: editor do cumprimento
interface FulfillmentEditorProps {
  fulfillment: RequirementFulfillment;
  requirement: LicenseRequirement;
  responsibleEmail?: string;
  responsibleName?: string;
  isRecurring: boolean;
  onSaved: () => void;
  onError: (msg: string) => void;
}

function FulfillmentEditor({
  fulfillment,
  responsibleEmail,
  responsibleName,
  isRecurring,
  onSaved,
  onError,
}: FulfillmentEditorProps) {
  const [status, setStatus] = useState<FulfillmentStatus>(fulfillment.status);
  const [seiProcessNumber, setSeiProcessNumber] = useState(
    fulfillment.sei_process_number || ""
  );
  const [evidenceNote, setEvidenceNote] = useState(fulfillment.evidence_note || "");
  const [internalDeadline, setInternalDeadline] = useState(fulfillment.internal_deadline || "");
  const [regulatorDeadline, setRegulatorDeadline] = useState(fulfillment.regulator_deadline || "");
  const [complianceWeight, setComplianceWeight] = useState(fulfillment.compliance_weight);
  const [responsibleArea, setResponsibleArea] = useState<string | null>(
    fulfillment.responsible_area || null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reseta os campos quando muda o cumprimento selecionado
  useEffect(() => {
    setStatus(fulfillment.status);
    setSeiProcessNumber(fulfillment.sei_process_number || "");
    setEvidenceNote(fulfillment.evidence_note || "");
    setInternalDeadline(fulfillment.internal_deadline || "");
    setRegulatorDeadline(fulfillment.regulator_deadline || "");
    setComplianceWeight(fulfillment.compliance_weight);
    setResponsibleArea(fulfillment.responsible_area || null);
    setSaved(false);
  }, [fulfillment.identifier, fulfillment.status, fulfillment.sei_process_number, fulfillment.evidence_note, fulfillment.internal_deadline, fulfillment.regulator_deadline, fulfillment.compliance_weight, fulfillment.responsible_area]);

  const handleSave = async () => {
    setSaving(true);
    onError("");
    try {
      await upsertFulfillment(fulfillment.requirement_id, {
        status,
        occurrence_due_date: fulfillment.occurrence_due_date,
        responsible_id: undefined, // backend usa usuário logado
        internal_deadline: internalDeadline || null,
        regulator_deadline: regulatorDeadline || null,
        compliance_weight: complianceWeight,
        sei_process_number: seiProcessNumber.trim() || null,
        responsible_area: responsibleArea,
        evidence_note: evidenceNote.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar cumprimento:", err);
      onError(err instanceof Error ? err.message : "Falha ao salvar cumprimento.");
    } finally {
      setSaving(false);
    }
  };

  const color = FULFILLMENT_STATUS_COLORS[status];

  return (
    <section className={styles.editorSection}>
      <h3 className={styles.sectionTitle}>
        <FloppyDisk size={16} />
        Detalhes do cumprimento
      </h3>

      {/* Status */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Situação</label>
        <div className={styles.statusGrid}>
          {STATUS_OPTIONS.map((opt) => {
            const optColor = FULFILLMENT_STATUS_COLORS[opt];
            const active = status === opt;
            return (
              <button
                key={opt}
                type="button"
                className={`${styles.statusOption} ${active ? styles.statusOptionActive : ""}`}
                onClick={() => setStatus(opt)}
                style={active ? { background: optColor.bg, color: optColor.fg, borderColor: optColor.fg } : undefined}
              >
                {FULFILLMENT_STATUS_LABELS[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Datas e peso */}
      <div className={styles.fieldGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Prazo interno</label>
          <input
            type="date"
            className={styles.fieldInput}
            value={internalDeadline || ""}
            onChange={(e) => setInternalDeadline(e.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Prazo CPRH</label>
          <input
            type="date"
            className={styles.fieldInput}
            value={regulatorDeadline || ""}
            onChange={(e) => setRegulatorDeadline(e.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Peso da conformidade</label>
          <input
            type="number"
            min="0"
            className={styles.fieldInput}
            value={complianceWeight}
            onChange={(e) => setComplianceWeight(parseInt(e.target.value || "0", 10))}
          />
        </div>
      </div>

      {/* SEI */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Nº do Processo SEI</label>
        <input
          type="text"
          className={`${styles.fieldInput} ${styles.fieldInputMono}`}
          placeholder="Ex: 0050200040.000002/2026-09"
          value={seiProcessNumber}
          onChange={(e) => setSeiProcessNumber(e.target.value)}
        />
        <p className={styles.fieldHint}>
          Número do processo SEI onde este cumprimento foi protocolado.
        </p>
      </div>

      {/* Área responsável */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Área responsável (SUAPE)</label>
        <AreaSelect value={responsibleArea} onChange={setResponsibleArea} />
        <p className={styles.fieldHint}>
          Área que busca o SEI e cuida desta exigência. Digite ao menos 3 letras para filtrar.
        </p>
      </div>

      {/* Evidência / observação */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Evidência / Observação</label>
        <textarea
          className={styles.fieldTextarea}
          rows={3}
          placeholder="Descreva a evidência do cumprimento..."
          value={evidenceNote}
          onChange={(e) => setEvidenceNote(e.target.value)}
        />
      </div>

      {/* Responsável (disabled, automático) */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Responsável</label>
        <div className={styles.responsibleBox}>
          <span className={styles.responsibleName}>
            {fulfillment.responsible_email || responsibleName || responsibleEmail || "Usuário logado"}
          </span>
          <span className={styles.responsibleHint}>
            Preenchido automaticamente com o usuário logado
          </span>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: 12 }}
      >
        {saving ? (
          <>
            <CircleNotch size={14} className={styles.spinning} />
            Salvando...
          </>
        ) : saved ? (
          <>
            <CheckCircle size={14} weight="fill" />
            Salvo!
          </>
        ) : (
          <>
            <FloppyDisk size={14} weight="bold" />
            Salvar cumprimento
          </>
        )}
      </button>
    </section>
  );
}

interface AreaSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

function AreaSelect({ value, onChange }: AreaSelectProps) {
  const [clients, setClients] = useState<InternalClient[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchInternalClients()
      .then((data) => active && setClients(data))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected =
    clients.find((c) => c.acronym === value) ||
    (value ? { name: value, acronym: value } : null);

  const q = query.trim().toLowerCase();
  const showList = q.length >= 3;
  const filtered = showList
    ? clients.filter(
        (c) => c.name.toLowerCase().includes(q) || c.acronym.toLowerCase().includes(q)
      )
    : [];

  if (selected) {
    return (
      <div className={styles.areaSelected}>
        <Buildings size={16} weight="duotone" />
        <span className={styles.areaBadge}>{selected.acronym}</span>
        <span className={styles.areaName}>{selected.name}</span>
        <button
          type="button"
          className={styles.areaClear}
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
          aria-label="Trocar área"
        >
          <X size={14} weight="bold" />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.areaSelect} ref={boxRef}>
      <div className={styles.areaInputWrap}>
        <MagnifyingGlass size={16} />
        <input
          type="text"
          className={styles.areaInput}
          placeholder="Buscar área (ex.: GML, ambiental, jurídica...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && showList && (
        <ul className={styles.areaList}>
          {filtered.length === 0 ? (
            <li className={styles.areaEmpty}>Nenhuma área encontrada</li>
          ) : (
            filtered.map((client) => (
              <li key={client.acronym}>
                <button
                  type="button"
                  className={styles.areaOption}
                  onClick={() => {
                    onChange(client.acronym);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className={styles.areaBadge}>{client.acronym}</span>
                  <span className={styles.areaOptionName}>{client.name}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}