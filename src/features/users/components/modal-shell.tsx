"use client";

import { useEffect } from "react";
import { X, type Icon } from "@phosphor-icons/react";
import styles from "./modals.module.css";

interface ModalShellProps {
  icon: Icon;
  eyebrow: string;
  title: string;
  size?: "sm" | "md";
  onClose: () => void;
  /** Quando definido, o corpo do modal é um <form> e dispara no submit/Enter. */
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Chrome de modal reutilizável (overlay + header + corpo rolável + footer).
 * Fecha ao clicar fora ou apertar Esc. Compartilhado pelos diálogos da feature.
 */
export function ModalShell({
  icon: Icon,
  eyebrow,
  title,
  size = "md",
  onClose,
  onSubmit,
  children,
  footer,
}: ModalShellProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const inner = (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.headerIcon}>
            <Icon size={22} weight="bold" />
          </span>
          <div className={styles.headerInfo}>
            <span className={styles.headerEyebrow}>{eyebrow}</span>
            <h2 className={styles.headerTitle}>{title}</h2>
          </div>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <div className={styles.body}>{children}</div>

      <div className={styles.footer}>{footer}</div>
    </>
  );

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const className = `${styles.modal} ${size === "sm" ? styles.sm : styles.md}`;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      {onSubmit ? (
        <form className={className} onClick={stop} onSubmit={onSubmit} noValidate>
          {inner}
        </form>
      ) : (
        <div className={className} onClick={stop} role="dialog" aria-modal="true">
          {inner}
        </div>
      )}
    </div>
  );
}
