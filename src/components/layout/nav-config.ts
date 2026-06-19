"use client";

import {
  House,
  FileText,
  ChartBar,
  Gear,
  type Icon,
} from "@phosphor-icons/react";

export interface NavItem {
  label: string;
  href: string;
  icon: Icon;
}

/** Itens principais do menu lateral. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/home", icon: House },
  { label: "Licenças", href: "/licencas", icon: FileText },
  { label: "Relatórios", href: "/relatorios", icon: ChartBar },
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
 * Sempre inicia em "Início" e adiciona a página atual quando não é a home.
 */
export function getBreadcrumb(pathname: string): Crumb[] {
  const home: Crumb = { label: "Início", href: "/home" };
  if (pathname === "/home" || pathname === "/") return [home];

  const match = ALL_ITEMS.find(
    (item) => item.href !== "/home" && pathname.startsWith(item.href)
  );

  if (!match) return [home];
  return [home, { label: match.label, href: match.href }];
}

/** Verifica se um item de navegação corresponde à rota atual. */
export function isActiveRoute(href: string, pathname: string): boolean {
  if (href === "/home") return pathname === "/home" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
