// Mirrors the role tiers in the backend
// (backend/apps/common/access.py) — a role string here may come from
// either OrganizationMembership.role or EventMembership.role, since the
// backend resolves an org OWNER/ADMIN role down to event-level access.
export const EVENT_VIEW_ROLES = [
  'OWNER',
  'ADMIN',
  'FINANCE',
  'REGISTRATION',
  'EVENT_MANAGER',
  'VIEWER',
];

export const EVENT_REGISTRATION_MANAGE_ROLES = [
  'OWNER',
  'ADMIN',
  'EVENT_MANAGER',
  'REGISTRATION',
];

export const EVENT_FINANCE_ROLES = ['OWNER', 'ADMIN', 'FINANCE'];

export const EVENT_ADMIN_ROLES = ['OWNER', 'ADMIN'];
