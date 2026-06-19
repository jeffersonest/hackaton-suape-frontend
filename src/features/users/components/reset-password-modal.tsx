"use client";

import { useState } from "react";
import { Key, Eye, EyeSlash, Warning, CircleNotch } from "@phosphor-icons/react";
import { updateUser } from "../api/client";
import { parseApiError } from "../lib/errors";
import type { User } from "../types";
import { ModalShell } from "./modal-shell";
import styles from "./modals.module.css";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

interface ResetPasswordModalProps {
  user: User;
  onClose: () => void;
  onReset: () => void;
}

export function ResetPasswordModal({ user, onClose, onReset }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setPasswordError(null);
    setConfirmError(null);

    if (!password) {
      setPasswordError("Informe a nova senha.");
      return;
    }
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setPasswordError(`A senha deve ter entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres.`);
      return;
    }
    if (confirm !== password) {
      setConfirmError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      await updateUser(user.identifier, { password });
      onReset();
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors.password) setPasswordError(parsed.fieldErrors.password);
      setGeneralError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      icon={Key}
      eyebrow="Resetar senha"
      title={user.email}
      size="sm"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting && <CircleNotch size={16} weight="bold" className={styles.btnSpinner} />}
            Resetar senha
          </button>
        </>
      }
    >
      {generalError && (
        <div className={styles.errorBanner}>
          <Warning size={16} weight="fill" />
          {generalError}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="reset-password">
          Nova senha
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="reset-password"
            type={show ? "text" : "password"}
            className={`${styles.input} ${passwordError ? styles.inputError : ""}`}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          >
            {show ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
          </button>
        </div>
        {passwordError && <span className={styles.fieldError}>{passwordError}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="reset-confirm">
          Confirmar nova senha
        </label>
        <input
          id="reset-confirm"
          type={show ? "text" : "password"}
          className={`${styles.input} ${confirmError ? styles.inputError : ""}`}
          placeholder="Repita a senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          disabled={submitting}
        />
        {confirmError && <span className={styles.fieldError}>{confirmError}</span>}
      </div>
    </ModalShell>
  );
}
