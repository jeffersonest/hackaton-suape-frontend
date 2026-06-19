"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage, PendingAttachment } from "../types";
import { streamChat } from "../api/chat-api";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ai",
  text: "Olá! Sou o Almirante, assistente digital do Porto de Suape. Como posso ajudá-lo hoje? Posso auxiliar com consultas sobre licenças, exigências, prazos e documentos das operações portuárias.",
  timestamp: new Date(),
};

const ERROR_TEXT =
  "Desculpe, houve um erro ao processar sua mensagem. Tente novamente.";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  const send = useCallback(async (text: string, attachments?: PendingAttachment[]) => {
    const pending = attachments ?? [];
    const files = pending.map((attachment) => attachment.file);
    // Só os metadados (sem o File) acompanham a mensagem exibida.
    const displayAttachments = pending.map(({ file: _file, ...rest }) => rest);

    // O backend exige texto (min_length=1); se vier só anexo, usa um pedido padrão.
    const outgoing =
      text.trim() || (files.length ? "Analise e cadastre o(s) documento(s) anexado(s)." : text);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: outgoing,
      timestamp: new Date(),
      attachments: displayAttachments.length ? displayAttachments : undefined,
    };

    const aiMessageId = `ai-${Date.now()}`;
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: "ai",
      text: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const updateAi = (patch: Partial<ChatMessage>) =>
      setMessages((prev) =>
        prev.map((msg) => (msg.id === aiMessageId ? { ...msg, ...patch } : msg)),
      );

    try {
      await streamChat({
        message: outgoing,
        files,
        conversationId: conversationIdRef.current,
        signal: controller.signal,
        onConversation: (conversationId) => {
          conversationIdRef.current = conversationId;
        },
        onChunk: (fullText) => updateAi({ text: fullText }),
        onError: () => updateAi({ text: ERROR_TEXT }),
      });
    } catch {
      // streamChat já chamou onError; nada além de encerrar o estado.
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const clear = useCallback(() => {
    conversationIdRef.current = null;
    setMessages([WELCOME]);
  }, []);

  return {
    messages,
    isStreaming,
    send,
    stop,
    clear,
  };
}
