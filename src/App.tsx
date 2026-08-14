import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registrations from './pages/Registrations';
import PaymentsOverview from './pages/PaymentsOverview';
import PaymentsTransactions from './pages/PaymentsTransactions';
import PaymentsRecords from './pages/PaymentsRecords';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated } = useAuth();
  if (!authenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              <Route path="/payments/overview" element={<PaymentsOverview />} />
              <Route path="/payments/transactions" element={<PaymentsTransactions />} />
              <Route path="/payments/records" element={<PaymentsRecords />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
