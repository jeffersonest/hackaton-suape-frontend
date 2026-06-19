import type {
  License,
  LicenseRequirement,
  LicenseFile,
  LicenseFilters,
  PaginatedResponse,
  RequirementFulfillment,
  UpsertFulfillmentData,
  InternalClient,
  PurgeLicenseResult,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

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
    throw new ApiError(
      response.status,
      `Erro na API: ${response.status} ${response.statusText}`,
      errorBody
    );
  }

  if (response.status === 204) return null as T;
  return response.json();
}

function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// LICENSES

export async function fetchLicenses(
  filters: LicenseFilters = {}
): Promise<PaginatedResponse<License>> {
  const { limit = 10, offset = 0, ...rest } = filters;
  const qs = buildQueryString({ ...rest, limit, offset });
  return apiFetch<PaginatedResponse<License>>(`/licenses${qs}`);
}

export async function fetchLicenseById(id: string): Promise<License> {
  return apiFetch<License>(`/licenses/${id}`);
}

export async function deleteLicense(id: string): Promise<PurgeLicenseResult> {
  return apiFetch<PurgeLicenseResult>(`/licenses/${id}`, { method: 'DELETE' });
}

// REQUIREMENTS

export async function fetchRequirements(
  licenseId: string
): Promise<LicenseRequirement[]> {
  return apiFetch<LicenseRequirement[]>(`/licenses/${licenseId}/requirements`);
}

// FULFILLMENTS

export async function fetchFulfillments(
  requirementId: string
): Promise<RequirementFulfillment[]> {
  return apiFetch<RequirementFulfillment[]>(
    `/requirements/${requirementId}/fulfillments`
  );
}

export async function upsertFulfillment(
  requirementId: string,
  data: UpsertFulfillmentData
): Promise<RequirementFulfillment> {
  return apiFetch<RequirementFulfillment>(
    `/requirements/${requirementId}/fulfillments`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}

// INTERNAL CLIENTS

let internalClientsCache: InternalClient[] | null = null;

export async function fetchInternalClients(): Promise<InternalClient[]> {
  if (internalClientsCache) return internalClientsCache;
  const data = await apiFetch<InternalClient[]>('/internal-clients');
  internalClientsCache = data;
  return data;
}

// FILES

export async function fetchLicenseFiles(
  licenseId: string
): Promise<LicenseFile[]> {
  const data = await apiFetch<LicenseFile[]>(`/licenses/${licenseId}/files`);
  return data.map((file) => ({
    ...file,
    url: `${API_BASE_URL}/files/${file.identifier}/content`,
  }));
}

export async function fetchRequirementFiles(
  requirementId: string
): Promise<LicenseFile[]> {
  const data = await apiFetch<LicenseFile[]>(
    `/requirements/${requirementId}/files`
  );
  return data.map((file) => ({
    ...file,
    url: `${API_BASE_URL}/files/${file.identifier}/content`,
  }));
}

export async function uploadRequirementFile(
  requirementId: string,
  file: File
): Promise<LicenseFile> {
  const formData = new FormData();
  formData.append('file', file);
  const fileResponse = await apiFetch<LicenseFile>(
    `/requirements/${requirementId}/files`,
    {
      method: 'POST',
      body: formData,
    }
  );
  return {
    ...fileResponse,
    url: `${API_BASE_URL}/files/${fileResponse.identifier}/content`,
  };
}

export async function uploadLicenseFile(
  licenseId: string,
  file: File
): Promise<LicenseFile> {
  const formData = new FormData();
  formData.append('file', file);
  const fileResponse = await apiFetch<LicenseFile>(
    `/licenses/${licenseId}/files`,
    {
      method: 'POST',
      body: formData,
    }
  );
  return {
    ...fileResponse,
    url: `${API_BASE_URL}/files/${fileResponse.identifier}/content`,
  };
}

export async function deleteFile(fileId: string): Promise<void> {
  return apiFetch<void>(`/files/${fileId}`, { method: 'DELETE' });
}

// HELPERS

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImage(contentType: string): boolean {
  return contentType.startsWith('image/');
}

export { ApiError };