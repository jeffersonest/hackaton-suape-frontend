import type { AttachmentKind, PendingAttachment } from "../types";

const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"];
const SHEET_EXTS = ["xls", "xlsx", "ods"];
const DOC_EXTS = ["doc", "docx", "odt", "txt", "rtf", "md"];

/** Formata o tamanho do arquivo de forma legível (B, KB, MB). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveKind(file: File, ext: string): AttachmentKind {
  if (file.type.startsWith("image/") || IMAGE_EXTS.includes(ext)) return "image";
  if (ext === "pdf" || file.type === "application/pdf") return "pdf";
  if (ext === "csv" || file.type === "text/csv") return "csv";
  if (SHEET_EXTS.includes(ext)) return "sheet";
  if (DOC_EXTS.includes(ext)) return "doc";
  return "file";
}

let counter = 0;

/** Converte um File em um anexo pendente, com preview para imagens. */
export function describeAttachment(file: File): PendingAttachment {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const kind = resolveKind(file, ext);
  counter += 1;
  return {
    id: `att-${counter}-${file.name}`,
    file,
    name: file.name,
    ext,
    sizeLabel: formatFileSize(file.size),
    kind,
    previewUrl: kind === "image" ? URL.createObjectURL(file) : undefined,
  };
}
