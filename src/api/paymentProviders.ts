import { apiFetch } from './client';

export interface PaymentProviderRecord {
  id: string;
  name: string;
  code: string;
  provider_type: 'LIPILA' | 'OTHER';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentAccountRecord {
  id: string;
  organization: string;
  organization_name: string;
  provider: string;
  provider_name: string;
  account_type: 'WALLET' | 'MERCHANT';
  name: string;
  provider_account_id: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function unwrap<T>(data: T[] | { results: T[] }): Promise<T[]> {
  return Array.isArray(data) ? data : data.results;
}

export async function listPaymentProviders(): Promise<PaymentProviderRecord[]> {
  const data = await apiFetch<PaymentProviderRecord[] | { results: PaymentProviderRecord[] }>(
    '/api/v1/payments/admin/providers/'
  );
  return unwrap(data);
}

export async function createPaymentProvider(payload: {
  name: string;
  code: string;
  provider_type: 'LIPILA' | 'OTHER';
}): Promise<PaymentProviderRecord> {
  return apiFetch('/api/v1/payments/admin/providers/', { method: 'POST', body: payload });
}

export async function updatePaymentProvider(
  id: string,
  payload: Partial<{ name: string; code: string; is_active: boolean }>
): Promise<PaymentProviderRecord> {
  return apiFetch(`/api/v1/payments/admin/providers/${id}/`, { method: 'PATCH', body: payload });
}

export async function listPaymentAccounts(): Promise<PaymentAccountRecord[]> {
  const data = await apiFetch<PaymentAccountRecord[] | { results: PaymentAccountRecord[] }>(
    '/api/v1/payments/admin/accounts/'
  );
  return unwrap(data);
}

export async function createPaymentAccount(payload: {
  organization: string;
  provider: string;
  account_type: 'WALLET' | 'MERCHANT';
  name: string;
  provider_account_id?: string;
  currency?: string;
}): Promise<PaymentAccountRecord> {
  return apiFetch('/api/v1/payments/admin/accounts/', { method: 'POST', body: payload });
}

export async function updatePaymentAccount(
  id: string,
  payload: Partial<{ name: string; provider_account_id: string; currency: string; is_active: boolean }>
): Promise<PaymentAccountRecord> {
  return apiFetch(`/api/v1/payments/admin/accounts/${id}/`, { method: 'PATCH', body: payload });
}
