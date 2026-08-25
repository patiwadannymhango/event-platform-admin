import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/AddOutlined';
import {
  createPaymentAccount,
  createPaymentProvider,
  listPaymentAccounts,
  listPaymentProviders,
  updatePaymentAccount,
  updatePaymentProvider,
} from '../api/paymentProviders';
import type { PaymentAccountRecord, PaymentProviderRecord } from '../api/paymentProviders';
import { listOrganizations } from '../api/organizations';
import { useAuth } from '../context/AuthContext';

const emptyProviderForm = { name: '', code: '', provider_type: 'LIPILA' as 'LIPILA' | 'OTHER' };
const emptyAccountForm = {
  provider: '', account_type: 'WALLET' as 'WALLET' | 'MERCHANT', name: '', provider_account_id: '', currency: 'ZMW',
};

export default function PaymentProviders() {
  const { primaryOrganization } = useAuth();
  const [orgId, setOrgId] = useState('');
  const [providers, setProviders] = useState<PaymentProviderRecord[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [providerOpen, setProviderOpen] = useState(false);
  const [providerBusy, setProviderBusy] = useState(false);
  const [providerForm, setProviderForm] = useState(emptyProviderForm);

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountForm, setAccountForm] = useState(emptyAccountForm);

  function load() {
    setLoading(true);
    setError('');
    Promise.all([listPaymentProviders(), listPaymentAccounts()])
      .then(([p, a]) => {
        setProviders(p);
        setAccounts(a);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Single-org deployment — resolve it from the caller's own membership
  // (primaryOrganization), falling back to the platform's org list for a
  // bare superuser account with no membership row of its own.
  useEffect(() => {
    if (primaryOrganization) {
      setOrgId(primaryOrganization.id);
    } else {
      listOrganizations().then((orgs) => setOrgId(orgs[0]?.id ?? '')).catch(() => {});
    }
  }, [primaryOrganization]);

  async function handleCreateProvider() {
    setProviderBusy(true);
    setError('');
    try {
      await createPaymentProvider(providerForm);
      setNotice('Provider created.');
      setProviderOpen(false);
      setProviderForm(emptyProviderForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider.');
    } finally {
      setProviderBusy(false);
    }
  }

  async function handleToggleProvider(provider: PaymentProviderRecord) {
    await updatePaymentProvider(provider.id, { is_active: !provider.is_active });
    load();
  }

  async function handleCreateAccount() {
    setAccountBusy(true);
    setError('');
    try {
      await createPaymentAccount({ ...accountForm, organization: orgId });
      setNotice('Payment account created.');
      setAccountOpen(false);
      setAccountForm(emptyAccountForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment account.');
    } finally {
      setAccountBusy(false);
    }
  }

  async function handleToggleAccount(account: PaymentAccountRecord) {
    await updatePaymentAccount(account.id, { is_active: !account.is_active });
    load();
  }

  const providerColumns: GridColDef<PaymentProviderRecord>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'code', headerName: 'Code', width: 140 },
    { field: 'provider_type', headerName: 'Type', width: 120 },
    {
      field: 'is_active', headerName: 'Active', width: 100,
      renderCell: (params) => <Switch size="small" checked={params.row.is_active} onChange={() => handleToggleProvider(params.row)} />,
    },
  ];

  const accountColumns: GridColDef<PaymentAccountRecord>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'provider_name', headerName: 'Provider', width: 140 },
    { field: 'account_type', headerName: 'Type', width: 110 },
    { field: 'currency', headerName: 'Currency', width: 90 },
    {
      field: 'is_active', headerName: 'Active', width: 100,
      renderCell: (params) => <Switch size="small" checked={params.row.is_active} onChange={() => handleToggleAccount(params.row)} />,
    },
  ];

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={800}>Payment providers</Typography>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setProviderOpen(true)}>New provider</Button>
        </Stack>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
        <Box sx={{ height: 300 }}>
          <DataGrid rows={providers} columns={providerColumns} loading={loading} density="compact" disableRowSelectionOnClick />
        </Box>
      </Stack>

      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={800}>Payment accounts</Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAccountOpen(true)} disabled={!orgId}>New account</Button>
        </Stack>
        <Box sx={{ height: 300 }}>
          <DataGrid rows={accounts} columns={accountColumns} loading={loading} density="compact" disableRowSelectionOnClick />
        </Box>
      </Stack>

      <Dialog open={providerOpen} onClose={() => setProviderOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New payment provider</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={providerForm.name} onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })} fullWidth />
            <TextField label="Code" value={providerForm.code} onChange={(e) => setProviderForm({ ...providerForm, code: e.target.value })} fullWidth />
            <TextField select label="Type" value={providerForm.provider_type} onChange={(e) => setProviderForm({ ...providerForm, provider_type: e.target.value as 'LIPILA' | 'OTHER' })} fullWidth>
              <MenuItem value="LIPILA">Lipila</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProviderOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateProvider} disabled={providerBusy || !providerForm.name || !providerForm.code}>
            {providerBusy ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={accountOpen} onClose={() => setAccountOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New payment account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Provider" value={accountForm.provider} onChange={(e) => setAccountForm({ ...accountForm, provider: e.target.value })} fullWidth>
              {providers.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
            <TextField label="Name" value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} fullWidth />
            <TextField select label="Account type" value={accountForm.account_type} onChange={(e) => setAccountForm({ ...accountForm, account_type: e.target.value as 'WALLET' | 'MERCHANT' })} fullWidth>
              <MenuItem value="WALLET">Wallet</MenuItem>
              <MenuItem value="MERCHANT">Merchant</MenuItem>
            </TextField>
            <TextField label="Provider account ID" value={accountForm.provider_account_id} onChange={(e) => setAccountForm({ ...accountForm, provider_account_id: e.target.value })} fullWidth />
            <TextField label="Currency" value={accountForm.currency} onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAccount}
            disabled={accountBusy || !orgId || !accountForm.provider || !accountForm.name}
          >
            {accountBusy ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
