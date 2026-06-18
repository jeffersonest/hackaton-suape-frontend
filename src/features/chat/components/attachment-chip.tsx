"use client";

import {
  FilePdf,
  FileCsv,
  FileXls,
  FileDoc,
  FileImage,
  File as FileIcon,
  X,
  type Icon,
} from "@phosphor-icons/react";
import type { AttachmentKind, ChatAttachment } from "../types";
import styles from "./attachment-chip.module.css";

const KIND_ICON: Record<AttachmentKind, Icon> = {
  image: FileImage,
  pdf: FilePdf,
  csv: FileCsv,
  sheet: FileXls,
  doc: FileDoc,
  file: FileIcon,
};

const KIND_COLOR: Record<AttachmentKind, string> = {
  image: "#7048e8",
  pdf: "#fa5252",
  csv: "#2f9e44",
  sheet: "#40c057",
  doc: "#0e6fc4",
  file: "#868e96",
};

interface AttachmentChipProps {
  attachment: ChatAttachment;
  onRemove?: (id: string) => void;
}

export function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  const Icon = KIND_ICON[attachment.kind];
  const color = KIND_COLOR[attachment.kind];
  const isImage = attachment.kind === "image" && attachment.previewUrl;

  return (
    <div className={styles.chip}>
      {isImage ? (
        <img src={attachment.previewUrl} alt={attachment.name} className={styles.thumb} />
      ) : (
        <span className={styles.iconBox} style={{ background: `${color}1a`, color }}>
          <Icon size={22} weight="fill" />
        </span>
      )}

      <span className={styles.info}>
        <span className={styles.name} title={attachment.name}>
          {attachment.name}
        </span>
        <span className={styles.meta}>
          <span className={styles.ext} style={{ color }}>
            {attachment.ext ? attachment.ext.toUpperCase() : "ARQUIVO"}
          </span>
          {attachment.sizeLabel && <span>· {attachment.sizeLabel}</span>}
        </span>
      </span>

      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          onClick={() => onRemove(attachment.id)}
          aria-label={`Remover ${attachment.name}`}
        >
          <X size={14} weight="bold" />
        </button>
      )}
    </div>
  );
}
