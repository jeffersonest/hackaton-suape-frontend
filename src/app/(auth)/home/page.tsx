"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/features/auth";
import { ChatContainer } from "@/features/chat";
import { landingPathFor } from "@/lib/routes";
import styles from "./home.module.css";

// A autenticação é garantida pela RouteGuard no layout do grupo (auth).
// Aqui aplicamos a regra de papel: a home (com o chat) é exclusiva de admins;
// usuários comuns são levados para Licenças.
export default function HomePage() {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);

  useEffect(() => {
    if (user && !user.is_admin) router.replace(landingPathFor(false));
  }, [user, router]);

  if (user && !user.is_admin) return null;

  return (
    <div className={styles.container}>
      <ChatContainer />
    </div>
  );
}
