"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRight, House } from "@phosphor-icons/react";
import { useSessionStore } from "@/features/auth";
import { getBreadcrumb } from "./nav-config";
import styles from "./breadcrumb.module.css";

export function Breadcrumb() {
  const pathname = usePathname();
  const isAdmin = useSessionStore((state) => state.user?.is_admin ?? false);
  const crumbs = getBreadcrumb(pathname, isAdmin);

  return (
    <nav className={styles.breadcrumb} aria-label="Trilha de navegação">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className={styles.crumbWrapper}>
            {index === 0 ? (
              <Link href={crumb.href} className={styles.crumb} aria-label="Início">
                <House size={16} weight="fill" />
                <span className={styles.crumbText}>{crumb.label}</span>
              </Link>
            ) : isLast ? (
              <span className={`${styles.crumb} ${styles.current}`} aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className={styles.crumb}>
                {crumb.label}
              </Link>
            )}
            {!isLast && <CaretRight size={13} weight="bold" className={styles.sep} />}
          </span>
        );
      })}
    </nav>
  );
}
