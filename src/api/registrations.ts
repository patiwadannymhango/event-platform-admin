import { apiFetch, EVENT_ID } from './client';
import type { AdminRegistration, Paginated } from '../types';

export async function listRegistrations(params: {
  search?: string;
  status?: string;
  ordering?: string;
  page?: number;
}): Promise<Paginated<AdminRegistration>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.ordering) qs.set('ordering', params.ordering);
  if (params.page) qs.set('page', String(params.page));

  return apiFetch(
    `/api/v1/registrations/admin/events/${EVENT_ID}/registrations/?${qs.toString()}`
  );
}

export async function updateRegistrationStatus(id: string, status: string) {
  return apiFetch<AdminRegistration>(`/api/v1/registrations/admin/registrations/${id}/`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function deleteRegistration(id: string) {
  return apiFetch<void>(`/api/v1/registrations/admin/registrations/${id}/`, {
    method: 'DELETE',
  });
}

export async function createRegistrationManually(payload: {
  category_id: string;
  participant: Record<string, string>;
  form_data?: Record<string, string>;
  status?: string;
}) {
  return apiFetch<AdminRegistration>(
    `/api/v1/registrations/admin/events/${EVENT_ID}/registrations/create/`,
    { method: 'POST', body: payload }
  );
}

export async function bulkUploadRegistrations(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<{
    created_count: number;
    created_references: string[];
    error_count: number;
    errors: { row: number; error: string }[];
  }>(`/api/v1/registrations/admin/events/${EVENT_ID}/registrations/bulk-upload/`, {
    method: 'POST',
    body: formData,
    isFormData: true,
  });
}

export interface RegistrationCategory {
  id: string;
  name: string;
  code: string;
  price: string | number;
}

export async function listCategories(): Promise<RegistrationCategory[]> {
  const form = await apiFetch<{ categories: RegistrationCategory[] }>(
    `/api/v1/registrations/public/events/${EVENT_ID}/form/`
  );
  return form.categories;
}
