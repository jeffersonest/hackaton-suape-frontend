"use client";

import { useEffect, useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react";
import { useChatStore } from "../stores/chat-store";
import { ChatContainer } from "./chat-container";
import styles from "./chat-launcher.module.css";

export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const isStreaming = useChatStore((state) => state.isStreaming);

  // Fecha com ESC e bloqueia o scroll do fundo enquanto o modal está aberto
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {isStreaming && !open && <span className={styles.fabLabel}>Processando…</span>}
      <button
        type="button"
        className={`${styles.fab} ${open ? styles.fabHidden : ""} ${
          isStreaming ? styles.fabBusy : ""
        }`}
        onClick={() => setOpen(true)}
        aria-label={isStreaming ? "Assistente processando — abrir" : "Abrir o assistente Almirante"}
      >
        <ChatCircleDots size={28} weight="fill" />
        <span className={styles.fabPulse} />
      </button>

      {open && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Assistente Almirante"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className={styles.modal}>
            <ChatContainer onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
