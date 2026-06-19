"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { StatusCount } from "../types";
import styles from "./status-donut.module.css";

const FALLBACK_COLOR = "#adb5bd";

interface StatusDonutProps {
  title: string;
  data: StatusCount[];
  /** Cor fixa por `key` (categoria). */
  colors: Record<string, string>;
}

/** Card com donut (recharts) + legenda própria para uma série {key,label,count}. */
export function StatusDonut({ title, data, colors }: StatusDonutProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  // Fatias com valor: o donut só desenha categorias > 0; a legenda lista todas.
  const slices = data.filter((item) => item.count > 0);

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>

      {total === 0 ? (
        <div className={styles.empty}>Sem registros para exibir.</div>
      ) : (
        <>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={slices.length > 1 ? 2 : 0}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.map((item) => (
                    <Cell key={item.key} fill={colors[item.key] ?? FALLBACK_COLOR} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border-default)",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.centerLabel} aria-hidden>
              <span className={styles.centerValue}>{total.toLocaleString("pt-BR")}</span>
              <span className={styles.centerCaption}>total</span>
            </div>
          </div>

          <ul className={styles.legend}>
            {data.map((item) => (
              <li key={item.key} className={styles.legendItem}>
                <span
                  className={styles.swatch}
                  style={{ background: colors[item.key] ?? FALLBACK_COLOR }}
                />
                <span className={styles.legendLabel}>{item.label}</span>
                <span className={styles.legendCount}>{item.count.toLocaleString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
