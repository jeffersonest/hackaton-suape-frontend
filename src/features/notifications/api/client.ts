import type { Notification } from '../types';

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

export async function fetchNotifications(
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> {
  return apiFetch<Notification[]>(
    `/notifications?limit=${limit}&offset=${offset}`
  );
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  return apiFetch<Notification>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export function getResourceHref(
  resource: Notification['resource']
): string | null {
  if (!resource) return null;
  if (resource.resource_type === 'license') {
    return `/licencas/${resource.resource_id}`;
  }
  if (resource.resource_type === 'requirement') {
    // O requirement fica dentro de uma licença; abrimos a lista de licenças
    // (a navegação exata exigiria resolver license_id → requirement_id)
    return `/licencas`;
  }
  return null;
}

export { API_BASE_URL };