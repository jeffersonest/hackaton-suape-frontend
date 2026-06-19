"use client";

import { useEffect } from "react";
import { useChatStore } from "../stores/chat-store";

export function useChat() {
  useEffect(() => {
    void useChatStore.persist.rehydrate();
  }, []);

  return useChatStore();
}
