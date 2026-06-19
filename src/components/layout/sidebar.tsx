"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { useSessionStore } from "@/features/auth";
import { landingPathFor } from "@/lib/routes";
import { NAV_ITEMS, NAV_FOOTER_ITEMS, isActiveRoute } from "./nav-config";
import styles from "./sidebar.module.css";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onNavigate: () => void;
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = useSessionStore((state) => state.user?.is_admin ?? false);

  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const renderItem = (item: (typeof NAV_ITEMS)[number]) => {
    const Icon = item.icon;
    const active = isActiveRoute(item.href, pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${styles.item} ${active ? styles.active : ""}`}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
      >
        <span className={styles.itemIcon}>
          <Icon size={22} weight={active ? "fill" : "regular"} />
        </span>
        <span className={styles.itemLabel}>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${
        mobileOpen ? styles.open : ""
      }`}
    >
      <div className={styles.brand}>
        <Link href={landingPathFor(isAdmin)} className={styles.logo} onClick={onNavigate}>
          <img src="/images/logo-suape.png" alt="Suape" className={styles.logoFull} />
          <img src="/images/logo-suape-mark.png" alt="Suape" className={styles.logoMark} />
        </Link>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <CaretLeft size={16} weight="bold" />
        </button>
      </div>

      <nav className={styles.nav}>{navItems.map(renderItem)}</nav>

      <div className={styles.footer}>{NAV_FOOTER_ITEMS.map(renderItem)}</div>
    </aside>
  );
}
