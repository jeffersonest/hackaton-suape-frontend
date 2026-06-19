"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  Eye,
  FileText,
  X,
  Warning,
  FunnelSimple,
} from "@phosphor-icons/react";
import { fetchLicenses, License, LicenseStatus, LicenseType, STATUS_LABELS } from "@/features/licenses/api";
import { StatusBadge } from "@/features/licenses/components";
import styles from "./licencas.module.css";

const STATUS_OPTIONS: { value: LicenseStatus; label: string }[] = [
  { value: "active", label: STATUS_LABELS.active },
  { value: "expired", label: STATUS_LABELS.expired },
  { value: "suspended", label: STATUS_LABELS.suspended },
];

const LICENSE_TYPES = [
  "Licença Prévia",
  "Licença de Instalação",
  "Licença de Operação",
  "Licença de Operação Corretiva",
  "Licença Única",
  "Autorização Ambiental",
  "Renovação da Licença de Operação",
];

export default function LicencasPage() {
  const [licencas, setLicencas] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);

  // Filtros
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<LicenseStatus | "">("");
  const [tipo, setTipo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = !!status || !!tipo || !!busca;

  useEffect(() => {
    loadLicencas();
  }, [pagina, status, tipo]);

  const loadLicencas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchLicenses({
        status: status || undefined,
        license_type: tipo || undefined,
        search: busca || undefined,
        limit: porPagina,
        offset: (pagina - 1) * porPagina,
      });
      setLicencas(response.data);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error("Erro ao carregar licenças:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as licenças. Verifique se o backend está rodando."
      );
      setLicencas([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    loadLicencas();
  };

  const clearFilters = () => {
    setBusca("");
    setStatus("");
    setTipo("");
    setPagina(1);
    setTimeout(loadLicencas, 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const totalPaginas = Math.ceil(total / porPagina);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <FileText size={28} weight="duotone" className={styles.titleIcon} />
            <div>
              <h1 className={styles.title}>Licenças</h1>
              <p className={styles.subtitle}>
                {total} {total === 1 ? "licença encontrada" : "licenças encontradas"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInput}>
            <MagnifyingGlass size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por número, empresa, CNPJ ou atividade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={styles.input}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={`btn btn-secondary ${showFilters ? styles.active : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelSimple size={18} />
            Filtros
            {hasActiveFilters && <span className={styles.filterBadge} />}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as LicenseStatus | "");
                setPagina(1);
              }}
              className={styles.filterSelect}
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tipo de Licença</label>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setPagina(1);
              }}
              className={styles.filterSelect}
            >
              <option value="">Todos os tipos</option>
              {LICENSE_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={styles.clearFilters}
            >
              <X size={16} />
              Limpar filtros
            </button>
          )}
        </div>
      )}

      <div className={styles.content}>
        {error ? (
          <div className={styles.errorState}>
            <Warning size={48} weight="duotone" />
            <h3>Erro ao carregar licenças</h3>
            <p>{error}</p>
            <button
              type="button"
              onClick={loadLicencas}
              className="btn btn-primary"
            >
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Carregando licenças...</p>
          </div>
        ) : licencas.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={48} weight="duotone" />
            <h3>Nenhuma licença encontrada</h3>
            <p>Tente ajustar os filtros ou realizar uma nova busca.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-primary"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Empresa</th>
                    <th>Tipo</th>
                    <th>CNPJ</th>
                    <th>Emissão</th>
                    <th>Validade</th>
                    <th>Status</th>
                    <th>Exigências</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {licencas.map((licenca) => (
                    <tr key={licenca.identifier}>
                      <td>
                        <span className={styles.numero}>{licenca.number}</span>
                      </td>
                      <td>
                        <div className={styles.empresa}>
                          <span>{licenca.holder_name}</span>
                        </div>
                      </td>
                      <td>{licenca.license_type}</td>
                      <td>
                        <span className={styles.cnpj}>{licenca.cnpj}</span>
                      </td>
                      <td>{formatDate(licenca.issued_at)}</td>
                      <td>{formatDate(licenca.expires_at)}</td>
                      <td>
                        <StatusBadge status={licenca.status} size="sm" />
                      </td>
                      <td>
                        <span className={styles.badgeCount}>
                          {licenca.requirements?.length || 0}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/licencas/${licenca.identifier}`}
                          className={styles.actionBtn}
                          title="Ver detalhes"
                        >
                          <Eye size={18} weight="bold" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Página {pagina} de {totalPaginas}
                </span>
                <div className={styles.paginationButtons}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                  >
                    <CaretLeft size={16} weight="bold" />
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let pageNum: number;
                    if (totalPaginas <= 5) {
                      pageNum = i + 1;
                    } else if (pagina <= 3) {
                      pageNum = i + 1;
                    } else if (pagina >= totalPaginas - 2) {
                      pageNum = totalPaginas - 4 + i;
                    } else {
                      pageNum = pagina - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`${styles.pageBtn} ${pagina === pageNum ? styles.activePage : ""}`}
                        onClick={() => setPagina(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                  >
                    Próxima
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
