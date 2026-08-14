import { apiFetch } from './client';

export interface AdminUserMembership {
  id: string;
  organization_id: string;
  organization_name: string;
  role: string;
  is_active: boolean;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  is_active: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  created_at: string;
  organization_memberships: AdminUserMembership[];
}

export async function listUsers(search = ''): Promise<AdminUserRecord[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await apiFetch<AdminUserRecord[] | { results: AdminUserRecord[] }>(
    `/api/v1/auth/admin/users/${qs}`
  );
  return Array.isArray(data) ? data : data.results;
}

export async function createUser(payload: {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  is_superuser?: boolean;
  organization_id?: string;
  role?: string;
}): Promise<AdminUserRecord> {
  return apiFetch('/api/v1/auth/admin/users/create/', { method: 'POST', body: payload });
}

export async function updateUser(
  id: string,
  payload: Partial<{
    first_name: string;
    last_name: string;
    phone: string;
    is_active: boolean;
    is_superuser: boolean;
  }>
): Promise<AdminUserRecord> {
  return apiFetch(`/api/v1/auth/admin/users/${id}/`, { method: 'PATCH', body: payload });
}

export async function deactivateUser(id: string): Promise<void> {
  return apiFetch(`/api/v1/auth/admin/users/${id}/`, { method: 'DELETE' });
}
