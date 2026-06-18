"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChatLauncher } from "@/features/chat";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import styles from "./dashboard-shell.module.css";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === "/home" || pathname === "/";

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => !c);
    }
  };

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ""}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNavigate={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={styles.main}>
        <Topbar onToggleSidebar={handleToggleSidebar} />
        <main className={styles.content}>{children}</main>
      </div>

      {/* Telas internas exibem a bolinha flutuante do chat; a home já tem o chat centralizado */}
      {!isHome && <ChatLauncher />}
    </div>
  );
}
