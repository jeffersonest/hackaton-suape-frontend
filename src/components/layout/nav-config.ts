"use client";

import {
  House,
  FileText,
  Handshake,
  ChartBar,
  UsersThree,
  Gear,
  type Icon,
} from "@phosphor-icons/react";
import { landingPathFor } from "@/lib/routes";

export interface NavItem {
  label: string;
  href: string;
  icon: Icon;
  /** Item visível apenas para usuários administradores (is_admin). */
  adminOnly?: boolean;
}

/** Itens principais do menu lateral. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/home", icon: House, adminOnly: true },
  { label: "Licenças", href: "/licencas", icon: FileText },
  { label: "Compromissos", href: "/compromissos", icon: Handshake },
  { label: "Relatórios", href: "/relatorios", icon: ChartBar },
  { label: "Gerenciar Usuários", href: "/usuarios", icon: UsersThree, adminOnly: true },
];

/** Itens fixados na base do menu lateral. */
export const NAV_FOOTER_ITEMS: NavItem[] = [
  { label: "Configurações", href: "/configuracoes", icon: Gear },
];

const ALL_ITEMS = [...NAV_ITEMS, ...NAV_FOOTER_ITEMS];

export interface Crumb {
  label: string;
  href: string;
}

/**
 * Monta a trilha de navegação a partir do pathname atual.
 *
 * A base depende do papel: admins partem de "Início" (/home); usuários comuns
 * não têm a home, então partem de "Licenças" (seu ponto de entrada).
 */
export function getBreadcrumb(pathname: string, isAdmin = true): Crumb[] {
  const baseHref = landingPathFor(isAdmin);
  const baseLabel = isAdmin ? "Início" : "Licenças";
  const base: Crumb = { label: baseLabel, href: baseHref };

  if (pathname === baseHref || pathname === "/home" || pathname === "/") return [base];

  const match = ALL_ITEMS.find(
    (item) => item.href !== "/home" && pathname.startsWith(item.href)
  );

  if (!match || match.href === baseHref) return [base];
  return [base, { label: match.label, href: match.href }];
}

/** Verifica se um item de navegação corresponde à rota atual. */
export function isActiveRoute(href: string, pathname: string): boolean {
  if (href === "/home") return pathname === "/home" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
