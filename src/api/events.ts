import { apiFetch } from './client';

export interface EventRecord {
  id: string;
  organization?: string;
  name: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string | null;
  location: string;
  status: string;
  is_active: boolean;
}

export interface EventMembership {
  id: string;
  user: string;
  user_email: string;
  user_full_name: string;
  event: string;
  role: string;
  is_active: boolean;
}

async function unwrap<T>(data: T[] | { results: T[] }): Promise<T[]> {
  return Array.isArray(data) ? data : data.results;
}

export async function listOrgEvents(organizationId: string): Promise<EventRecord[]> {
  const data = await apiFetch<EventRecord[] | { results: EventRecord[] }>(
    `/api/v1/events/organization/${organizationId}/`
  );
  return unwrap(data);
}

export async function createEvent(
  organizationId: string,
  payload: {
    name: string;
    slug: string;
    description?: string;
    start_date: string;
    end_date?: string;
    location?: string;
    status?: string;
  }
): Promise<EventRecord> {
  return apiFetch(`/api/v1/events/organization/${organizationId}/`, {
    method: 'POST',
    body: payload,
  });
}

export async function updateEvent(
  eventId: string,
  payload: Partial<Omit<EventRecord, 'id' | 'organization'>>
): Promise<EventRecord> {
  return apiFetch(`/api/v1/events/${eventId}/`, { method: 'PATCH', body: payload });
}

export async function listEventMembers(eventId: string): Promise<EventMembership[]> {
  return apiFetch(`/api/v1/events/${eventId}/members/`);
}

export async function addEventMember(
  eventId: string,
  payload: { user: string; role: string }
): Promise<EventMembership> {
  return apiFetch(`/api/v1/events/${eventId}/members/`, { method: 'POST', body: payload });
}

export async function updateEventMember(
  eventId: string,
  membershipId: string,
  payload: Partial<{ role: string; is_active: boolean }>
): Promise<EventMembership> {
  return apiFetch(`/api/v1/events/${eventId}/members/${membershipId}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function removeEventMember(eventId: string, membershipId: string): Promise<void> {
  return apiFetch(`/api/v1/events/${eventId}/members/${membershipId}/`, { method: 'DELETE' });
}
