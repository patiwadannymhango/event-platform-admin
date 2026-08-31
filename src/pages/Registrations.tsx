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
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';
import RegistrationDetailDialog from '../components/RegistrationDetailDialog';
import {
  bulkUploadRegistrations,
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

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadReport, setUploadReport] = useState('');

  const [manualOpen, setManualOpen] = useState(false);
  const [manualBusy, setManualBusy] = useState(false);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [manualForm, setManualForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', category_id: '',
  });

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

  async function handleUpload() {
    if (!uploadFile) return;
    setUploadBusy(true);
    setUploadReport('');
    try {
      const report = await bulkUploadRegistrations(uploadFile);
      setUploadReport(`Created ${report.created_count}. ${report.error_count} error(s).`);
      load();
    } catch (err) {
      setUploadReport(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadBusy(false);
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
        status: 'CONFIRMED',
      });
      setManualOpen(false);
      setManualForm({ first_name: '', last_name: '', email: '', phone: '', category_id: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register participant.');
    } finally {
      setManualBusy(false);
    }
  }

  function openManualDialog() {
    setManualOpen(true);
    if (categories.length === 0) {
      listCategories().then(setCategories).catch(() => {});
    }
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
              <Button startIcon={<UploadFileIcon />} variant="outlined" onClick={() => setUploadOpen(true)}>
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

      <Box sx={{ height: 560 }}>
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

      {/* Bulk upload modal */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk upload registrations</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            CSV or XLSX with columns: first_name, last_name, category_code (email, phone,
            status optional).
          </Typography>
          <Button component="label" variant="outlined">
            {uploadFile ? uploadFile.name : 'Choose file'}
            <input
              type="file"
              hidden
              accept=".csv,.xlsx"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {uploadReport && <Alert severity="info" sx={{ mt: 2 }}>{uploadReport}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!uploadFile || uploadBusy}>
            {uploadBusy ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual registration modal */}
      <Dialog open={manualOpen} onClose={() => setManualOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register a participant</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="First name" value={manualForm.first_name}
              onChange={(e) => setManualForm({ ...manualForm, first_name: e.target.value })} fullWidth />
            <TextField label="Last name" value={manualForm.last_name}
              onChange={(e) => setManualForm({ ...manualForm, last_name: e.target.value })} fullWidth />
            <TextField label="Email" value={manualForm.email}
              onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} fullWidth />
            <TextField label="Phone" value={manualForm.phone}
              onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} fullWidth />
            <TextField
              select
              label="Race category"
              value={manualForm.category_id}
              onChange={(e) => setManualForm({ ...manualForm, category_id: e.target.value })}
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}{Number(c.price) > 0 ? ` — K${c.price}` : ' — Custom pricing'}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleManualCreate} disabled={manualBusy}>
            {manualBusy ? 'Saving…' : 'Register (marks as Confirmed)'}
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
