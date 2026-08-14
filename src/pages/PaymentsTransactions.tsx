import { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { listTransactions } from '../api/payments';
import type { AdminTransaction } from '../types';

const columns: GridColDef<AdminTransaction>[] = [
  { field: 'reference', headerName: 'Reference', width: 160 },
  { field: 'transaction_type', headerName: 'Type', width: 130 },
  { field: 'direction', headerName: 'Direction', width: 100 },
  { field: 'amount', headerName: 'Amount', width: 110, valueFormatter: (v) => `K${v}` },
  { field: 'status', headerName: 'Status', width: 110 },
  { field: 'description', headerName: 'Description', flex: 1, minWidth: 180 },
  {
    field: 'created_at', headerName: 'Date', width: 140,
    valueFormatter: (v) => new Date(v as string).toLocaleDateString(),
  },
];

export default function PaymentsTransactions() {
  const [rows, setRows] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTransactions().then((d) => setRows(d.results)).finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>Ledger transactions</Typography>
      <Box sx={{ height: 560 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick />
      </Box>
    </Stack>
  );
}
