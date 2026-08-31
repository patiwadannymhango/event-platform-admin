import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { updateRegistrationDetails, updateRegistrationStatus } from '../api/registrations';
import type { AdminRegistration } from '../types';
import { STATUS_OPTIONS } from '../types';
import { GENDER_OPTIONS, AGE_RANGE_OPTIONS, TSHIRT_SIZE_OPTIONS, ATTENDANCE_TYPE_OPTIONS } from '../utils/formOptions';

interface RegistrationDetailDialogProps {
  registration: AdminRegistration | null;
  onClose: () => void;
  onSaved: () => void;
  canManage: boolean;
}

interface EditableFields {
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  age_range: string;
  country: string;
  tshirt_size: string;
  attendance_type: string;
  club_or_institution: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_notes: string;
}

function fieldsFromRegistration(reg: AdminRegistration): EditableFields {
  return {
    first_name: reg.participant.first_name,
    last_name: reg.participant.last_name,
    phone: reg.participant.phone,
    gender: reg.form_data.gender || '',
    age_range: reg.form_data.age_range || '',
    country: reg.form_data.country || '',
    tshirt_size: reg.form_data.tshirt_size || '',
    attendance_type: reg.form_data.attendance_type || '',
    club_or_institution: reg.form_data.club_or_institution || '',
    emergency_contact_name: reg.form_data.emergency_contact_name || '',
    emergency_contact_phone: reg.form_data.emergency_contact_phone || '',
    medical_notes: reg.form_data.medical_notes || '',
  };
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
    </Box>
  );
}

export default function RegistrationDetailDialog({
  registration,
  onClose,
  onSaved,
  canManage,
}: RegistrationDetailDialogProps) {
  const [status, setStatus] = useState('');
  const [fields, setFields] = useState<EditableFields | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (registration) {
      setStatus(registration.status);
      setFields(fieldsFromRegistration(registration));
      setError('');
    }
  }, [registration]);

  if (!registration || !fields) return null;

  function updateField<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    setFields((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const statusChanged = status !== registration!.status;
  const original = fieldsFromRegistration(registration!);
  const fieldsChanged = JSON.stringify(fields) !== JSON.stringify(original);
  const hasChanges = statusChanged || fieldsChanged;

  async function handleSave() {
    if (!registration) return;
    setBusy(true);
    setError('');
    try {
      const calls: Promise<unknown>[] = [];
      if (statusChanged) calls.push(updateRegistrationStatus(registration.id, status));
      if (fieldsChanged && fields) calls.push(updateRegistrationDetails(registration.id, fields));
      await Promise.all(calls);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!registration} onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registration — {registration.registration_number}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}><ReadOnlyField label="Category" value={registration.category_name} /></Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Amount" value={`${registration.currency} ${registration.amount}`} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Payment ref. (Lipila)" value={registration.payment_reference} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Registered" value={new Date(registration.registered_at).toLocaleString()} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Source" value={registration.created_via_display} />
            </Grid>
            {registration.created_by && (
              <Grid item xs={6} sm={3}>
                <ReadOnlyField
                  label="Created by"
                  value={`${registration.created_by.full_name} (${registration.created_by.email})`}
                />
              </Grid>
            )}
          </Grid>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Status</Typography>
            {canManage ? (
              <Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220 }}>
                {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            ) : (
              <Typography variant="body2" fontWeight={600}>{registration.status}</Typography>
            )}
          </Box>

          <Divider />

          <Typography variant="subtitle2" fontWeight={700}>Participant</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First name" fullWidth size="small" value={fields.first_name} disabled={!canManage}
                onChange={(e) => updateField('first_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last name" fullWidth size="small" value={fields.last_name} disabled={!canManage}
                onChange={(e) => updateField('last_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth size="small" value={registration.participant.email} disabled
                helperText="Email can't be changed after registration." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone" fullWidth size="small" value={fields.phone} disabled={!canManage}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider />

          <Typography variant="subtitle2" fontWeight={700}>Additional details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Gender" fullWidth size="small" value={fields.gender} disabled={!canManage}
                onChange={(e) => updateField('gender', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {GENDER_OPTIONS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Age range" fullWidth size="small" value={fields.age_range} disabled={!canManage}
                onChange={(e) => updateField('age_range', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {AGE_RANGE_OPTIONS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country" fullWidth size="small" value={fields.country} disabled={!canManage}
                onChange={(e) => updateField('country', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="T-shirt size" fullWidth size="small" value={fields.tshirt_size} disabled={!canManage}
                onChange={(e) => updateField('tshirt_size', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {TSHIRT_SIZE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Attendance type" fullWidth size="small" value={fields.attendance_type} disabled={!canManage}
                onChange={(e) => updateField('attendance_type', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {ATTENDANCE_TYPE_OPTIONS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Club / institution" fullWidth size="small" value={fields.club_or_institution} disabled={!canManage}
                onChange={(e) => updateField('club_or_institution', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Emergency contact name" fullWidth size="small" value={fields.emergency_contact_name} disabled={!canManage}
                onChange={(e) => updateField('emergency_contact_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Emergency contact phone" fullWidth size="small" value={fields.emergency_contact_phone} disabled={!canManage}
                onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Medical notes" fullWidth size="small" multiline minRows={2} value={fields.medical_notes} disabled={!canManage}
                onChange={(e) => updateField('medical_notes', e.target.value)}
              />
            </Grid>
          </Grid>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Close</Button>
        {canManage && (
          <Button variant="contained" onClick={handleSave} disabled={busy || !hasChanges}>
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
