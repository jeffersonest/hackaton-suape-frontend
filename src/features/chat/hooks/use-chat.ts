"use client";

import { useEffect } from "react";
import { useChatStore } from "../stores/chat-store";

/**
 * Acesso ao chat compartilhado e persistido (ver chat-store). Mantém o mesmo
 * contrato de antes ({ messages, isStreaming, send, stop, clear }), agora ligado
 * a um store único usado por todas as superfícies (página inicial e bolinha).
 *
 * A hidratação do localStorage é disparada no mount (skipHydration no store),
 * para o primeiro render no cliente bater com o do servidor e só então carregar
 * o histórico salvo.
 */
export function useChat() {
  useEffect(() => {
    void useChatStore.persist.rehydrate();
  }, []);

  return useChatStore();
}
