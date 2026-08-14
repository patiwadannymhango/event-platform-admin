import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getWalletBalance, sendMoney, withdraw } from '../api/payments';
import type { WalletBalance } from '../types';
import { useAuth } from '../context/AuthContext';
import { EVENT_FINANCE_ROLES } from '../roles';

export default function PaymentsOverview() {
  const { hasRole } = useAuth();
  const canManageFunds = hasRole(...EVENT_FINANCE_ROLES);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawBusy, setWithdrawBusy] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '', destination: 'MOBILE_MONEY', destination_account: '', recipient_name: '', narration: '',
  });

  const [sendOpen, setSendOpen] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [sendForm, setSendForm] = useState({
    amount: '', account_number: '', recipient_name: '', narration: '',
  });

  function loadBalance() {
    getWalletBalance().then(setBalance).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'));
  }

  useEffect(loadBalance, []);

  async function handleWithdraw() {
    setWithdrawBusy(true);
    setError('');
    try {
      await withdraw({
        ...withdrawForm,
        destination: withdrawForm.destination as 'MOBILE_MONEY' | 'BANK' | 'CASH',
      });
      setNotice('Withdrawal submitted.');
      setWithdrawOpen(false);
      setWithdrawForm({ amount: '', destination: 'MOBILE_MONEY', destination_account: '', recipient_name: '', narration: '' });
      loadBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed.');
    } finally {
      setWithdrawBusy(false);
    }
  }

  async function handleSendMoney() {
    setSendBusy(true);
    setError('');
    try {
      await sendMoney(sendForm);
      setNotice('Money sent.');
      setSendOpen(false);
      setSendForm({ amount: '', account_number: '', recipient_name: '', narration: '' });
      loadBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send money failed.');
    } finally {
      setSendBusy(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>Wallet</Typography>
        {canManageFunds && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setWithdrawOpen(true)}>Withdraw</Button>
            <Button variant="contained" onClick={() => setSendOpen(true)}>Send money</Button>
          </Stack>
        )}
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      {balance && (
        <Grid container spacing={2}>
          <Grid xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderColor: 'primary.main' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Ledger balance</Typography>
                <Typography variant="h4" fontWeight={800} color="primary.light">K{balance.ledger_balance}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="overline" color="text.secondary">Pending balance</Typography>
                <Typography variant="h4" fontWeight={800}>K{balance.pending_balance}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="overline" color="text.secondary">Live Lipila balance</Typography>
                {balance.live_balance ? (
                  <pre style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(balance.live_balance, null, 2)}
                  </pre>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {balance.live_balance_error || 'Unavailable'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Withdraw modal */}
      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Withdraw funds</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Amount (ZMW)" value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} fullWidth />
            <TextField select label="Destination" value={withdrawForm.destination}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, destination: e.target.value })} fullWidth>
              <MenuItem value="MOBILE_MONEY">Mobile money</MenuItem>
              <MenuItem value="BANK">Bank account</MenuItem>
              <MenuItem value="CASH">Cash (record only)</MenuItem>
            </TextField>
            <TextField label="Account / phone number" value={withdrawForm.destination_account}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, destination_account: e.target.value })} fullWidth />
            <TextField label="Recipient name" value={withdrawForm.recipient_name}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, recipient_name: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleWithdraw} disabled={withdrawBusy || !withdrawForm.amount}>
            {withdrawBusy ? 'Processing…' : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send money modal */}
      <Dialog open={sendOpen} onClose={() => setSendOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Send money</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ad-hoc mobile money payout (suppliers, corrections, etc.)
          </Typography>
          <Stack spacing={2}>
            <TextField label="Amount (ZMW)" value={sendForm.amount}
              onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })} fullWidth />
            <TextField label="Phone number" value={sendForm.account_number}
              onChange={(e) => setSendForm({ ...sendForm, account_number: e.target.value })} fullWidth />
            <TextField label="Recipient name" value={sendForm.recipient_name}
              onChange={(e) => setSendForm({ ...sendForm, recipient_name: e.target.value })} fullWidth />
            <TextField label="Narration" value={sendForm.narration}
              onChange={(e) => setSendForm({ ...sendForm, narration: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendMoney} disabled={sendBusy || !sendForm.amount}>
            {sendBusy ? 'Sending…' : 'Send money'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
