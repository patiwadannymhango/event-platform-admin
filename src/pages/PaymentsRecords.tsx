import { useEffect, useState } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { listPayments, refundPayment } from '../api/payments';
import type { AdminPayment } from '../types';

export default function PaymentsRecords() {
  const [rows, setRows] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function load() {
    setLoading(true);
    listPayments().then((d) => setRows(d.results)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRefund(id: string) {
    if (!confirm('Refund this payment in full?')) return;
    try {
      await refundPayment(id);
      setNotice('Refund processed.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refund failed.');
    }
  }

  const columns: GridColDef<AdminPayment>[] = [
    { field: 'reference', headerName: 'Reference', width: 160 },
    { field: 'participant_name', headerName: 'Runner', flex: 1, minWidth: 150 },
    { field: 'amount', headerName: 'Amount', width: 100, valueFormatter: (v) => `K${v}` },
    { field: 'status', headerName: 'Status', width: 110 },
    { field: 'payment_method', headerName: 'Method', width: 140 },
    {
      field: 'actions', headerName: '', width: 100, sortable: false, filterable: false,
      renderCell: (params) =>
        params.row.status === 'SUCCESS' ? (
          <Button size="small" color="error" onClick={() => handleRefund(params.row.id)}>Refund</Button>
        ) : null,
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>Payments</Typography>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
      <Box sx={{ height: 560 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick />
      </Box>
    </Stack>
  );
}
