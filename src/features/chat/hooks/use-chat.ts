"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatAttachment, ChatMessage } from "../types";
import { streamChat } from "../api/chat-api";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Olá! Sou o Almirante, assistente digital do Porto de Suape. Como posso ajudá-lo hoje? Posso auxiliar com consultas sobre licenças, processos, documentos e outras informações relacionadas às operações portuárias.",
      timestamp: new Date(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const send = useCallback(async (text: string, attachments?: ChatAttachment[]) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
      attachments: attachments?.length ? attachments : undefined,
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

    abortControllerRef.current = new AbortController();

    const apiMessage = attachments?.length
      ? `${text}\n\n[Anexos: ${attachments.map((a) => a.name).join(", ")}]`
      : text;

    try {
      await streamChat({
        message: apiMessage,
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: chunk } : msg
            )
          );
        },
        onComplete: () => {
          setIsStreaming(false);
        },
        onError: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, text: "Desculpe, houve um erro ao processar sua mensagem. Tente novamente." }
                : msg
            )
          );
          setIsStreaming(false);
        },
      });
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: "Desculpe, houve um erro ao processar sua mensagem. Tente novamente." }
            : msg
        )
      );
      setIsStreaming(false);
    }
  }, []);

  const clear = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "ai",
        text: "Olá! Sou o Almirante, assistente digital do Porto de Suape. Como posso ajudá-lo hoje?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isStreaming,
    send,
    clear,
  };
}
