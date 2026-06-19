"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, UploadSimple, Check } from "@phosphor-icons/react";
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
  const { messages, isStreaming, steps, send } = useChat();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasConversation = messages.some((m) => m.role === "user");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files.map(describeAttachment)]);
  }, []);

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

    send(text, attachments);
    setInput("");
    setAttachments([]);
  };

  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      setIsDragging(true);
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setIsDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setIsDragging(false);
      if (e.dataTransfer?.files?.length) addFiles(Array.from(e.dataTransfer.files));
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [addFiles]);

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
    <div className={styles.container}>
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
              {messages.map((message) => {
                // O placeholder vazio da IA (text: "" durante o streaming) não é
                // renderizado aqui: o indicador de processamento (showTyping) já
                // exibe o avatar + card de etapas. Renderizá-lo duplicaria o avatar.
                if (message.role === "ai" && !message.text && !message.attachments?.length) {
                  return null;
                }
                return (
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
                );
              })}
              {showTyping && (
                <div className={`${styles.message} ${styles.ai}`}>
                  <div className={styles.aiAvatar}>
                    <img src={AGENT_MARK} alt="" className={styles.markImg} />
                  </div>
                  {steps.length > 0 ? (
                    <div className={styles.stepsCard}>
                      <span className={styles.stepsTitle}>Processando o documento</span>
                      {steps.map((label, index) => {
                        const isActive = index === steps.length - 1;
                        const isLast = index === steps.length - 1;
                        return (
                          <div key={label} className={styles.step}>
                            <div className={styles.stepMarker}>
                              <span
                                className={`${styles.stepDot} ${
                                  isActive ? styles.stepDotActive : styles.stepDotDone
                                }`}
                                aria-hidden
                              >
                                {!isActive && <Check size={11} weight="bold" />}
                              </span>
                              {!isLast && <span className={styles.stepLine} />}
                            </div>
                            <span
                              className={`${styles.stepLabel} ${
                                isActive ? styles.stepLabelActive : ""
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`${styles.bubble} ${styles.typing}`}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </div>
                  )}
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
