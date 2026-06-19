"use client";

import { useEffect, useRef, useState } from "react";
import { X, UploadSimple } from "@phosphor-icons/react";
import { useChat } from "@/features/chat/hooks";
import type { PendingAttachment } from "../types";
import { describeAttachment } from "../lib/attachments";
import { Composer } from "./composer";
import { AttachmentChip } from "./attachment-chip";
import { AgentName } from "./agent-name";
import { Markdown } from "./markdown";
import styles from "./chat-container.module.css";

const AGENT_MARK = "/images/logo-suape-mark.png";

const SUGGESTIONS = [
  "Como consultar o status de uma licença?",
  "Quais documentos preciso para abrir um processo?",
  "Prazos de renovação de licenças ambientais",
];

interface ChatContainerProps {
  /** Quando fornecido, exibe um cabeçalho com botão de fechar (uso no modal). */
  onClose?: () => void;
}

export function ChatContainer({ onClose }: ChatContainerProps) {
  const { messages, isStreaming, send } = useChat();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasConversation = messages.some((m) => m.role === "user");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files.map(describeAttachment)]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmit = () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || isStreaming) return;

    // Envia os anexos COM o File (upload multipart); o hook separa o que exibir.
    send(text, attachments);
    setInput("");
    setAttachments([]);
  };

  // ---- Drag & drop ----
  const handleDragEnter = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(Array.from(e.dataTransfer.files));
  };

  const composer = (
    <Composer
      value={input}
      onChange={setInput}
      attachments={attachments}
      onRemoveAttachment={removeAttachment}
      onFilesPicked={addFiles}
      onSubmit={handleSubmit}
      isStreaming={isStreaming}
      autoFocus
      placeholder="Pergunte ou anexe um documento..."
      size={hasConversation ? "md" : "lg"}
    />
  );

  const lastAiMessage = messages.filter((m) => m.role === "ai").at(-1);
  const showTyping = isStreaming && lastAiMessage?.text === "";

  return (
    <div
      className={styles.container}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {onClose && (
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.avatar}>
              <img src={AGENT_MARK} alt="" className={styles.markImg} />
            </div>
            <div className={styles.headerInfo}>
              <h1>
                <AgentName />
              </h1>
              <p>{isStreaming ? "Digitando..." : "Online"}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar assistente"
          >
            <X size={20} weight="bold" />
          </button>
        </header>
      )}

      {!hasConversation ? (
        /* ---------- Estado inicial (estilo GPT/Claude) ---------- */
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroBrand}>
              <img src={AGENT_MARK} alt="" className={styles.markImg} />
            </div>
            <h2 className={styles.heroTitle}>Como posso ajudar?</h2>
            <p className={styles.heroSubtitle}>
              Tire dúvidas sobre licenças, processos e documentos do Porto de Suape.
            </p>

            <div className={styles.heroComposer}>{composer}</div>

            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.suggestion}
                  onClick={() => setInput(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ---------- Conversa ---------- */
        <>
          <div className={styles.messages}>
            <div className={styles.messagesInner}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  {message.role === "ai" && (
                    <div className={styles.aiAvatar}>
                      <img src={AGENT_MARK} alt="" className={styles.markImg} />
                    </div>
                  )}
                  <div className={styles.bubbleGroup}>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className={styles.messageAttachments}>
                        {message.attachments.map((att) => (
                          <AttachmentChip key={att.id} attachment={att} />
                        ))}
                      </div>
                    )}
                    {message.text && (
                      <div className={styles.bubble}>
                        {message.role === "ai" ? (
                          <Markdown>{message.text}</Markdown>
                        ) : (
                          <p className={styles.userText}>{message.text}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {showTyping && (
                <div className={`${styles.message} ${styles.ai}`}>
                  <div className={styles.aiAvatar}>
                    <img src={AGENT_MARK} alt="" className={styles.markImg} />
                  </div>
                  <div className={`${styles.bubble} ${styles.typing}`}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className={styles.composerDock}>
            <div className={styles.composerDockInner}>{composer}</div>
          </div>
        </>
      )}

      {isDragging && (
        <div className={styles.dropOverlay}>
          <div className={styles.dropCard}>
            <UploadSimple size={40} weight="bold" />
            <p>Solte os arquivos para anexar</p>
          </div>
        </div>
      )}
    </div>
  );
}
