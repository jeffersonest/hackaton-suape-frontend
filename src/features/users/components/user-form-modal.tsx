"use client";

import { useState } from "react";
import {
  UserPlus,
  PencilSimple,
  Eye,
  EyeSlash,
  Warning,
  CircleNotch,
} from "@phosphor-icons/react";
import { createUser, updateUser } from "../api/client";
import { parseApiError, type FieldErrors } from "../lib/errors";
import type { CreateUserData, UpdateUserData, User } from "../types";
import { ModalShell } from "./modal-shell";
import styles from "./modals.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

interface UserFormModalProps {
  /** Quando ausente, o modal opera em modo de criação. */
  user?: User | null;
  /** A linha é o próprio admin logado (bloqueia rebaixar/desativar a si mesmo). */
  isSelf?: boolean;
  onClose: () => void;
  onSaved: (user: User) => void;
}

export function UserFormModal({ user, isSelf = false, onClose, onSaved }: UserFormModalProps) {
  const isEdit = !!user;

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [isAdmin, setIsAdmin] = useState(user?.is_admin ?? false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = "Informe o e-mail.";
    } else if (!EMAIL_RE.test(email.trim())) {
      errors.email = "E-mail inválido.";
    }
    if (!isEdit) {
      if (!password) {
        errors.password = "Informe a senha.";
      } else if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
        errors.password = `A senha deve ter entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres.`;
      }
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      let saved: User;
      if (isEdit && user) {
        // PATCH: envia apenas o que mudou em relação ao usuário atual.
        const patch: UpdateUserData = {};
        if (email.trim() !== user.email) patch.email = email.trim();
        if (isActive !== user.is_active) patch.is_active = isActive;
        if (isAdmin !== user.is_admin) patch.is_admin = isAdmin;
        if (Object.keys(patch).length === 0) {
          onClose();
          return;
        }
        saved = await updateUser(user.identifier, patch);
      } else {
        const payload: CreateUserData = {
          email: email.trim(),
          password,
          is_admin: isAdmin,
          is_active: isActive,
        };
        saved = await createUser(payload);
      }
      onSaved(saved);
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      setGeneralError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      icon={isEdit ? PencilSimple : UserPlus}
      eyebrow={isEdit ? "Editar usuário" : "Novo usuário"}
      title={isEdit ? user!.email : "Cadastrar usuário"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting && <CircleNotch size={16} weight="bold" className={styles.btnSpinner} />}
            {isEdit ? "Salvar alterações" : "Criar usuário"}
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
        <label className={styles.label} htmlFor="user-email">
          E-mail
        </label>
        <input
          id="user-email"
          type="email"
          className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
          placeholder="usuario@suape.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          disabled={submitting}
        />
        {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
      </div>

      {!isEdit && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="user-password">
            Senha
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="user-password"
              type={showPassword ? "text" : "password"}
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
            </button>
          </div>
          {fieldErrors.password ? (
            <span className={styles.fieldError}>{fieldErrors.password}</span>
          ) : (
            <span className={styles.fieldHint}>Entre 8 e 128 caracteres.</span>
          )}
        </div>
      )}

      <label className={styles.toggleRow}>
        <span className={styles.toggleText}>
          <span className={styles.toggleTitle}>Ativo</span>
          <span className={styles.toggleDesc}>
            {isSelf ? "Você não pode desativar a si mesmo." : "Permite que o usuário faça login."}
          </span>
        </span>
        <span className={styles.switch}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={submitting || isSelf}
          />
          <span className={styles.switchTrack} />
        </span>
      </label>

      <label className={styles.toggleRow}>
        <span className={styles.toggleText}>
          <span className={styles.toggleTitle}>Administrador</span>
          <span className={styles.toggleDesc}>
            {isSelf
              ? "Você não pode remover o próprio acesso de administrador."
              : "Concede acesso total, incluindo a gestão de usuários."}
          </span>
        </span>
        <span className={styles.switch}>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            disabled={submitting || isSelf}
          />
          <span className={styles.switchTrack} />
        </span>
      </label>
    </ModalShell>
  );
}
