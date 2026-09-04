import { apiFetch, EVENT_ID } from './client';

export interface NotificationRecord {
  id: string;
  registration: string | null;
  registration_number: string | null;
  channel: 'EMAIL' | 'SMS';
  notification_type: string;
  recipient: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error_message: string;
  sent_at: string | null;
  created_at: string;
}

export async function listEventNotifications(params: {
  status?: string;
  channel?: string;
} = {}): Promise<NotificationRecord[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.channel) qs.set('channel', params.channel);

  const data = await apiFetch<NotificationRecord[] | { results: NotificationRecord[] }>(
    `/api/v1/notifications/admin/events/${EVENT_ID}/notifications/?${qs.toString()}`
  );
  return Array.isArray(data) ? data : data.results;
}

// Re-sends a previously logged email — to its original recipient (omit
// `recipient`) or to a corrected address the admin types in. Always
// creates a new log row rather than mutating the original.
export async function resendNotification(id: string, recipient?: string): Promise<NotificationRecord> {
  return apiFetch<NotificationRecord>(
    `/api/v1/notifications/admin/events/${EVENT_ID}/notifications/${id}/resend/`,
    { method: 'POST', body: recipient ? { recipient } : {} }
  );
}
