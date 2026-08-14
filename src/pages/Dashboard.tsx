import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography, Chip, Alert } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { getDashboard, getWalletBalance } from '../api/payments';
import { listRegistrations } from '../api/registrations';
import type { DashboardStats, WalletBalance, AdminRegistration } from '../types';

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card variant="outlined" sx={{ borderColor: highlight ? 'primary.main' : undefined }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={800} color={highlight ? 'primary.light' : 'text.primary'}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

const columns: GridColDef<AdminRegistration>[] = [
  { field: 'registration_number', headerName: 'Reference', flex: 1, minWidth: 120 },
  {
    field: 'name', headerName: 'Runner', flex: 1.2, minWidth: 140,
    valueGetter: (_value, row) => `${row.participant.first_name} ${row.participant.last_name}`,
  },
  { field: 'category_name', headerName: 'Category', flex: 1, minWidth: 130 },
  {
    field: 'amount', headerName: 'Amount', width: 110,
    valueFormatter: (value) => `K${value}`,
  },
  {
    field: 'status', headerName: 'Status', width: 150,
    renderCell: (params) => <Chip label={params.value} size="small" />,
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [recent, setRecent] = useState<AdminRegistration[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getWalletBalance(),
      listRegistrations({ ordering: '-registered_at', page: 1 }),
    ])
      .then(([s, b, r]) => {
        setStats(s);
        setBalance(b);
        setRecent(r.results.slice(0, 8));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard.'));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats || !balance) return <Typography color="text.secondary">Loading dashboard…</Typography>;

  const statusCount = (status: string) =>
    stats.by_status.find((s) => s.status === status)?.count ?? 0;

  const pieData = stats.by_status
    .filter((s) => s.count > 0)
    .map((s, i) => ({ id: i, value: s.count, label: s.status }));

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={800}>Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid xs={12} sm={6} md={4}>
          <StatCard label="Total registrations" value={String(stats.total_registrations)} />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard label="Confirmed" value={String(statusCount('CONFIRMED'))} />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard
            label="Pending / awaiting payment"
            value={String(
              statusCount('PENDING_PAYMENT') + statusCount('RESERVED') + statusCount('PAYMENT_PROCESSING')
            )}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard label="Revenue collected" value={`K${stats.revenue_confirmed}`} />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard label="Revenue pending" value={`K${stats.revenue_pending}`} />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard label="Wallet balance (ledger)" value={`K${balance.ledger_balance}`} highlight />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid xs={12} md={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Registrations by status</Typography>
              {pieData.length > 0 ? (
                <PieChart
                  series={[{ data: pieData, innerRadius: 40, paddingAngle: 2 }]}
                  height={240}
                  slotProps={{ legend: { direction: 'column' } }}
                />
              ) : (
                <Typography color="text.secondary" variant="body2">No data yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={7}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Revenue: collected vs pending</Typography>
              <BarChart
                height={240}
                xAxis={[{ data: ['Revenue'], scaleType: 'band' }]}
                series={[
                  { data: [Number(stats.revenue_confirmed)], label: 'Collected', color: '#6FD498' },
                  { data: [Number(stats.revenue_pending)], label: 'Pending', color: '#D97B3F' },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Recent registrations</Typography>
          <Box sx={{ height: 380 }}>
            <DataGrid
              rows={recent}
              columns={columns}
              hideFooter
              disableRowSelectionOnClick
              density="compact"
            />
          </Box>
        </CardContent>
      </Card>

      {!balance.live_balance && (
        <Alert severity="info">
          Live Lipila balance unavailable{balance.live_balance_error ? `: ${balance.live_balance_error}` : '.'} Showing ledger balance instead.
        </Alert>
      )}
    </Stack>
  );
}
