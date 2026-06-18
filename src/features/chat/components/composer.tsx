"use client";

import { useEffect, useRef } from "react";
import { Paperclip, PaperPlaneRight, CircleNotch } from "@phosphor-icons/react";
import type { PendingAttachment } from "../types";
import { AttachmentChip } from "./attachment-chip";
import styles from "./composer.module.css";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  attachments: PendingAttachment[];
  onRemoveAttachment: (id: string) => void;
  onFilesPicked: (files: File[]) => void;
  onSubmit: () => void;
  isStreaming?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  /** "lg" deixa a caixa mais alta (usado na tela inicial). */
  size?: "md" | "lg";
}

const MAX_TEXTAREA_HEIGHT = { md: 200, lg: 320 };

export function Composer({
  value,
  onChange,
  attachments,
  onRemoveAttachment,
  onFilesPicked,
  onSubmit,
  isStreaming = false,
  autoFocus = false,
  placeholder = "Digite sua mensagem...",
  size = "md",
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = !isStreaming && (value.trim().length > 0 || attachments.length > 0);

  // Auto-grow do textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT[size])}px`;
  }, [value, size]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFilesPicked(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div className={`${styles.composer} ${size === "lg" ? styles.lg : ""}`}>
      {attachments.length > 0 && (
        <div className={styles.attachments}>
          {attachments.map((att) => (
            <AttachmentChip key={att.id} attachment={att} onRemove={onRemoveAttachment} />
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFileChange}
        accept="image/*,.pdf,.csv,.xls,.xlsx,.doc,.docx,.txt"
      />

      <textarea
        ref={textareaRef}
        className={styles.textarea}
        placeholder={placeholder}
        value={value}
        rows={1}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
      />

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.attachButton}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Anexar arquivo"
          disabled={isStreaming}
        >
          <Paperclip size={20} weight="bold" />
        </button>

        <span className={styles.hint}>
          <kbd>Enter</kbd> para enviar · arraste arquivos para anexar
        </span>

        <button
          type="button"
          className={styles.sendButton}
          onClick={() => canSend && onSubmit()}
          disabled={!canSend}
          aria-label="Enviar mensagem"
        >
          {isStreaming ? (
            <CircleNotch size={20} className={styles.spinner} />
          ) : (
            <PaperPlaneRight size={20} weight="fill" />
          )}
        </button>
      </div>
    </div>
  );
}
