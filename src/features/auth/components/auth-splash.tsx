"use client";

import { Spinner } from "@phosphor-icons/react";
import styles from "./auth-splash.module.css";

/** Tela cheia de carregamento usada enquanto a sessão é verificada. */
export function AuthSplash() {
  return (
    <div className={styles.splash} role="status" aria-live="polite">
      <img src="/images/logo-suape-mark.png" alt="Suape" className={styles.logo} />
      <Spinner size={28} weight="bold" className={styles.spinner} />
      <span className={styles.srOnly}>Carregando…</span>
    </div>
  );
}
