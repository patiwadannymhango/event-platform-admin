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
  addEventMember,
  createEvent,
  listEventMembers,
  listOrgEvents,
  removeEventMember,
  updateEvent,
  updateEventMember,
} from '../api/events';
import type { EventMembership, EventRecord } from '../api/events';
import { listUsers } from '../api/users';
import type { AdminUserRecord } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { EVENT_ADMIN_ROLES } from '../roles';

const EVENT_ROLES = ['ADMIN', 'FINANCE', 'REGISTRATION', 'VIEWER'];
const EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED'];

const emptyEventForm = {
  name: '', slug: '', description: '', start_date: '', end_date: '', location: '', status: 'DRAFT',
};

export default function Events() {
  const { organizations, hasRole, isSuperuser } = useAuth();
  const canManage = hasRole(...EVENT_ADMIN_ROLES) || isSuperuser;

  const [orgId, setOrgId] = useState('');
  const [rows, setRows] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEventForm);

  const [membersEvent, setMembersEvent] = useState<EventRecord | null>(null);
  const [members, setMembers] = useState<EventMembership[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [addUserId, setAddUserId] = useState('');
  const [addRole, setAddRole] = useState('VIEWER');

  useEffect(() => {
    if (!orgId && organizations.length > 0) setOrgId(organizations[0].id);
  }, [organizations, orgId]);

  function load() {
    if (!orgId) return;
    setLoading(true);
    setError('');
    listOrgEvents(orgId)
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingId(null);
    setForm(emptyEventForm);
    setFormOpen(true);
  }

  function openEdit(event: EventRecord) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      slug: event.slug,
      description: event.description,
      start_date: event.start_date?.slice(0, 16) || '',
      end_date: event.end_date?.slice(0, 16) || '',
      location: event.location,
      status: event.status,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    setFormBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
      };
      if (editingId) {
        await updateEvent(editingId, payload);
        setNotice('Event updated.');
      } else {
        await createEvent(orgId, { ...payload, start_date: payload.start_date! });
        setNotice('Event created.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event.');
    } finally {
      setFormBusy(false);
    }
  }

  function openMembers(event: EventRecord) {
    setMembersEvent(event);
    setAddUserId('');
    setAddRole('VIEWER');
    listEventMembers(event.id).then(setMembers).catch(() => setMembers([]));
    if (users.length === 0) listUsers().then(setUsers).catch(() => {});
  }

  async function handleAddMember() {
    if (!membersEvent || !addUserId) return;
    try {
      await addEventMember(membersEvent.id, { user: addUserId, role: addRole });
      listEventMembers(membersEvent.id).then(setMembers);
      setAddUserId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member.');
    }
  }

  async function handleMemberRoleChange(membership: EventMembership, role: string) {
    if (!membersEvent) return;
    await updateEventMember(membersEvent.id, membership.id, { role });
    listEventMembers(membersEvent.id).then(setMembers);
  }

  async function handleRemoveMember(membership: EventMembership) {
    if (!membersEvent) return;
    if (!confirm(`Remove ${membership.user_email} from this event?`)) return;
    await removeEventMember(membersEvent.id, membership.id);
    listEventMembers(membersEvent.id).then(setMembers);
  }

  const columns: GridColDef<EventRecord>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'location', headerName: 'Location', flex: 1, minWidth: 150 },
    {
      field: 'start_date',
      headerName: 'Starts',
      width: 160,
      valueFormatter: (v) => (v ? new Date(v as string).toLocaleString() : ''),
    },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 90,
      renderCell: (params) => (
        <Chip size="small" label={params.value ? 'Yes' : 'No'} color={params.value ? 'success' : 'default'} />
      ),
    },
    ...(canManage
      ? [
          {
            field: 'actions',
            headerName: '',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params: { row: EventRecord }) => (
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" onClick={() => openMembers(params.row)} title="Members">
                  <GroupIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => openEdit(params.row)} title="Edit">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          } as GridColDef<EventRecord>,
        ]
      : []),
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>Events</Typography>
        {canManage && (
          <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate} disabled={!orgId}>
            New event
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      {organizations.length > 1 && (
        <TextField select size="small" label="Organization" value={orgId} onChange={(e) => setOrgId(e.target.value)} sx={{ maxWidth: 300 }}>
          {organizations.map((org) => (
            <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
          ))}
        </TextField>
      )}

      <Box sx={{ height: 560 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick />
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Edit event' : 'New event'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} fullWidth />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} />
            <TextField
              label="Start date"
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="End date"
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} fullWidth />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
              {EVENT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={formBusy || !form.name || !form.slug || !form.start_date}>
            {formBusy ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!membersEvent} onClose={() => setMembersEvent(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{membersEvent?.name} — members</DialogTitle>
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
                  {EVENT_ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
                <IconButton size="small" color="error" onClick={() => handleRemoveMember(m)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            {members.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No event-specific members — organization OWNER/ADMIN roles already have full access.
              </Typography>
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
                {EVENT_ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
              <Button variant="contained" onClick={handleAddMember} disabled={!addUserId}>Add</Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMembersEvent(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
