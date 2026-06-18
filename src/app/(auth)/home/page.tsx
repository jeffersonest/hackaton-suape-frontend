"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatContainer } from "@/features/chat";
import { useSessionStore } from "@/features/auth";
import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();
  const accessToken = useSessionStore((state) => state.accessToken);
  const hydrated = useSessionStore((state) => state.user !== null || state.accessToken !== null);

  useEffect(() => {
    // Para desenvolvimento, permitimos acesso sem autenticação
    // Em produção, descomentar:
    // if (!hydrated) return;
    // if (!accessToken) router.replace("/entrar");
  }, [hydrated, accessToken, router]);

  return (
    <div className={styles.container}>
      <ChatContainer />
    </div>
  );
}
