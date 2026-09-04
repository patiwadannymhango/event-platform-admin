import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  commitBulkUpload,
  downloadBulkUploadTemplate,
  previewBulkUpload,
  type BulkUploadReport,
  type BulkUploadRow,
  type RegistrationCategory,
} from '../api/registrations';
import { STATUS_OPTIONS } from '../types';
import { downloadCategoryGuide } from '../utils/categoryGuide';
import { validateRows } from '../utils/bulkUploadValidation';
import { GENDER_OPTIONS, AGE_RANGE_OPTIONS, TSHIRT_SIZE_OPTIONS, ATTENDANCE_TYPE_OPTIONS } from '../utils/formOptions';

interface BulkUploadWizardProps {
  open: boolean;
  onClose: () => void;
  categories: RegistrationCategory[];
  onUploaded: () => void;
}

type Step = 'start' | 'review' | 'done';

// Compact select/text field used inside the review table — same size/variant
// everywhere so the columns line up cleanly.
function Cell({ children }: { children: React.ReactNode }) {
  return <TableCell sx={{ p: 0.5, verticalAlign: 'top' }}>{children}</TableCell>;
}

export default function BulkUploadWizard({ open, onClose, categories, onUploaded }: BulkUploadWizardProps) {
  const [step, setStep] = useState<Step>('start');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [rows, setRows] = useState<BulkUploadRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [finalReport, setFinalReport] = useState<BulkUploadReport | null>(null);
  const [submitError, setSubmitError] = useState('');

  const validations = useMemo(() => validateRows(rows, categories), [rows, categories]);
  const validCount = validations.filter((v) => v.errors.length === 0).length;
  const errorCount = rows.length - validCount;

  function reset() {
    setStep('start');
    setParsing(false);
    setParseError('');
    setRows([]);
    setSubmitting(false);
    setFinalReport(null);
    setSubmitError('');
  }

  function handleClose() {
    if (parsing || submitting) return;
    reset();
    onClose();
  }

  async function handleFileChosen(file: File) {
    setParsing(true);
    setParseError('');
    try {
      const report = await previewBulkUpload(file);
      setRows(report.results.map((r) => r.data ?? {}));
      setStep('review');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not read that file.');
    } finally {
      setParsing(false);
    }
  }

  function updateRow(index: number, patch: Partial<BulkUploadRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDownloadTemplate() {
    const blob = await downloadBulkUploadTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-upload-template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit() {
    const rowsToUpload = rows.filter((_, i) => validations[i].errors.length === 0);
    if (rowsToUpload.length === 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const report = await commitBulkUpload(rowsToUpload);
      setFinalReport(report);
      setStep('done');
      onUploaded();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={step === 'review' ? 'xl' : 'sm'} fullWidth>
      <DialogTitle>Bulk upload registrations</DialogTitle>

      {step === 'start' && (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Download the template, fill it in (one row per person), then upload it here. You'll
                get a chance to review and fix anything before it actually creates registrations —
                nothing is saved until you confirm on the next screen.
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleDownloadTemplate}>
                  Download Excel template
                </Button>
                <Button
                  startIcon={<PictureAsPdfOutlinedIcon />}
                  variant="outlined"
                  onClick={() => downloadCategoryGuide(categories)}
                >
                  Download field &amp; category guide (PDF)
                </Button>
              </Stack>
              <Button component="label" variant="contained" disabled={parsing} sx={{ alignSelf: 'flex-start' }}>
                {parsing ? 'Reading file…' : 'Choose file (CSV or XLSX)'}
                <input
                  type="file"
                  hidden
                  accept=".csv,.xlsx"
                  disabled={parsing}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChosen(file);
                    e.target.value = '';
                  }}
                />
              </Button>
              {parseError && <Alert severity="error">{parseError}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </>
      )}

      {step === 'review' && (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="body2"><strong>{rows.length}</strong> row{rows.length === 1 ? '' : 's'}</Typography>
                <Typography variant="body2" color="success.main">✓ {validCount} ready</Typography>
                {errorCount > 0 && (
                  <Typography variant="body2" color="error.main">⚠ {errorCount} need attention</Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Edit any cell to fix a problem — rows still marked with an error are skipped on upload.
                </Typography>
              </Stack>

              <TableContainer sx={{ maxHeight: 480, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small" stickyHeader sx={{ minWidth: 1900 }}>
                  <TableHead>
                    <TableRow>
                      {['#', 'First name', 'Last name', 'Email', 'Phone', 'Category', 'Status', 'Gender',
                        'Age range', 'Country', 'T-shirt size', 'Attendance', 'Club / institution',
                        'Emergency contact name', 'Emergency contact phone', 'Medical notes', 'Issues', ''].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => {
                      const v = validations[index];
                      return (
                        <TableRow
                          key={index}
                          sx={v.errors.length ? { bgcolor: 'rgba(211,47,47,0.08)' } : undefined}
                        >
                          <Cell>{index + 2}</Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.first_name || ''}
                              onChange={(e) => updateRow(index, { first_name: e.target.value })} sx={{ minWidth: 100 }} />
                          </Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.last_name || ''}
                              onChange={(e) => updateRow(index, { last_name: e.target.value })} sx={{ minWidth: 100 }} />
                          </Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.email || ''}
                              onChange={(e) => updateRow(index, { email: e.target.value })} sx={{ minWidth: 160 }} />
                          </Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.phone || ''}
                              onChange={(e) => updateRow(index, { phone: e.target.value })} sx={{ minWidth: 110 }} />
                          </Cell>
                          <Cell>
                            <TextField select size="small" variant="standard" value={row.category_code || ''}
                              onChange={(e) => updateRow(index, { category_code: e.target.value })} sx={{ minWidth: 140 }}>
                              <MenuItem value="">Select…</MenuItem>
                              {categories.map((c) => (
                                <MenuItem key={c.id} value={c.code}>{c.name} ({c.code})</MenuItem>
                              ))}
                            </TextField>
                          </Cell>
                          <Cell>
                            <TextField select size="small" variant="standard"
                              value={(row.status || 'CONFIRMED').toUpperCase()}
                              onChange={(e) => updateRow(index, { status: e.target.value })} sx={{ minWidth: 150 }}>
                              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </TextField>
                          </Cell>
                          <Cell>
                            <TextField select size="small" variant="standard" value={row.gender || ''}
                              onChange={(e) => updateRow(index, { gender: e.target.value })} sx={{ minWidth: 100 }}>
                              <MenuItem value="">—</MenuItem>
                              {GENDER_OPTIONS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                            </TextField>
                          </Cell>
                          <Cell>
                            <TextField select size="small" variant="standard" value={row.age_range || ''}
                              onChange={(e) => updateRow(index, { age_range: e.target.value })} sx={{ minWidth: 100 }}>
                              <MenuItem value="">—</MenuItem>
                              {AGE_RANGE_OPTIONS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                            </TextField>
                          </Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.country || ''}
                              onChange={(e) => updateRow(index, { country: e.target.value })} sx={{ minWidth: 100 }} />
                          </Cell>
                          <Cell>
                            <TextField select size="small" variant="standard" value={row.tshirt_size || ''}
                              onChange={(e) => updateRow(index, { tshirt_size: e.target.value })} sx={{ minWidth: 90 }}>
                              <MenuItem value="">—</MenuItem>
                              {TSHIRT_SIZE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </TextField>
                          </Cell>
                          <Cell>
                            <TextField select size="small" variant="standard" value={row.attendance_type || ''}
                              onChange={(e) => updateRow(index, { attendance_type: e.target.value })} sx={{ minWidth: 110 }}>
                              <MenuItem value="">—</MenuItem>
                              {ATTENDANCE_TYPE_OPTIONS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
                            </TextField>
                          </Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.club_or_institution || ''}
                              onChange={(e) => updateRow(index, { club_or_institution: e.target.value })} sx={{ minWidth: 130 }} />
                          </Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.emergency_contact_name || ''}
                              onChange={(e) => updateRow(index, { emergency_contact_name: e.target.value })} sx={{ minWidth: 140 }} />
                          </Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.emergency_contact_phone || ''}
                              onChange={(e) => updateRow(index, { emergency_contact_phone: e.target.value })} sx={{ minWidth: 140 }} />
                          </Cell>
                          <Cell>
                            <TextField size="small" variant="standard" value={row.medical_notes || ''}
                              onChange={(e) => updateRow(index, { medical_notes: e.target.value })} sx={{ minWidth: 130 }} />
                          </Cell>
                          <Cell>
                            <Box sx={{ minWidth: 180 }}>
                              {v.errors.length === 0 && v.warnings.length === 0 && (
                                <Typography variant="caption" color="success.main">✓ OK</Typography>
                              )}
                              {v.errors.map((e, i) => (
                                <Typography key={`e${i}`} variant="caption" color="error.main" display="block">{e}</Typography>
                              ))}
                              {v.warnings.map((w, i) => (
                                <Typography key={`w${i}`} variant="caption" color="warning.main" display="block">{w}</Typography>
                              ))}
                            </Box>
                          </Cell>
                          <Cell>
                            <IconButton size="small" title="Remove this row" onClick={() => removeRow(index)}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Cell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {submitError && <Alert severity="error">{submitError}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStep('start')} disabled={submitting}>‹ Back</Button>
            <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button variant="contained" color="success" onClick={handleSubmit} disabled={submitting || validCount === 0}>
              {submitting ? 'Uploading…' : `Upload ${validCount} valid registration${validCount === 1 ? '' : 's'}`}
            </Button>
          </DialogActions>
        </>
      )}

      {step === 'done' && finalReport && (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Alert severity="success">
                Created {finalReport.created_count} registration{finalReport.created_count === 1 ? '' : 's'}.
              </Alert>
              {finalReport.error_count > 0 && (
                <Alert severity="error">
                  {finalReport.error_count} row{finalReport.error_count === 1 ? '' : 's'} still failed on
                  submit — a category or setting may have changed since you reviewed it:
                  <Box component="ul" sx={{ m: '8px 0 0', pl: 2.25 }}>
                    {finalReport.errors.map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                  </Box>
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="success" onClick={handleClose}>Done</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
