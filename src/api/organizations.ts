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

// This admin is single-event/single-organization. The only remaining
// caller of this is a superuser-only fallback (see AuthContext's
// primaryOrganization) for a superuser account with no membership row
// of its own.
export async function listOrganizations(): Promise<OrgRecord[]> {
  const data = await apiFetch<OrgRecord[] | { results: OrgRecord[] }>('/api/v1/organizations/');
  return Array.isArray(data) ? data : data.results;
}
