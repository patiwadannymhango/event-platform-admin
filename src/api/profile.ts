import { apiFetch } from './client';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  is_superuser: boolean;
  is_staff: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
  events: { id: string; name: string; slug: string; status: string; role: string }[];
}

export async function getMe(): Promise<{ user: AdminUser; organizations: Organization[] }> {
  return apiFetch('/api/v1/auth/me/');
}

export async function updateProfile(payload: {
  first_name?: string;
  last_name?: string;
  phone?: string;
}): Promise<AdminUser> {
  return apiFetch('/api/v1/auth/me/', { method: 'PATCH', body: payload });
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<{ detail: string }> {
  return apiFetch('/api/v1/auth/change-password/', { method: 'POST', body: payload });
}
