"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  WarningCircle,
  Clock,
  Info,
  X,
  EnvelopeSimple,
  DeviceMobile,
  CircleNotch,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import {
  fetchNotifications,
  markNotificationAsRead,
  getResourceHref,
  type Notification,
} from "@/features/notifications/api";
import { useNotificationsStore } from "@/features/notifications/stores/notifications-store";
import styles from "./notifications-modal.module.css";

const CLOSE_ANIMATION_MS = 520;

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH} h`;
  if (diffD < 7) return `há ${diffD} ${diffD === 1 ? "dia" : "dias"}`;
  return date.toLocaleDateString("pt-BR");
}

function getNotificationStyle(notification: Notification) {
  const text = `${notification.subject} ${notification.body}`.toLowerCase();
  if (text.includes("vencim") || text.includes("expira")) {
    return { icon: Clock, color: "#fd7e14", bg: "rgba(253, 126, 20, 0.1)" };
  }
  if (text.includes("aprovad")) {
    return { icon: CheckCircle, color: "#40c057", bg: "rgba(64, 192, 87, 0.1)" };
  }
  if (text.includes("pendente") || text.includes("atrasad") || text.includes("vencid")) {
    return { icon: WarningCircle, color: "#fa5252", bg: "rgba(250, 82, 82, 0.1)" };
  }
  if (text.includes("exigência") || text.includes("exigencia")) {
    return { icon: Info, color: "#0e6fc4", bg: "rgba(14, 111, 196, 0.1)" };
  }
  return { icon: Info, color: "#868e96", bg: "rgba(134, 142, 150, 0.1)" };
}

export function NotificationsModal() {
  const router = useRouter();
  const { isOpen, closeModal, sourceRect, consumeOpenOnMount } = useNotificationsStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    loadNotifications();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (hasAutoOpenedRef.current) return;
    if (consumeOpenOnMount()) {
      hasAutoOpenedRef.current = true;
      setTimeout(() => {
        const bellBtn = document.getElementById("notifications-bell-btn");
        const rect = bellBtn?.getBoundingClientRect() || null;
        useNotificationsStore.getState().openModal(rect || undefined);
      }, 350);
    }
  }, [consumeOpenOnMount]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
      setError("Não foi possível carregar as notificações.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeModal();
      setClosing(false);
    }, CLOSE_ANIMATION_MS);
  };

  const handleMarkAsRead = async (
    e: React.MouseEvent | null,
    notificationId: string
  ) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (markingId) return;

    setMarkingId(notificationId);
    // Otimisticamente marca como lida
    setNotifications((prev) =>
      prev.map((n) =>
        n.identifier === notificationId ? { ...n, read: true } : n
      )
    );
    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Erro ao marcar como lida:", err);
      // Reverte em caso de erro
      setNotifications((prev) =>
        prev.map((n) =>
          n.identifier === notificationId ? { ...n, read: false } : n
        )
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleNotificationNavigate = (notification: Notification) => {
    const href = getResourceHref(notification.resource);
    if (!href) return;
    handleClose();
    setTimeout(() => router.push(href), CLOSE_ANIMATION_MS - 100);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = showRead
    ? notifications
    : notifications.filter((n) => !n.read);

  if (!isOpen) return null;

  const targetRect = sourceRect;
  const targetCx = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth - 40;
  const targetCy = targetRect ? targetRect.top + targetRect.height / 2 : 32;

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Notificações"
    >
      <div
        className={`${styles.modal} ${closing ? styles.modalClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={
          closing && targetRect
            ? ({
                "--target-cx": `${targetCx}px`,
                "--target-cy": `${targetCy}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Bell size={22} weight="duotone" />
            </div>
            <div>
              <h2 className={styles.title}>Notificações</h2>
              <p className={styles.subtitle}>
                {unreadCount > 0
                  ? `${unreadCount} ${unreadCount === 1 ? "não lida" : "não lidas"}`
                  : "Tudo em dia"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Fechar notificações"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <div className={styles.filterBar}>
          <button
            type="button"
            className={`${styles.filterBtn} ${!showRead ? styles.filterBtnActive : ""}`}
            onClick={() => setShowRead(false)}
          >
            Não lidas
            {unreadCount > 0 && (
              <span className={styles.filterCount}>{unreadCount}</span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${showRead ? styles.filterBtnActive : ""}`}
            onClick={() => setShowRead(true)}
          >
            <Eye size={14} />
            Mostrar lidas
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>
              <CircleNotch size={28} className={styles.spinning} />
              <p>Carregando notificações...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <WarningCircle size={32} weight="duotone" />
              <p>{error}</p>
              <button type="button" className="btn btn-secondary" onClick={loadNotifications}>
                Tentar novamente
              </button>
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className={styles.empty}>
              <Bell size={48} weight="duotone" />
              <h3>
                {showRead ? "Nenhuma notificação" : "Tudo em dia!"}
              </h3>
              <p>
                {showRead
                  ? "Quando houver novidades, elas aparecerão aqui."
                  : "Você não tem notificações não lidas."}
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {visibleNotifications.map((notification) => {
                const { icon: Icon, color, bg } = getNotificationStyle(notification);
                const href = getResourceHref(notification.resource);
                const isMarking = markingId === notification.identifier;

                return (
                  <li
                    key={notification.identifier}
                    className={`${styles.item} ${!notification.read ? styles.unread : styles.read}`}
                  >
                    <div className={styles.itemMain}>
                      <span
                        className={styles.itemIcon}
                        style={{ background: bg, color }}
                      >
                        <Icon size={20} weight="fill" />
                      </span>
                      <div className={styles.itemBody}>
                        <div className={styles.itemHeader}>
                          <span className={styles.itemTitle}>{notification.subject}</span>
                          {notification.channel === "email" ? (
                            <EnvelopeSimple size={12} weight="bold" className={styles.channelIcon} />
                          ) : (
                            <DeviceMobile size={12} weight="bold" className={styles.channelIcon} />
                          )}
                        </div>
                        <p className={styles.itemDesc}>{notification.body}</p>
                        <span className={styles.itemTime}>
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                      {!notification.read && <span className={styles.unreadDot} />}
                    </div>

                    <div className={styles.itemActions}>
                      {!notification.read ? (
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={(e) => handleMarkAsRead(e, notification.identifier)}
                          disabled={isMarking}
                          aria-label="Marcar como lida"
                        >
                          {isMarking ? (
                            <CircleNotch size={14} className={styles.spinning} />
                          ) : (
                            <CheckCircle size={14} weight="bold" />
                          )}
                          {isMarking ? "Salvando" : "Marcar como lida"}
                        </button>
                      ) : (
                        <span className={styles.readLabel}>
                          <EyeSlash size={14} />
                          Lida
                        </span>
                      )}

                      {href && (
                        <button
                          type="button"
                          className={styles.actionBtnPrimary}
                          onClick={() => handleNotificationNavigate(notification)}
                        >
                          Abrir
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.footerBtn}
            onClick={handleClose}
          >
            Fechar
          </button>
          <Link
            href="/notificacoes"
            className={`btn btn-primary ${styles.viewAll}`}
            onClick={(e) => {
              e.preventDefault();
              handleClose();
              setTimeout(() => router.push("/notificacoes"), CLOSE_ANIMATION_MS - 100);
            }}
          >
            Ver todas
          </Link>
        </footer>
      </div>
    </div>
  );
}