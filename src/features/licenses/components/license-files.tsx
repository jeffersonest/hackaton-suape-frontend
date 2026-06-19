"use client";

import { useEffect, useRef, useState } from "react";
import {
  Paperclip,
  UploadSimple,
  TrashSimple,
  File,
  FilePdf,
  FileImage,
  DownloadSimple,
  CircleNotch,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import {
  LicenseFile,
  fetchLicenseFiles,
  uploadLicenseFile,
  deleteFile,
  formatFileSize,
  isImage,
} from "@/features/licenses/api";
import styles from "./license-files.module.css";

interface LicenseFilesProps {
  licenseId: string;
  onCountChange?: (count: number) => void;
}

function getFileIcon(file: LicenseFile) {
  if (isImage(file.content_type)) return <FileImage size={20} weight="duotone" />;
  if (file.content_type.includes("pdf")) return <FilePdf size={20} weight="duotone" />;
  return <File size={20} weight="duotone" />;
}

export function LicenseFiles({ licenseId, onCountChange }: LicenseFilesProps) {
  const [files, setFiles] = useState<LicenseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [licenseId]);

  useEffect(() => {
    onCountChange?.(files.length);
  }, [files.length, onCountChange]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fetchLicenseFiles(licenseId);
      setFiles(data);
    } catch (err) {
      console.error("Erro ao carregar arquivos:", err);
      setError("Não foi possível carregar os documentos.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(selected)) {
        const uploaded = await uploadLicenseFile(licenseId, file);
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
    if (!confirm("Deseja realmente excluir este documento?")) return;
    setDeletingId(fileId);
    try {
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.identifier !== fileId));
    } catch (err) {
      console.error("Erro ao deletar:", err);
      setError("Não foi possível excluir o documento.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Paperclip size={16} />
          Documentos da Licença
        </h3>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <CircleNotch size={16} className={styles.spinning} />
              Enviando...
            </>
          ) : (
            <>
              <UploadSimple size={16} weight="bold" />
              Anexar documento
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>

      {error && (
        <div className={styles.errorBox}>
          <WarningCircle size={16} />
          {error}
          <button
            type="button"
            className={styles.errorDismiss}
            onClick={() => setError(null)}
          >
            <X size={12} />
          </button>
        </div>
      )}

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
        <UploadSimple size={32} weight="duotone" />
        <p>
          <strong>Clique aqui</strong> ou arraste documentos para anexar
        </p>
        <span>PDFs, imagens, planilhas, documentos Office</span>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <CircleNotch size={24} className={styles.spinning} />
          <p>Carregando documentos...</p>
        </div>
      ) : files.length === 0 ? (
        <div className={styles.empty}>
          <Paperclip size={40} weight="duotone" />
          <h4>Nenhum documento anexado</h4>
          <p>Faça upload do primeiro documento desta licença.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {files.map((file) => {
            const isImg = isImage(file.content_type);
            return (
              <div key={file.identifier} className={styles.fileCard}>
                {isImg ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.preview}
                  >
                    <img src={file.url} alt={file.filename} loading="lazy" />
                  </a>
                ) : (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.preview} ${styles.previewIcon}`}
                  >
                    {getFileIcon(file)}
                  </a>
                )}
                <div className={styles.info}>
                  <span className={styles.fileName} title={file.filename}>
                    {file.filename}
                  </span>
                  <span className={styles.fileMeta}>
                    {formatFileSize(file.size)} • {formatDateTime(file.created_at)}
                  </span>
                </div>
                <div className={styles.actions}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                    title="Baixar"
                  >
                    <DownloadSimple size={16} weight="bold" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file.identifier)}
                    className={`${styles.actionBtn} ${styles.actionDelete}`}
                    title="Excluir"
                    disabled={deletingId === file.identifier}
                  >
                    {deletingId === file.identifier ? (
                      <CircleNotch size={16} className={styles.spinning} />
                    ) : (
                      <TrashSimple size={16} weight="bold" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}