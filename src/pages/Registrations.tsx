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
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import RegistrationDetailDialog from '../components/RegistrationDetailDialog';
import BulkUploadWizard from '../components/BulkUploadWizard';
import {
  createRegistrationManually,
  deleteRegistration,
  downloadExport,
  listCategories,
  listRegistrations,
  updateRegistrationStatus,
} from '../api/registrations';
import type { AdminRegistration } from '../types';
import type { RegistrationCategory } from '../api/registrations';
import { STATUS_OPTIONS } from '../types';
import { useAuth } from '../context/AuthContext';
import { EVENT_REGISTRATION_MANAGE_ROLES } from '../roles';
import { GENDER_OPTIONS, AGE_RANGE_OPTIONS, TSHIRT_SIZE_OPTIONS, ATTENDANCE_TYPE_OPTIONS } from '../utils/formOptions';

function StatusCell({
  row,
  editable,
  onChange,
}: {
  row: AdminRegistration;
  editable: boolean;
  onChange: (status: string) => void;
}) {
  if (!editable) return <>{row.status}</>;

  return (
    <Select
      value={row.status}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      size="small"
      variant="standard"
      sx={{ fontSize: 13 }}
    >
      {STATUS_OPTIONS.map((s) => (
        <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
      ))}
    </Select>
  );
}

export default function Registrations() {
  const { hasRole } = useAuth();
  const canManageRegistrations = hasRole(...EVENT_REGISTRATION_MANAGE_ROLES);
  const [rows, setRows] = useState<AdminRegistration[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [exportBusy, setExportBusy] = useState(false);

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualBusy, setManualBusy] = useState(false);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const emptyManualForm = {
    first_name: '', last_name: '', email: '', phone: '', category_id: '',
    gender: '', age_range: '', country: '', tshirt_size: '', attendance_type: '',
    club_or_institution: '', emergency_contact_name: '', emergency_contact_phone: '',
    medical_notes: '', status: 'CONFIRMED',
  };
  const [manualForm, setManualForm] = useState(emptyManualForm);

  const [deleteTarget, setDeleteTarget] = useState<AdminRegistration | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [detailTarget, setDetailTarget] = useState<AdminRegistration | null>(null);

  function load() {
    setLoading(true);
    setError('');
    listRegistrations({ search, status: statusFilter, page: page + 1 })
      .then((data) => {
        setRows(data.results);
        setCount(data.count);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateRegistrationStatus(id, status);
      setNotice('Status updated.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    }
  }

  function openDeleteDialog(row: AdminRegistration) {
    setDeleteTarget(row);
    setDeleteError('');
  }

  function closeDeleteDialog() {
    if (deleteBusy) return;
    setDeleteTarget(null);
    setDeleteError('');
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await deleteRegistration(deleteTarget.id);
      setDeleteTarget(null);
      setNotice('Registration deleted.');
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleExport() {
    setExportBusy(true);
    setError('');
    try {
      const blob = await downloadExport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'registrations.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExportBusy(false);
    }
  }

  async function handleManualCreate() {
    setManualBusy(true);
    setError('');
    try {
      await createRegistrationManually({
        category_id: manualForm.category_id,
        participant: {
          first_name: manualForm.first_name,
          last_name: manualForm.last_name,
          email: manualForm.email,
          phone: manualForm.phone,
        },
        form_data: {
          gender: manualForm.gender,
          age_range: manualForm.age_range,
          country: manualForm.country,
          tshirt_size: manualForm.tshirt_size,
          attendance_type: manualForm.attendance_type,
          club_or_institution: manualForm.club_or_institution,
          emergency_contact_name: manualForm.emergency_contact_name,
          emergency_contact_phone: manualForm.emergency_contact_phone,
          medical_notes: manualForm.medical_notes,
        },
        status: manualForm.status,
      });
      setNotice('Person registered.');
      setManualOpen(false);
      setManualForm(emptyManualForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register participant.');
    } finally {
      setManualBusy(false);
    }
  }

  function ensureCategoriesLoaded() {
    if (categories.length === 0) {
      listCategories().then(setCategories).catch(() => {});
    }
  }

  function openManualDialog() {
    setManualOpen(true);
    ensureCategoriesLoaded();
  }

  function openBulkUploadDialog() {
    setBulkUploadOpen(true);
    ensureCategoriesLoaded();
  }

  const columns: GridColDef<AdminRegistration>[] = [
    { field: 'registration_number', headerName: 'Reference', width: 130 },
    {
      field: 'name', headerName: 'Runner', flex: 1, minWidth: 160,
      valueGetter: (_value, row) => `${row.participant.first_name} ${row.participant.last_name}`,
    },
    {
      field: 'email', headerName: 'Email', flex: 1, minWidth: 190,
      valueGetter: (_value, row) => row.participant.email,
    },
    {
      field: 'phone', headerName: 'Phone', width: 140,
      valueGetter: (_value, row) => row.participant.phone,
    },
    {
      field: 'gender', headerName: 'Gender', width: 100,
      valueGetter: (_value, row) => row.form_data.gender || row.participant.gender,
    },
    { field: 'category_name', headerName: 'Category', width: 160 },
    { field: 'amount', headerName: 'Amount', width: 100, valueFormatter: (v) => `K${v}` },
    {
      field: 'payment_reference', headerName: 'Payment Ref. (Lipila)', width: 200,
      renderCell: (params) => params.value || <span style={{ opacity: 0.4 }}>—</span>,
    },
    {
      field: 'status', headerName: 'Status', width: 180,
      renderCell: (params) => (
        <StatusCell
          row={params.row}
          editable={canManageRegistrations}
          onChange={(status) => handleStatusChange(params.row.id, status)}
        />
      ),
    },
    {
      field: 'source', headerName: 'Source', width: 170, sortable: false, filterable: false,
      renderCell: (params) => {
        const row = params.row as AdminRegistration;
        if (row.created_via === 'ADMIN') {
          return (
            <Tooltip
              title={row.created_by ? `Added by ${row.created_by.full_name} (${row.created_by.email})` : 'Admin dashboard'}
            >
              <Chip
                size="small"
                color="secondary"
                variant="outlined"
                icon={<AdminPanelSettingsOutlinedIcon />}
                label={row.created_by?.full_name || 'Admin'}
              />
            </Tooltip>
          );
        }
        if (row.created_via === 'PUBLIC') {
          return <Chip size="small" color="info" variant="outlined" icon={<PublicOutlinedIcon />} label="Website" />;
        }
        return (
          <Tooltip title="Registered before this was tracked">
            <Chip size="small" variant="outlined" icon={<HelpOutlineOutlinedIcon />} label="Unknown" />
          </Tooltip>
        );
      },
    },
    {
      field: 'registered_at', headerName: 'Registered', width: 130,
      valueFormatter: (v) => new Date(v as string).toLocaleDateString(),
    },
    ...(canManageRegistrations
      ? [
          {
            field: 'actions', headerName: '', width: 60, sortable: false, filterable: false,
            renderCell: (params: { row: AdminRegistration }) => (
              <Button
                size="small"
                color="error"
                onClick={(e) => { e.stopPropagation(); openDeleteDialog(params.row); }}
                sx={{ minWidth: 0 }}
              >
                <DeleteIcon fontSize="small" />
              </Button>
            ),
          } as GridColDef<AdminRegistration>,
        ]
      : []),
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>Registrations</Typography>
        <Stack direction="row" spacing={1}>
          {canManageRegistrations && (
            <>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={openManualDialog}>
                Register participant
              </Button>
              <Button startIcon={<UploadFileIcon />} variant="outlined" onClick={openBulkUploadDialog}>
                Bulk upload
              </Button>
            </>
          )}
          <Button startIcon={<DownloadIcon />} variant="contained" onClick={handleExport} disabled={exportBusy}>
            {exportBusy ? 'Exporting…' : 'Export'}
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      <Stack direction="row" spacing={2}>
        <TextField
          size="small"
          placeholder="Search name, email, phone, reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(0), load())}
          sx={{ flex: 1 }}
        />
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          displayEmpty
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
        <Button variant="contained" onClick={() => { setPage(0); load(); }}>Search</Button>
      </Stack>

      <Box sx={{ height: 780 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={count}
          paginationModel={{ page, pageSize: 25 }}
          onPaginationModelChange={(m) => setPage(m.page)}
          pageSizeOptions={[25]}
          disableRowSelectionOnClick
          density="compact"
          onRowClick={(params: GridRowParams<AdminRegistration>) => setDetailTarget(params.row)}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      </Box>

      <BulkUploadWizard
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        categories={categories}
        onUploaded={() => {
          setNotice('Bulk upload complete.');
          load();
        }}
      />

      {/* Manual registration modal */}
      <Dialog open={manualOpen} onClose={() => setManualOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Register a participant</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>Participant</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="First name" value={manualForm.first_name} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, first_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last name" value={manualForm.last_name} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, last_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" value={manualForm.email} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone" value={manualForm.phone} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Race category" value={manualForm.category_id} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, category_id: e.target.value })}
                >
                  <MenuItem value="">Select a race…</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}{Number(c.price) > 0 ? ` — K${c.price}` : ' — Custom pricing'}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Status" value={manualForm.status} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={700}>Additional details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Gender" value={manualForm.gender} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, gender: e.target.value })}
                >
                  <MenuItem value="">—</MenuItem>
                  {GENDER_OPTIONS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Age range" value={manualForm.age_range} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, age_range: e.target.value })}
                >
                  <MenuItem value="">—</MenuItem>
                  {AGE_RANGE_OPTIONS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Country" value={manualForm.country} fullWidth size="small" placeholder="Zambia"
                  onChange={(e) => setManualForm({ ...manualForm, country: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="T-shirt size" value={manualForm.tshirt_size} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, tshirt_size: e.target.value })}
                >
                  <MenuItem value="">—</MenuItem>
                  {TSHIRT_SIZE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Attendance type" value={manualForm.attendance_type} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, attendance_type: e.target.value })}
                >
                  <MenuItem value="">—</MenuItem>
                  {ATTENDANCE_TYPE_OPTIONS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Club / institution" value={manualForm.club_or_institution} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, club_or_institution: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Emergency contact name" value={manualForm.emergency_contact_name} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, emergency_contact_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Emergency contact phone" value={manualForm.emergency_contact_phone} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, emergency_contact_phone: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Medical notes" value={manualForm.medical_notes} fullWidth size="small" multiline minRows={2}
                  onChange={(e) => setManualForm({ ...manualForm, medical_notes: e.target.value })} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleManualCreate}
            disabled={
              manualBusy ||
              !manualForm.first_name ||
              !manualForm.last_name ||
              !manualForm.category_id ||
              !manualForm.attendance_type
            }
          >
            {manualBusy ? 'Saving…' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation modal */}
      <Dialog open={!!deleteTarget} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              bgcolor: 'error.main', color: 'error.contrastText', opacity: 0.9,
            }}
          >
            <WarningAmberIcon fontSize="small" />
          </Box>
          Delete registration?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{' '}
            <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
              {deleteTarget?.registration_number}
            </Typography>
            {deleteTarget && (
              <>
                {' '}(
                {deleteTarget.participant.first_name} {deleteTarget.participant.last_name})
              </>
            )}
            ? This cannot be undone.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteBusy}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleteBusy}>
            {deleteBusy ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <RegistrationDetailDialog
        registration={detailTarget}
        onClose={() => setDetailTarget(null)}
        onSaved={() => {
          setNotice('Registration updated.');
          load();
        }}
        canManage={canManageRegistrations}
      />
    </Stack>
  );
}
