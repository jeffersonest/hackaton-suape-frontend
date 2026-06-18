"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { List, CaretDown, SignOut, UserCircle } from "@phosphor-icons/react";
import { useSessionStore, authApi } from "@/features/auth";
import { Breadcrumb } from "./breadcrumb";
import { Notifications } from "./notifications";
import styles from "./topbar.module.css";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const clearSession = useSessionStore((state) => state.clearSession);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayEmail = user?.email ?? "";
  const displayName = displayEmail ? displayEmail.split("@")[0] : "Usuário Suape";
  const initials =
    displayName
      .split(/[.\-_\s]+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await authApi.logout();
    } catch {
      // Mesmo se a chamada falhar, limpamos o estado local por segurança.
    } finally {
      clearSession();
      router.replace("/entrar");
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          aria-label="Alternar menu"
        >
          <List size={22} weight="bold" />
        </button>
        <Breadcrumb />
      </div>

      <div className={styles.right}>
        <Notifications />

        <div className={styles.userMenu} ref={menuRef}>
          <button
            type="button"
            className={styles.userBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.avatar}>{initials}</span>
            <span className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              {displayEmail && <span className={styles.userEmail}>{displayEmail}</span>}
            </span>
            <CaretDown
              size={14}
              weight="bold"
              className={`${styles.caret} ${menuOpen ? styles.caretOpen : ""}`}
            />
          </button>

          {menuOpen && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <UserCircle size={32} weight="duotone" />
                <div>
                  <p className={styles.dropdownName}>{displayName}</p>
                  {displayEmail && <p className={styles.dropdownEmail}>{displayEmail}</p>}
                </div>
              </div>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={handleLogout}
                role="menuitem"
              >
                <SignOut size={18} weight="bold" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
