import { apiFetch } from './client';

export interface OrgRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  is_active: boolean;
}

export interface OrgMembership {
  id: string;
  user: string;
  user_email: string;
  user_full_name: string;
  organization: string;
  role: string;
  is_active: boolean;
}

async function unwrap<T>(data: T[] | { results: T[] }): Promise<T[]> {
  return Array.isArray(data) ? data : data.results;
}

export async function listOrganizations(): Promise<OrgRecord[]> {
  const data = await apiFetch<OrgRecord[] | { results: OrgRecord[] }>('/api/v1/organizations/');
  return unwrap(data);
}

export async function createOrganization(payload: {
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
}): Promise<OrgRecord> {
  return apiFetch('/api/v1/organizations/', { method: 'POST', body: payload });
}

export async function updateOrganization(
  id: string,
  payload: Partial<Omit<OrgRecord, 'id'>>
): Promise<OrgRecord> {
  return apiFetch(`/api/v1/organizations/${id}/`, { method: 'PATCH', body: payload });
}

export async function listOrgMembers(organizationId: string): Promise<OrgMembership[]> {
  return apiFetch(`/api/v1/organizations/${organizationId}/members/`);
}

export async function addOrgMember(
  organizationId: string,
  payload: { user: string; role: string }
): Promise<OrgMembership> {
  return apiFetch(`/api/v1/organizations/${organizationId}/members/`, {
    method: 'POST',
    body: payload,
  });
}

export async function updateOrgMember(
  organizationId: string,
  membershipId: string,
  payload: Partial<{ role: string; is_active: boolean }>
): Promise<OrgMembership> {
  return apiFetch(`/api/v1/organizations/${organizationId}/members/${membershipId}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function removeOrgMember(organizationId: string, membershipId: string): Promise<void> {
  return apiFetch(`/api/v1/organizations/${organizationId}/members/${membershipId}/`, {
    method: 'DELETE',
  });
}
