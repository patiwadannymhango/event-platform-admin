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
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/AddOutlined';
import GroupIcon from '@mui/icons-material/GroupOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  addOrgMember,
  createOrganization,
  listOrganizations,
  listOrgMembers,
  removeOrgMember,
  updateOrgMember,
  updateOrganization,
} from '../api/organizations';
import type { OrgMembership, OrgRecord } from '../api/organizations';
import { listUsers } from '../api/users';
import type { AdminUserRecord } from '../api/users';

const ORG_ROLES = ['OWNER', 'ADMIN', 'FINANCE', 'REGISTRATION', 'EVENT_MANAGER', 'VIEWER'];

const emptyOrgForm = { name: '', slug: '', description: '', email: '', phone: '', website: '' };

export default function Organizations() {
  const [rows, setRows] = useState<OrgRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyOrgForm);

  const [membersOrg, setMembersOrg] = useState<OrgRecord | null>(null);
  const [members, setMembers] = useState<OrgMembership[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [addUserId, setAddUserId] = useState('');
  const [addRole, setAddRole] = useState('VIEWER');

  function load() {
    setLoading(true);
    setError('');
    listOrganizations()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyOrgForm);
    setFormOpen(true);
  }

  function openEdit(org: OrgRecord) {
    setEditingId(org.id);
    setForm({
      name: org.name,
      slug: org.slug,
      description: org.description,
      email: org.email,
      phone: org.phone,
      website: org.website,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    setFormBusy(true);
    setError('');
    try {
      if (editingId) {
        await updateOrganization(editingId, form);
        setNotice('Organization updated.');
      } else {
        await createOrganization(form);
        setNotice('Organization created.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save organization.');
    } finally {
      setFormBusy(false);
    }
  }

  function openMembers(org: OrgRecord) {
    setMembersOrg(org);
    setAddUserId('');
    setAddRole('VIEWER');
    listOrgMembers(org.id).then(setMembers).catch(() => setMembers([]));
    if (users.length === 0) listUsers().then(setUsers).catch(() => {});
  }

  async function handleAddMember() {
    if (!membersOrg || !addUserId) return;
    try {
      await addOrgMember(membersOrg.id, { user: addUserId, role: addRole });
      listOrgMembers(membersOrg.id).then(setMembers);
      setAddUserId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member.');
    }
  }

  async function handleMemberRoleChange(membership: OrgMembership, role: string) {
    if (!membersOrg) return;
    await updateOrgMember(membersOrg.id, membership.id, { role });
    listOrgMembers(membersOrg.id).then(setMembers);
  }

  async function handleRemoveMember(membership: OrgMembership) {
    if (!membersOrg) return;
    if (!confirm(`Remove ${membership.user_email} from this organization?`)) return;
    await removeOrgMember(membersOrg.id, membership.id);
    listOrgMembers(membersOrg.id).then(setMembers);
  }

  const columns: GridColDef<OrgRecord>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'slug', headerName: 'Slug', width: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip size="small" label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => openMembers(params.row)} title="Members">
            <GroupIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => openEdit(params.row)} title="Edit">
            <EditIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>Organizations</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>New organization</Button>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      <Box sx={{ height: 560 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick />
      </Box>

      {/* Create/edit dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Edit organization' : 'New organization'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} fullWidth />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
            <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={formBusy || !form.name || !form.slug}>
            {formBusy ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Members dialog */}
      <Dialog open={!!membersOrg} onClose={() => setMembersOrg(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{membersOrg?.name} — members</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {members.map((m) => (
              <Stack key={m.id} direction="row" spacing={1} alignItems="center">
                <Typography sx={{ flex: 1 }} variant="body2">{m.user_full_name} ({m.user_email})</Typography>
                <TextField
                  select
                  size="small"
                  value={m.role}
                  onChange={(e) => handleMemberRoleChange(m, e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  {ORG_ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
                <IconButton size="small" color="error" onClick={() => handleRemoveMember(m)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            {members.length === 0 && (
              <Typography variant="body2" color="text.secondary">No members yet.</Typography>
            )}

            <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <TextField
                select
                size="small"
                label="Add user"
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                sx={{ flex: 1 }}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.full_name} ({u.email})</MenuItem>
                ))}
              </TextField>
              <TextField select size="small" label="Role" value={addRole} onChange={(e) => setAddRole(e.target.value)} sx={{ minWidth: 160 }}>
                {ORG_ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
              <Button variant="contained" onClick={handleAddMember} disabled={!addUserId}>Add</Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMembersOrg(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
