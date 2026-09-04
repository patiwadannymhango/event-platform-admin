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
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import ReplayIcon from '@mui/icons-material/ReplayOutlined';
import { listEventNotifications, resendNotification } from '../api/notifications';
import type { NotificationRecord } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import { EVENT_REGISTRATION_MANAGE_ROLES } from '../roles';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  SENT: 'success',
  PENDING: 'warning',
  FAILED: 'error',
};

export default function Notifications() {
  const { hasRole } = useAuth();
  const canManage = hasRole(...EVENT_REGISTRATION_MANAGE_ROLES);

  const [rows, setRows] = useState<NotificationRecord[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [resendTarget, setResendTarget] = useState<NotificationRecord | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendBusy, setResendBusy] = useState(false);
  const [resendError, setResendError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    // This page only ever shows email — SMS delivery isn't tracked here.
    listEventNotifications({ status, channel: 'EMAIL' })
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  function openResendDialog(row: NotificationRecord) {
    setResendTarget(row);
    setResendEmail(row.recipient);
    setResendError('');
  }

  function closeResendDialog() {
    if (resendBusy) return;
    setResendTarget(null);
    setResendError('');
  }

  async function handleResend() {
    if (!resendTarget) return;
    setResendBusy(true);
    setResendError('');
    try {
      await resendNotification(resendTarget.id, resendEmail.trim());
      setNotice(`Email resent to ${resendEmail.trim()}.`);
      setResendTarget(null);
      load();
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend email.');
    } finally {
      setResendBusy(false);
    }
  }

  const columns: GridColDef<NotificationRecord>[] = [
    { field: 'notification_type', headerName: 'Type', width: 190 },
    { field: 'recipient', headerName: 'Recipient', flex: 1, minWidth: 200 },
    { field: 'subject', headerName: 'Subject', flex: 1, minWidth: 220 },
    { field: 'registration_number', headerName: 'Registration', width: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip size="small" label={params.value} color={STATUS_COLOR[params.value] || 'default'} />
      ),
    },
    {
      field: 'created_at',
      headerName: 'When',
      width: 170,
      valueFormatter: (v) => new Date(v as string).toLocaleString(),
    },
    ...(canManage
      ? [
          {
            field: 'actions', headerName: '', width: 110, sortable: false, filterable: false,
            renderCell: (params: { row: NotificationRecord }) => (
              <Button
                size="small"
                startIcon={<ReplayIcon fontSize="small" />}
                onClick={(e) => { e.stopPropagation(); openResendDialog(params.row); }}
              >
                Resend
              </Button>
            ),
          } as GridColDef<NotificationRecord>,
        ]
      : []),
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>Notifications</Typography>
      <Typography variant="body2" color="text.secondary">
        Delivery log for every confirmation/receipt email this event has attempted to send.
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      <Stack direction="row" spacing={2}>
        <Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="SENT">Sent</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
        </Select>
      </Stack>

      <Box sx={{ height: 780 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick />
      </Box>

      {/* Resend email modal */}
      <Dialog open={!!resendTarget} onClose={closeResendDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Resend email</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {resendTarget?.subject}
              {resendTarget?.registration_number && ` — ${resendTarget.registration_number}`}
            </Typography>
            <TextField
              label="Send to"
              type="email"
              fullWidth
              size="small"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              helperText="Defaults to the original recipient — edit it to send to a different address."
            />
            {resendError && <Alert severity="error">{resendError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResendDialog} disabled={resendBusy}>Cancel</Button>
          <Button variant="contained" onClick={handleResend} disabled={resendBusy || !resendEmail.trim()}>
            {resendBusy ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
