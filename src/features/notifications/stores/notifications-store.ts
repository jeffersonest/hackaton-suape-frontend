import { create } from 'zustand';

interface NotificationsState {
  isOpen: boolean;
  openAt: number | null;
  // Posição do sininho (para animar minimizando até ele)
  sourceRect: DOMRect | null;
  // Controle interno: se devemos mostrar automaticamente após login
  openOnNextMount: boolean;

  openModal: (sourceRect?: DOMRect) => void;
  closeModal: () => void;
  setSourceRect: (rect: DOMRect | null) => void;
  setOpenOnMount: (value: boolean) => void;
  consumeOpenOnMount: () => boolean;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  isOpen: false,
  openAt: null,
  sourceRect: null,
  openOnNextMount: false,

  openModal: (sourceRect) => {
    set({
      isOpen: true,
      openAt: Date.now(),
      sourceRect: sourceRect || get().sourceRect,
    });
  },

  closeModal: () => {
    set({
      isOpen: false,
      // mantém sourceRect para a animação de saída usar
    });
  },

  setSourceRect: (rect) => set({ sourceRect: rect }),

  setOpenOnMount: (value) => set({ openOnNextMount: value }),

  consumeOpenOnMount: () => {
    const { openOnNextMount } = get();
    if (openOnNextMount) {
      set({ openOnNextMount: false });
      return true;
    }
    return false;
  },
}));