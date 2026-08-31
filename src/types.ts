export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
}

export interface AdminRegistration {
  id: string;
  registration_number: string;
  status: string;
  amount: string;
  currency: string;
  participant: Participant;
  category: string;
  category_name: string;
  event: string;
  event_name: string;
  form_data: Record<string, string>;
  payment_reference: string;
  registered_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardStats {
  total_registrations: number;
  by_status: { status: string; count: number }[];
  revenue_confirmed: string;
  revenue_pending: string;
  wallet_balance: string;
  wallet_pending_balance: string;
}

export interface WalletBalance {
  ledger_balance: string;
  pending_balance: string;
  currency: string;
  live_balance: Record<string, unknown> | null;
  live_balance_error: string | null;
}

export interface AdminTransaction {
  id: string;
  wallet: string;
  transaction_type: string;
  direction: string;
  status: string;
  amount: string;
  currency: string;
  reference: string;
  provider_reference: string;
  description: string;
  created_at: string;
  posted_at: string | null;
}

export interface AdminPayment {
  id: string;
  registration: string;
  registration_number: string;
  participant_name: string;
  reference: string;
  provider_reference: string;
  amount: string;
  currency: string;
  status: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
}

export interface AdminWithdrawal {
  id: string;
  wallet: string;
  reference: string;
  provider_reference: string;
  destination: string;
  destination_account: string;
  recipient_name: string;
  amount: string;
  currency: string;
  status: string;
  narration: string;
  requested_at: string;
  completed_at: string | null;
}

export const STATUS_OPTIONS = [
  'DRAFT',
  'PENDING_PAYMENT',
  'PAYMENT_PROCESSING',
  'RESERVED',
  'CONFIRMED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
];
