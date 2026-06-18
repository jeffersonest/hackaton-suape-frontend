"use client";

import { ChatContainer } from "@/features/chat";
import styles from "./home.module.css";

// A proteção/redirecionamento desta rota é feita pela RouteGuard no layout
// do grupo (auth); aqui basta renderizar o conteúdo.
export default function HomePage() {
  return (
    <div className={styles.container}>
      <ChatContainer />
    </div>
  );
}
