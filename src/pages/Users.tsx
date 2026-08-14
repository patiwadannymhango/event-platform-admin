import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/AddOutlined';
import { createUser, deactivateUser, listUsers, updateUser } from '../api/users';
import type { AdminUserRecord } from '../api/users';
import { listOrganizations } from '../api/organizations';
import type { OrgRecord } from '../api/organizations';

const ORG_ROLES = ['OWNER', 'ADMIN', 'FINANCE', 'REGISTRATION', 'EVENT_MANAGER', 'VIEWER'];

const emptyForm = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  password: '',
  is_superuser: false,
  organization_id: '',
  role: '',
};

export default function Users() {
  const [rows, setRows] = useState<AdminUserRecord[]>([]);
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setLoading(true);
    setError('');
    listUsers(search)
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    listOrganizations().then(setOrgs).catch(() => {});
  }, []);

  async function handleCreate() {
    setCreateBusy(true);
    setError('');
    try {
      await createUser({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        password: form.password,
        is_superuser: form.is_superuser,
        ...(form.organization_id && form.role
          ? { organization_id: form.organization_id, role: form.role }
          : {}),
      });
      setNotice('User created.');
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleToggleActive(user: AdminUserRecord) {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user.');
    }
  }

  async function handleDeactivate(user: AdminUserRecord) {
    if (!confirm(`Deactivate ${user.email}? They will no longer be able to log in.`)) return;
    try {
      await deactivateUser(user.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user.');
    }
  }

  const columns: GridColDef<AdminUserRecord>[] = [
    { field: 'full_name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'organization_memberships',
      headerName: 'Organizations',
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', py: 0.5 }}>
          {params.row.organization_memberships.map((m) => (
            <Chip key={m.id} size="small" label={`${m.organization_name}: ${m.role}`} />
          ))}
        </Stack>
      ),
    },
    {
      field: 'is_superuser',
      headerName: 'Superuser',
      width: 100,
      renderCell: (params) => (params.value ? <Chip size="small" color="primary" label="Superuser" /> : null),
    },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 130,
      renderCell: (params) => (
        <Switch
          size="small"
          checked={params.row.is_active}
          onChange={() => handleToggleActive(params.row)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.is_active ? (
          <Button size="small" color="error" onClick={() => handleDeactivate(params.row)}>
            Deactivate
          </Button>
        ) : null,
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>Users</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>
          New user
        </Button>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      <Stack direction="row" spacing={2}>
        <TextField
          size="small"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          sx={{ flex: 1, maxWidth: 360 }}
        />
      </Stack>

      <Box sx={{ height: 560 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick getRowHeight={() => 'auto'} />
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} fullWidth />
            <TextField label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              helperText="At least 8 characters. Share this with them directly — there's no invite email yet."
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch checked={form.is_superuser} onChange={(e) => setForm({ ...form, is_superuser: e.target.checked })} />
              }
              label="Superuser (full access to everything)"
            />
            {!form.is_superuser && (
              <>
                <TextField
                  select
                  label="Organization (optional)"
                  value={form.organization_id}
                  onChange={(e) => setForm({ ...form, organization_id: e.target.value, role: e.target.value ? form.role : '' })}
                  fullWidth
                >
                  <MenuItem value="">— none —</MenuItem>
                  {orgs.map((org) => (
                    <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                  ))}
                </TextField>
                {form.organization_id && (
                  <TextField
                    select
                    label="Role in that organization"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    fullWidth
                  >
                    {ORG_ROLES.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </TextField>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createBusy || !form.email || !form.first_name || !form.last_name || form.password.length < 8}
          >
            {createBusy ? 'Creating…' : 'Create user'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
