"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellRinging,
  CheckCircle,
  WarningCircle,
  Clock,
  type Icon,
} from "@phosphor-icons/react";
import styles from "./notifications.module.css";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  /** Licença que gerou a notificação (destino ao clicar). */
  href: string;
  read: boolean;
  icon: Icon;
  color: string;
}

// Mock — futuramente virá da API e cada item levará à licença correspondente.
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Licença aprovada",
    description: "A LO-2024-0142 (Terminal de Granéis) foi aprovada.",
    time: "há 5 min",
    href: "/licencas",
    read: false,
    icon: CheckCircle,
    color: "#40c057",
  },
  {
    id: "2",
    title: "Documento pendente",
    description: "Envie o estudo ambiental para a LP-2024-0098.",
    time: "há 2 h",
    href: "/licencas",
    read: false,
    icon: WarningCircle,
    color: "#fd7e14",
  },
  {
    id: "3",
    title: "Licença próxima do vencimento",
    description: "A LI-2023-0457 vence em 7 dias.",
    time: "Ontem",
    href: "/licencas",
    read: false,
    icon: Clock,
    color: "#fa5252",
  },
  {
    id: "4",
    title: "Nova exigência técnica",
    description: "Há uma exigência na LO-2024-0203 aguardando resposta.",
    time: "2 dias",
    href: "/licencas",
    read: true,
    icon: WarningCircle,
    color: "#0e6fc4",
  },
];

export function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const items = MOCK_NOTIFICATIONS;
  const unreadCount = items.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.bellBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificações"
        aria-expanded={open}
      >
        <span className={`${styles.bellIcon} ${hasUnread ? styles.ringing : ""}`}>
          {hasUnread ? (
            <BellRinging size={20} weight="regular" />
          ) : (
            <Bell size={20} weight="regular" />
          )}
        </span>
        {hasUnread && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.header}>
            <span>Notificações</span>
            {hasUnread && <span className={styles.headerCount}>{unreadCount} novas</span>}
          </div>

          <div className={styles.list}>
            {items.map((n) => {
              const ItemIcon = n.icon;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  className={`${styles.item} ${!n.read ? styles.unreadItem : ""}`}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                >
                  <span
                    className={styles.itemIcon}
                    style={{ background: `${n.color}1a`, color: n.color }}
                  >
                    <ItemIcon size={20} weight="fill" />
                  </span>
                  <span className={styles.itemBody}>
                    <span className={styles.itemTitle}>{n.title}</span>
                    <span className={styles.itemDesc}>{n.description}</span>
                    <span className={styles.itemTime}>{n.time}</span>
                  </span>
                  {!n.read && <span className={styles.unreadDot} />}
                </Link>
              );
            })}
          </div>

          <Link
            href="/licencas"
            className={styles.footer}
            onClick={() => setOpen(false)}
          >
            Ver todas as notificações
          </Link>
        </div>
      )}
    </div>
  );
}
