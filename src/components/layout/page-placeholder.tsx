import type { Icon } from "@phosphor-icons/react";
import styles from "./page-placeholder.module.css";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: Icon;
}

/**
 * Cabeçalho de página + estado vazio para telas internas ainda em construção.
 * Base visual para evoluirmos cada módulo depois.
 */
export function PagePlaceholder({ title, description, icon: Icon }: PagePlaceholderProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>
            <Icon size={24} weight="duotone" />
          </span>
          <h1 className={styles.title}>{title}</h1>
        </div>
        <p className={styles.description}>{description}</p>
      </header>

      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>
          <Icon size={40} weight="duotone" />
        </span>
        <h2 className={styles.emptyTitle}>Módulo em construção</h2>
        <p className={styles.emptyText}>
          Esta área está sendo desenvolvida. Use o assistente Suape AI no canto da
          tela para tirar dúvidas enquanto isso.
        </p>
      </div>
    </div>
  );
}
