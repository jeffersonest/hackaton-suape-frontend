"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, SignIn, Spinner } from "@phosphor-icons/react";
import { useSessionStore } from "../stores/session-store";
import { login as apiLogin } from "../api/auth-api";
import type { LoginCredentials } from "../types";
import styles from "./login-form.module.css";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const login = useSessionStore((state) => state.login);

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Para desenvolvimento, simula login
      // Em produção, usar: const data = await apiLogin(credentials);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      login({
        id: "1",
        email: credentials.email,
        name: "Usuário Suape",
        accessToken: "dev-token",
      }, "dev-token");

      onSuccess?.();
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2>Bem-vindo de volta</h2>
        <p>Entre com suas credenciais institucionais</p>
      </div>

      <div className={styles.fields}>
        <div className={`${styles.field} ${focusedField === "email" ? styles.focused : ""} ${credentials.email ? styles.filled : ""}`}>
          <label htmlFor="email" className={styles.label}>E-mail institucional</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="seu.email@suape.pe.gov.br"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            required
            autoComplete="email"
            disabled={isLoading}
          />
          <div className={styles.inputLine} />
        </div>

        <div className={`${styles.field} ${focusedField === "password" ? styles.focused : ""} ${credentials.password ? styles.filled : ""}`}>
          <label htmlFor="password" className={styles.label}>Senha</label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={styles.input}
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
            <div className={styles.inputLine} />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeSlash size={20} weight="bold" />
              ) : (
                <Eye size={20} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 4.5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={isLoading || !credentials.email || !credentials.password}
      >
        {isLoading ? (
          <>
            <Spinner size={20} className={styles.spinner} />
            <span>Entrando...</span>
          </>
        ) : (
          <>
            <span>Entrar</span>
            <SignIn size={20} weight="bold" />
          </>
        )}
      </button>

      <p className={styles.hint}>
        Problemas para acessar? Entre em contato com o suporte.
      </p>
    </form>
  );
}
