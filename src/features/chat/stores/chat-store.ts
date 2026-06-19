import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatMessage, PendingAttachment } from "../types";
import { streamChat } from "../api/chat-api";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ai",
  text: "Olá! Sou o Almirante, assistente digital do Porto de Suape. Como posso ajudá-lo hoje? Posso auxiliar com consultas sobre licenças, exigências, prazos e documentos das operações portuárias.",
  timestamp: new Date(),
};

const ERROR_TEXT = "Desculpe, houve um erro ao processar sua mensagem. Tente novamente.";

// Fora do estado/persistência: o AbortController não é serializável e é efêmero.
let abortController: AbortController | null = null;

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  send: (text: string, attachments?: PendingAttachment[]) => Promise<void>;
  stop: () => void;
  clear: () => void;
}

/**
 * Estado do chat compartilhado entre as superfícies (página inicial e a bolinha)
 * e persistido em localStorage. Assim as mensagens não se perdem ao trocar de
 * tela nem ao recarregar, e o conversation_id mantém a mesma conversa no backend.
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [WELCOME],
      conversationId: null,
      isStreaming: false,

      send: async (text, attachments) => {
        const pending = attachments ?? [];
        const files = pending.map((attachment) => attachment.file);
        // Mantém o previewUrl (blob) para o preview ao vivo; ele é removido só na
        // persistência (partialize), pois o blob URL não sobrevive ao reload.
        const displayAttachments = pending.map(({ file: _file, ...rest }) => rest);

        // O backend exige texto (min_length=1); se vier só anexo, usa um pedido padrão.
        const outgoing =
          text.trim() ||
          (files.length ? "Analise e cadastre o(s) documento(s) anexado(s)." : text);
        if (!outgoing) return;

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

        set((state) => ({
          messages: [...state.messages, userMessage, aiMessage],
          isStreaming: true,
        }));

        const patchAi = (patch: Partial<ChatMessage>) =>
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === aiMessageId ? { ...msg, ...patch } : msg,
            ),
          }));

        abortController = new AbortController();

        try {
          await streamChat({
            message: outgoing,
            files,
            conversationId: get().conversationId,
            signal: abortController.signal,
            onConversation: (conversationId) => set({ conversationId }),
            onChunk: (fullText) => patchAi({ text: fullText }),
            onError: () => patchAi({ text: ERROR_TEXT }),
          });
        } catch {
          // streamChat já chamou onError; nada além de encerrar o estado.
        } finally {
          set({ isStreaming: false });
          abortController = null;
        }
      },

      stop: () => {
        abortController?.abort();
        abortController = null;
        set({ isStreaming: false });
      },

      clear: () => {
        abortController?.abort();
        abortController = null;
        set({ messages: [WELCOME], conversationId: null, isStreaming: false });
      },
    }),
    {
      name: "suape-chat",
      storage: createJSONStorage(() => localStorage),
      // Hidrata manualmente no cliente (evita mismatch de hidratação no SSR).
      skipHydration: true,
      // Persiste só o necessário; isStreaming nunca (não pode ficar travado em
      // true) e previewUrl (blob) é descartado, pois não sobrevive ao reload.
      partialize: (state) => ({
        conversationId: state.conversationId,
        messages: state.messages.map((message) =>
          message.attachments
            ? {
                ...message,
                attachments: message.attachments.map(
                  ({ previewUrl: _previewUrl, ...rest }) => rest,
                ),
              }
            : message,
        ),
      }),
    },
  ),
);
