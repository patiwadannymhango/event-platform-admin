import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { changePassword, getMe, updateProfile } from '../api/profile';
import type { AdminUser, Organization } from '../api/profile';

export default function Profile() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    getMe()
      .then(({ user, organizations }) => {
        setUser(user);
        setOrganizations(organizations);
        setProfileForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile.'));
  }, []);

  async function handleSaveProfile() {
    setSavingProfile(true);
    setError('');
    try {
      const updated = await updateProfile(profileForm);
      setUser(updated);
      setNotice('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError('');
    if (passwordForm.new_password !== passwordForm.confirm) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setNotice('Password updated.');
      setPasswordForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  }

  if (error && !user) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Typography color="text.secondary">Loading profile…</Typography>;

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <Stack spacing={3} maxWidth={720}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}>{initials}</Avatar>
        <Box>
          <Typography variant="h5" fontWeight={800}>{user.full_name || user.email}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Profile details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="First name" fullWidth value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Last name" fullWidth value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" fullWidth value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth value={user.email} disabled
                helperText="Contact a superuser to change your email" />
            </Grid>
          </Grid>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Change password</Typography>
          <Stack spacing={2}>
            <TextField label="Current password" type="password" fullWidth
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
            <TextField label="New password" type="password" fullWidth
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
            <TextField label="Confirm new password" type="password" fullWidth
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
          </Stack>
          {passwordError && <Alert severity="error" sx={{ mt: 2 }}>{passwordError}</Alert>}
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={handleChangePassword}
            disabled={savingPassword || !passwordForm.current_password || !passwordForm.new_password}
          >
            {savingPassword ? 'Updating…' : 'Update password'}
          </Button>
        </CardContent>
      </Card>

      {organizations.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Organization access</Typography>
            <Stack spacing={1.5}>
              {organizations.map((org) => (
                <Box key={org.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={600}>{org.name}</Typography>
                    <Chip label={org.role} size="small" />
                  </Stack>
                  {org.events.map((ev) => (
                    <Stack key={ev.id} direction="row" spacing={1} alignItems="center" sx={{ pl: 2, mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">{ev.name}</Typography>
                      <Chip label={ev.role} size="small" variant="outlined" />
                    </Stack>
                  ))}
                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
