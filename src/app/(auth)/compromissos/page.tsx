"use client";

import { useEffect, useState } from "react";
import {
  Handshake,
  X,
  MapTrifold,
  GlobeHemisphereWest,
  Tree,
  WarningOctagon,
  FileText,
  Buildings,
  CalendarCheck,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import {
  COMMITMENTS,
  earthUrl,
  mapsEmbed,
  mapsUrl,
  type Commitment,
} from "@/features/commitments/mock";
import styles from "./compromissos.module.css";

const STATUS_COLORS: Record<Commitment["status"], { bg: string; fg: string }> = {
  "Em execução": { bg: "rgba(14, 111, 196, 0.12)", fg: "#0e6fc4" },
  Vigente: { bg: "rgba(64, 192, 87, 0.15)", fg: "#2f8132" },
  Concluído: { bg: "rgba(134, 142, 150, 0.15)", fg: "#5b6b80" },
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  if (!m) return ym;
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${months[Number(m) - 1]}/${y}`;
};

const dateLabel = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");

export default function CompromissosPage() {
  const [selected, setSelected] = useState<Commitment | null>(null);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <Handshake size={26} weight="duotone" />
        </div>
        <div>
          <h1 className={styles.title}>Termos de Compromisso</h1>
          <p className={styles.subtitle}>
            Compromissos ambientais firmados com a CPRH — compensação florestal e replantio.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {COMMITMENTS.map((tc) => {
          const color = STATUS_COLORS[tc.status];
          return (
            <button
              key={tc.id}
              type="button"
              className={styles.card}
              onClick={() => setSelected(tc)}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardNumber}>TC {tc.numero}</span>
                <span className={styles.statusChip} style={{ background: color.bg, color: color.fg }}>
                  {tc.status}
                </span>
              </div>
              <p className={styles.cardObjeto}>{tc.objeto}</p>
              <div className={styles.cardMeta}>
                <span>
                  <Tree size={14} weight="duotone" /> {tc.mudas} mudas
                </span>
                <span>
                  <FileText size={14} weight="duotone" /> {tc.licenca}
                </span>
              </div>
              <span className={styles.cardLink}>Ver detalhes →</span>
            </button>
          );
        })}
      </div>

      {selected && <CommitmentModal commitment={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CommitmentModal({ commitment, onClose }: { commitment: Commitment; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const color = STATUS_COLORS[commitment.status];
  const info: [string, string][] = [
    ["Órgão", commitment.orgao],
    ["Compromissado", commitment.compromissado],
    ["CNPJ", commitment.cnpj],
    ["Representante", commitment.representante],
    ["Processos", commitment.processos],
    ["Licença vinculada", commitment.licenca],
    ["Assinado em", dateLabel(commitment.assinado_em)],
    ["Início do plantio", monthLabel(commitment.inicio_plantio)],
    ["Monitoramento", `${commitment.monitoramento_meses} meses`],
    ["Mudas / bioma", `${commitment.mudas} mudas · ${commitment.bioma}`],
  ];

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.modalHeaderInfo}>
            <div className={styles.headerIcon}>
              <Handshake size={22} weight="duotone" />
            </div>
            <div>
              <span className={styles.modalEyebrow}>Termo de Compromisso</span>
              <h2 className={styles.modalTitle}>TC nº {commitment.numero}</h2>
            </div>
            <span className={styles.statusChip} style={{ background: color.bg, color: color.fg }}>
              {commitment.status}
            </span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={20} weight="bold" />
          </button>
        </header>

        <div className={styles.modalBody}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Buildings size={16} /> Informações básicas
            </h3>
            <div className={styles.infoGrid}>
              {info.map(([label, value]) => (
                <div key={label} className={styles.infoItem}>
                  <span className={styles.infoLabel}>{label}</span>
                  <span className={styles.infoValue}>{value}</span>
                </div>
              ))}
            </div>
            <div className={styles.objetoBox}>
              <span className={styles.infoLabel}>Objeto</span>
              <p>{commitment.objeto}</p>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Tree size={16} /> {commitment.clausula4_titulo}
            </h3>
            <p className={styles.clauseText}>{commitment.clausula4_texto}</p>

            <div className={styles.mapWrap}>
              <iframe
                title={`Local do replantio — TC ${commitment.numero}`}
                className={styles.map}
                src={mapsEmbed(commitment.replantio_lat, commitment.replantio_lon)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className={styles.mapMeta}>
              <span className={styles.coords}>
                <MapTrifold size={14} weight="duotone" />
                {commitment.replantio_lat.toFixed(6)}, {commitment.replantio_lon.toFixed(6)}
                <span className={styles.verticesTag}>
                  {commitment.replantio_vertices.length} vértices
                </span>
              </span>
              <div className={styles.mapActions}>
                <a
                  className={styles.earthBtn}
                  href={earthUrl(commitment.replantio_lat, commitment.replantio_lon)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GlobeHemisphereWest size={16} weight="duotone" />
                  Google Earth
                  <ArrowSquareOut size={13} weight="bold" />
                </a>
                <a
                  className={styles.mapsBtn}
                  href={mapsUrl(commitment.replantio_lat, commitment.replantio_lon)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapTrifold size={16} weight="duotone" />
                  Google Maps
                  <ArrowSquareOut size={13} weight="bold" />
                </a>
              </div>
            </div>
          </section>

          <section className={`${styles.section} ${styles.penaltySection}`}>
            <h3 className={styles.sectionTitle}>
              <WarningOctagon size={16} weight="duotone" /> {commitment.clausula7_titulo}
            </h3>
            <p className={styles.clauseText}>{commitment.clausula7_texto}</p>
            <div className={styles.penaltyTag}>
              <WarningOctagon size={16} weight="fill" />
              Multa por descumprimento: <strong>{money(commitment.multa)}</strong>
            </div>
          </section>

          <p className={styles.mockNote}>
            <CalendarCheck size={13} /> Tela demonstrativa (mock) — dados ilustrativos do Termo de
            Compromisso.
          </p>
        </div>
      </div>
    </div>
  );
}
