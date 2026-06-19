"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellRinging } from "@phosphor-icons/react";
import { fetchNotifications } from "@/features/notifications/api";
import { useNotificationsStore } from "@/features/notifications/stores/notifications-store";
import styles from "./notifications.module.css";

const POLL_INTERVAL_MS = 60_000;

export function Notifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openModal = useNotificationsStore((s) => s.openModal);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadUnreadCount = async () => {
      try {
        const data = await fetchNotifications(50, 0);
        if (!mounted) return;
        setUnreadCount(data.filter((n) => !n.read).length);
      } catch (err) {
        console.error("Erro ao carregar contagem de notificações:", err);
      }
    };

    loadUnreadCount();
    intervalId = setInterval(loadUnreadCount, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      openModal(rect);
    } else {
      openModal();
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <button
      ref={buttonRef}
      id="notifications-bell-btn"
      type="button"
      className={styles.bellBtn}
      onClick={handleClick}
      aria-label={`Notificações${hasUnread ? ` (${unreadCount} não lidas)` : ""}`}
    >
      <span className={`${styles.bellIcon} ${hasUnread ? styles.ringing : ""}`}>
        {hasUnread ? (
          <BellRinging size={20} weight="regular" />
        ) : (
          <Bell size={20} weight="regular" />
        )}
      </span>
      {hasUnread && (
        <span className={styles.badge}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}