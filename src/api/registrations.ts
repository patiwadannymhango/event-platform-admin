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

export interface RegistrationCategory {
  id: string;
  name: string;
  code: string;
  price: string | number;
  currency: string;
}

// --- Bulk upload -----------------------------------------------------

export interface BulkUploadRow {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category_code?: string;
  status?: string;
  gender?: string;
  age_range?: string;
  country?: string;
  tshirt_size?: string;
  attendance_type?: string;
  club_or_institution?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  [key: string]: string | undefined;
}

export interface BulkUploadRowResult {
  row: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: BulkUploadRow;
  reference?: string;
}

export interface BulkUploadReport {
  created_count: number;
  created_references: string[];
  error_count: number;
  errors: { row: number; error: string }[];
  results: BulkUploadRowResult[];
}

// Same-shaped download as the registrations export — requires the auth
// header, so it goes through apiFetchBlob rather than a plain <a href>.
export async function downloadBulkUploadTemplate(): Promise<Blob> {
  return apiFetchBlob(
    `/api/v1/registrations/admin/events/${EVENT_ID}/registrations/bulk-upload/template/`
  );
}

// Dry run: parses the file and reports which rows would succeed/fail, but
// creates nothing. Powers the review screen.
export async function previewBulkUpload(file: File): Promise<BulkUploadReport> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<BulkUploadReport>(
    `/api/v1/registrations/admin/events/${EVENT_ID}/registrations/bulk-upload/preview/`,
    { method: 'POST', body: formData, isFormData: true }
  );
}

// The real thing — takes the (possibly hand-edited) rows from the review
// screen as JSON rather than re-uploading a file, so edits actually take
// effect. Runs through the exact same validation as the preview above.
export async function commitBulkUpload(rows: BulkUploadRow[]): Promise<BulkUploadReport> {
  return apiFetch<BulkUploadReport>(
    `/api/v1/registrations/admin/events/${EVENT_ID}/registrations/bulk-upload/`,
    { method: 'POST', body: { rows } }
  );
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
