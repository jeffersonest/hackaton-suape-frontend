import styles from "./agent-name.module.css";

/**
 * Nome do agente "Almirante" com o "Al" em destaque (amarelo) — trocadilho
 * com "AI", já que o "l" lembra um "i". O restante herda a cor do contexto.
 */
export function AgentName({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className={styles.al}>Al</span>mirante
    </span>
  );
}
