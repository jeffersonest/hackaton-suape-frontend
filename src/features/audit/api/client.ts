import type { AuditEvent } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text().catch(() => null);
    }
    throw new Error(
      `Erro na API: ${response.status} ${response.statusText}`,
    );
  }

  if (response.status === 204) return null as T;
  return response.json();
}

export async function fetchLicenseAudit(
  licenseId: string
): Promise<AuditEvent[]> {
  return apiFetch<AuditEvent[]>(`/licenses/${licenseId}/audit`);
}

export { API_BASE_URL };