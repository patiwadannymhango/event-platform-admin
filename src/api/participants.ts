import { apiFetch, EVENT_ID } from './client';

export interface ParticipantRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  registration_count: number;
  created_at: string;
}

export async function listEventParticipants(search = ''): Promise<ParticipantRecord[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await apiFetch<ParticipantRecord[] | { results: ParticipantRecord[] }>(
    `/api/v1/participants/admin/events/${EVENT_ID}/participants/${qs}`
  );
  return Array.isArray(data) ? data : data.results;
}
