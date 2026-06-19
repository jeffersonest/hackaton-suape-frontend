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
const ATTACHMENT_ONLY_PROMPT = "Analise e cadastre o(s) documento(s) anexado(s).";

let abortController: AbortController | null = null;

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  send: (text: string, attachments?: PendingAttachment[]) => Promise<void>;
  stop: () => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [WELCOME],
      conversationId: null,
      isStreaming: false,

      send: async (text, attachments) => {
        const pending = attachments ?? [];
        const files = pending.map((attachment) => attachment.file);
        const displayAttachments = pending.map(({ file: _file, ...rest }) => rest);

        const outgoing = text.trim() || (files.length ? ATTACHMENT_ONLY_PROMPT : text);
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
            signal: abortController.signal,
            onConversation: (conversationId) => set({ conversationId }),
            onChunk: (fullText) => patchAi({ text: fullText }),
            onError: () => patchAi({ text: ERROR_TEXT }),
          });
        } catch {
          patchAi({ text: ERROR_TEXT });
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
      skipHydration: true,
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
