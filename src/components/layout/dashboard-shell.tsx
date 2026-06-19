"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChatLauncher } from "@/features/chat";
import { NotificationsModal } from "@/features/notifications";
import { useSessionStore } from "@/features/auth";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import styles from "./dashboard-shell.module.css";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = useSessionStore((state) => state.user?.is_admin ?? false);
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

      {/* O chat é exclusivo de admins; nas telas internas aparece como bolinha flutuante */}
      {!isHome && isAdmin && <ChatLauncher />}

      <NotificationsModal />
    </div>
  );
}
