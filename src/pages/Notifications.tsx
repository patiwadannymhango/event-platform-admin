import { useEffect, useState } from 'react';
import { Alert, Box, Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { listEventNotifications } from '../api/notifications';
import type { NotificationRecord } from '../api/notifications';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  SENT: 'success',
  PENDING: 'warning',
  FAILED: 'error',
};

export default function Notifications() {
  const [rows, setRows] = useState<NotificationRecord[]>([]);
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    listEventNotifications({ status, channel })
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [status, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: GridColDef<NotificationRecord>[] = [
    { field: 'channel', headerName: 'Channel', width: 90 },
    { field: 'notification_type', headerName: 'Type', width: 190 },
    { field: 'recipient', headerName: 'Recipient', flex: 1, minWidth: 180 },
    { field: 'subject', headerName: 'Subject', flex: 1, minWidth: 200 },
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
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>Notifications</Typography>
      <Typography variant="body2" color="text.secondary">
        Delivery log for every confirmation/receipt email and SMS this event has attempted to send.
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Stack direction="row" spacing={2}>
        <Select size="small" value={channel} onChange={(e) => setChannel(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
          <MenuItem value="">All channels</MenuItem>
          <MenuItem value="EMAIL">Email</MenuItem>
          <MenuItem value="SMS">SMS</MenuItem>
        </Select>
        <Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="SENT">Sent</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
        </Select>
      </Stack>

      <Box sx={{ height: 560 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick />
      </Box>
    </Stack>
  );
}
