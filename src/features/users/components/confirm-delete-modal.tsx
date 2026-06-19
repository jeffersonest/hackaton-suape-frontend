"use client";

import { useState } from "react";
import { Trash, Warning, CircleNotch } from "@phosphor-icons/react";
import { deleteUser } from "../api/client";
import { parseApiError } from "../lib/errors";
import type { User } from "../types";
import { ModalShell } from "./modal-shell";
import styles from "./modals.module.css";

interface ConfirmDeleteModalProps {
  user: User;
  onClose: () => void;
  onDeleted: () => void;
}

export function ConfirmDeleteModal({ user, onClose, onDeleted }: ConfirmDeleteModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await deleteUser(user.identifier);
      onDeleted();
    } catch (err) {
      setError(parseApiError(err).message);
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      icon={Trash}
      eyebrow="Excluir usuário"
      title="Confirmar exclusão"
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${styles.dangerBtn}`}
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting && <CircleNotch size={16} weight="bold" className={styles.btnSpinner} />}
            Excluir
          </button>
        </>
      }
    >
      {error && (
        <div className={styles.errorBanner}>
          <Warning size={16} weight="fill" />
          {error}
        </div>
      )}

      <p className={styles.confirmText}>
        Tem certeza que deseja excluir o usuário <strong>{user.email}</strong>? Esta ação não pode
        ser desfeita.
      </p>
    </ModalShell>
  );
}
