import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AppTheme from './theme/AppTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registrations from './pages/Registrations';
import PaymentsOverview from './pages/PaymentsOverview';
import PaymentsTransactions from './pages/PaymentsTransactions';
import PaymentsRecords from './pages/PaymentsRecords';
import Profile from './pages/Profile';
import Users from './pages/Users';
import PaymentProviders from './pages/PaymentProviders';
import Notifications from './pages/Notifications';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  if (!authenticated) return <Navigate to="/login" replace />;
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return <>{children}</>;
}

function SuperuserRoute({ children }: { children: React.ReactNode }) {
  const { isSuperuser } = useAuth();
  if (!isSuperuser) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppTheme>
      <AuthProvider>
        {/* import.meta.env.BASE_URL is Vite's `base` (defaults to '/'
            now that this deploys standalone on Vercel), so the routes
            below stay written as plain '/', '/registrations', … and
            would still pick up a prefix automatically if `base` were
            ever set to one again. */}
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/registrations" element={<Registrations />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/payments/overview" element={<PaymentsOverview />} />
              <Route path="/payments/transactions" element={<PaymentsTransactions />} />
              <Route path="/payments/records" element={<PaymentsRecords />} />
              <Route
                path="/users"
                element={
                  <SuperuserRoute>
                    <Users />
                  </SuperuserRoute>
                }
              />
              <Route
                path="/payment-providers"
                element={
                  <SuperuserRoute>
                    <PaymentProviders />
                  </SuperuserRoute>
                }
              />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppTheme>
  );
}
