import { useEffect, useState } from 'react';
import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { listEventParticipants } from '../api/participants';
import type { ParticipantRecord } from '../api/participants';

export default function Participants() {
  const [rows, setRows] = useState<ParticipantRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    listEventParticipants(search)
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: GridColDef<ParticipantRecord>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      valueGetter: (_value, row) => `${row.first_name} ${row.last_name}`,
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { field: 'registration_count', headerName: 'Registrations', width: 130, type: 'number' },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>Participants</Typography>
      <Typography variant="body2" color="text.secondary">
        Everyone who has registered for this event — a person may appear once even if they
        hold multiple registrations.
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Stack direction="row" spacing={2}>
        <TextField
          size="small"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          sx={{ flex: 1, maxWidth: 360 }}
        />
      </Stack>

      <Box sx={{ height: 560 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick />
      </Box>
    </Stack>
  );
}
