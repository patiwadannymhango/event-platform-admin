import { apiFetch, apiFetchBlob, EVENT_ID } from './client';
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

// Same field set as "Register participant", minus email — the backend
// rejects the whole request outright if an "email" key is present at all
// (it's fixed once the registration exists), so this UI never offers it.
export async function updateRegistrationDetails(
  id: string,
  payload: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    gender?: string;
    age_range?: string;
    country?: string;
    tshirt_size?: string;
    attendance_type?: string;
    club_or_institution?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    medical_notes?: string;
  }
): Promise<AdminRegistration> {
  return apiFetch<AdminRegistration>(`/api/v1/registrations/admin/registrations/${id}/details/`, {
    method: 'PATCH',
    body: payload,
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

// A plain <a href> here would skip the Authorization header entirely (the
// export endpoint requires it) and just open a 401 error page instead of
// downloading anything — fetched as a blob and saved client-side instead.
export async function downloadExport(): Promise<Blob> {
  return apiFetchBlob(`/api/v1/registrations/admin/events/${EVENT_ID}/registrations/export/`);
}
