"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UsersThree,
  UserPlus,
  PencilSimple,
  Key,
  Trash,
  Warning,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { useSessionStore } from "@/features/auth";
import {
  usersApi,
  UserFormModal,
  ResetPasswordModal,
  ConfirmDeleteModal,
  parseApiError,
  type User,
} from "@/features/users";
import styles from "./usuarios.module.css";

const LIMIT = 20;

export default function UsuariosPage() {
  const router = useRouter();
  const me = useSessionStore((state) => state.user);

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos diálogos
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  // Guarda de acesso na UI: a rota é admin-only (o backend ainda devolve 403).
  useEffect(() => {
    if (me && !me.is_admin) router.replace("/home");
  }, [me, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.listUsers({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
      });
      setUsers(response.data);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(parseApiError(err).message ?? "Não foi possível carregar os usuários.");
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (me?.is_admin) load();
  }, [me?.is_admin, load]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSaved = () => {
    setCreating(false);
    setEditing(null);
    load();
  };

  const handleReset = () => {
    setResetting(null);
  };

  const handleDeleted = () => {
    const wasLastOnPage = users.length === 1 && page > 1;
    setDeleting(null);
    if (wasLastOnPage) {
      setPage((p) => p - 1); // dispara o reload via efeito
    } else {
      load();
    }
  };

  const formatDate = (value: string) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Enquanto a guarda redireciona um não-admin, não renderiza a página.
  if (me && !me.is_admin) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <UsersThree size={28} weight="duotone" className={styles.titleIcon} />
          <div>
            <h1 className={styles.title}>Gerenciar Usuários</h1>
            <p className={styles.subtitle}>
              {total} {total === 1 ? "usuário cadastrado" : "usuários cadastrados"}
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          <UserPlus size={18} weight="bold" />
          Novo usuário
        </button>
      </div>

      <div className={styles.content}>
        {error ? (
          <div className={styles.stateBox}>
            <Warning size={48} weight="duotone" />
            <h3 className={styles.stateError}>Erro ao carregar usuários</h3>
            <p>{error}</p>
            <button type="button" onClick={load} className="btn btn-primary">
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <p>Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.stateBox}>
            <UsersThree size={48} weight="duotone" />
            <h3>Nenhum usuário encontrado</h3>
            <p>Cadastre o primeiro usuário no botão acima.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>E-mail</th>
                    <th>Admin</th>
                    <th>Ativo</th>
                    <th>Criado em</th>
                    <th className={styles.actionsCol}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelf = user.identifier === me?.identifier;
                    return (
                      <tr key={user.identifier}>
                        <td>
                          <span className={styles.email}>{user.email}</span>
                          {isSelf && <span className={styles.youTag}>você</span>}
                        </td>
                        <td>
                          {user.is_admin ? (
                            <span className={`${styles.badge} ${styles.badgeAdmin}`}>Admin</span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeMuted}`}>Usuário</span>
                          )}
                        </td>
                        <td>
                          {user.is_active ? (
                            <span className={`${styles.badge} ${styles.badgeActive}`}>Ativo</span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeInactive}`}>Inativo</span>
                          )}
                        </td>
                        <td className={styles.dateCell}>{formatDate(user.created_at)}</td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => setEditing(user)}
                              title="Editar"
                            >
                              <PencilSimple size={18} weight="bold" />
                            </button>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => setResetting(user)}
                              title="Resetar senha"
                            >
                              <Key size={18} weight="bold" />
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${styles.actionDanger}`}
                              onClick={() => setDeleting(user)}
                              disabled={isSelf}
                              title={isSelf ? "Você não pode excluir a si mesmo" : "Excluir"}
                            >
                              <Trash size={18} weight="bold" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Página {page} de {totalPages} · {total} no total
                </span>
                <div className={styles.paginationButtons}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <CaretLeft size={16} weight="bold" />
                    Anterior
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {creating && (
        <UserFormModal onClose={() => setCreating(false)} onSaved={handleSaved} />
      )}
      {editing && (
        <UserFormModal
          user={editing}
          isSelf={editing.identifier === me?.identifier}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {resetting && (
        <ResetPasswordModal user={resetting} onClose={() => setResetting(null)} onReset={handleReset} />
      )}
      {deleting && (
        <ConfirmDeleteModal user={deleting} onClose={() => setDeleting(null)} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
