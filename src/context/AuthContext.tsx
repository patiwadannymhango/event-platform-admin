import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { clearTokens, EVENT_ID, isAuthenticated as checkAuth, login as loginApi } from '../api/client';
import { getMe, type AdminUser, type Organization } from '../api/profile';

interface AuthContextValue {
  authenticated: boolean;
  // True until the initial /me/ fetch (if any) has resolved — lets
  // role-gated UI avoid a flash of "no access" before it knows better.
  loading: boolean;
  user: AdminUser | null;
  organizations: Organization[];
  isSuperuser: boolean;
  // This admin is currently single-event (VITE_EVENT_ID) — the caller's
  // effective role for that one event, or null if they have no access
  // to it at all.
  eventRole: string | null;
  hasRole: (...roles: string[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(checkAuth());
  const [loading, setLoading] = useState(checkAuth());
  const [user, setUser] = useState<AdminUser | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  async function loadMe() {
    try {
      const data = await getMe();
      setUser(data.user);
      setOrganizations(data.organizations);
    } catch {
      // A hard-failing /me/ on an expired session already gets routed to
      // /login by apiFetch itself — nothing else to do here.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadMe();
    } else {
      setLoading(false);
    }
    // Only ever needs to run once on mount — login()/logout() manage
    // this state explicitly from then on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    await loginApi(email, password);
    setAuthenticated(true);
    setLoading(true);
    await loadMe();
  }

  function logout() {
    clearTokens();
    setAuthenticated(false);
    setUser(null);
    setOrganizations([]);
  }

  const isSuperuser = !!user?.is_superuser;

  const eventRole =
    organizations.flatMap((org) => org.events).find((event) => event.id === EVENT_ID)?.role ??
    null;

  function hasRole(...roles: string[]) {
    if (isSuperuser) return true;
    return !!eventRole && roles.includes(eventRole);
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        loading,
        user,
        organizations,
        isSuperuser,
        eventRole,
        hasRole,
        login,
        logout,
        refresh: loadMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
