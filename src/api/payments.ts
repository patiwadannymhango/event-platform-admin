import { apiFetch, EVENT_ID } from './client';
import type {
  AdminPayment,
  AdminTransaction,
  AdminWithdrawal,
  DashboardStats,
  Paginated,
  WalletBalance,
} from '../types';

export async function getDashboard(): Promise<DashboardStats> {
  return apiFetch(`/api/v1/payments/admin/events/${EVENT_ID}/dashboard/`);
}

export async function getWalletBalance(): Promise<WalletBalance> {
  return apiFetch(`/api/v1/payments/admin/events/${EVENT_ID}/wallet/balance/`);
}

/** Lipila's raw response is `{ success, message, data: { balance } }` — pull just the number. */
export function liveBalanceAmount(live: WalletBalance['live_balance']): number | null {
  if (!live || typeof live !== 'object') return null;
  const data = (live as { data?: { balance?: unknown } }).data;
  return typeof data?.balance === 'number' ? data.balance : null;
}

export async function listTransactions(page = 1): Promise<Paginated<AdminTransaction>> {
  return apiFetch(`/api/v1/payments/admin/events/${EVENT_ID}/transactions/?page=${page}`);
}

export async function listPayments(page = 1): Promise<Paginated<AdminPayment>> {
  return apiFetch(`/api/v1/payments/admin/events/${EVENT_ID}/payments/?page=${page}`);
}

export async function listWithdrawals(page = 1): Promise<Paginated<AdminWithdrawal>> {
  return apiFetch(`/api/v1/payments/admin/events/${EVENT_ID}/withdrawals/?page=${page}`);
}

export async function withdraw(payload: {
  amount: string;
  destination: 'MOBILE_MONEY' | 'BANK' | 'CASH';
  destination_account: string;
  recipient_name?: string;
  narration?: string;
}) {
  return apiFetch(`/api/v1/payments/admin/events/${EVENT_ID}/wallet/withdraw/`, {
    method: 'POST',
    body: payload,
  });
}

export async function sendMoney(payload: {
  amount: string;
  account_number: string;
  recipient_name?: string;
  narration?: string;
}) {
  return apiFetch(`/api/v1/payments/admin/events/${EVENT_ID}/wallet/send-money/`, {
    method: 'POST',
    body: payload,
  });
}

export async function refundPayment(paymentId: string, amount?: string) {
  return apiFetch(`/api/v1/payments/admin/payments/${paymentId}/refund/`, {
    method: 'POST',
    body: amount ? { amount } : {},
  });
}
