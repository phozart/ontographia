// components/dwd/ExperimentTracker.js
// Enhanced experiment tracking for adjustments with timeline, observations, and criteria

import { useState, useCallback } from 'react';
import { useDWD } from './DWDContext';

// MUI
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TimerIcon from '@mui/icons-material/Timer';
import ExtensionIcon from '@mui/icons-material/Extension';
import UndoIcon from '@mui/icons-material/Undo';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { DWD_ADJUSTMENT_STATUS, DWD_REVERSIBILITY_LEVELS } from '../../../lib/dwd-types';

const STATUS_CONFIG = {
  proposed: { color: '#9ca3af', label: 'Proposed', icon: ScienceIcon },
  trying: { color: '#f59e0b', label: 'Trying', icon: PlayArrowIcon },
  adopted: { color: '#10b981', label: 'Adopted', icon: CheckCircleIcon },
  reverted: { color: '#ef4444', label: 'Reverted', icon: UndoIcon },
};

export default function ExperimentTracker({
  adjustment,
  open,
  onClose,
  onUpdate,
}) {
  const { updateArtefact, createArtefact, createRelationship } = useDWD();

  const [observations, setObservations] = useState(
    adjustment?.custom_fields?.observations || []
  );
  const [newObservation, setNewObservation] = useState('');
  const [showObservationDialog, setShowObservationDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calculate experiment progress
  const startDate = adjustment?.custom_fields?.experiment_start_date
    ? new Date(adjustment.custom_fields.experiment_start_date)
    : null;
  const durationDays = adjustment?.custom_fields?.experiment_duration_days || 14;
  const endDate = startDate ? new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000) : null;
  const now = new Date();

  const daysElapsed = startDate ? Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) : 0;
  const progress = Math.min(100, Math.round((daysElapsed / durationDays) * 100));
  const daysRemaining = Math.max(0, durationDays - daysElapsed);

  const status = adjustment?.custom_fields?.adjustment_status || 'proposed';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.proposed;
  const StatusIcon = statusConfig.icon;

  // Handlers
  const handleAddObservation = useCallback(async () => {
    if (!newObservation.trim() || !adjustment?.id) return;

    setSaving(true);
    const newObs = {
      id: Date.now(),
      text: newObservation.trim(),
      date: new Date().toISOString(),
      day: daysElapsed,
    };

    const updatedObservations = [...observations, newObs];

    try {
      await updateArtefact(adjustment.id, {
        custom_fields: {
          ...adjustment.custom_fields,
          observations: updatedObservations,
        },
      });
      setObservations(updatedObservations);
      setNewObservation('');
      setShowObservationDialog(false);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to add observation:', err);
    } finally {
      setSaving(false);
    }
  }, [newObservation, observations, adjustment, updateArtefact, daysElapsed, onUpdate]);

  const handleStartExperiment = useCallback(async () => {
    if (!adjustment?.id) return;

    setSaving(true);
    try {
      await updateArtefact(adjustment.id, {
        custom_fields: {
          ...adjustment.custom_fields,
          adjustment_status: 'trying',
          experiment_start_date: new Date().toISOString(),
          experiment_duration_days: 14,
        },
      });
      onUpdate?.();
    } catch (err) {
      console.error('Failed to start experiment:', err);
    } finally {
      setSaving(false);
    }
  }, [adjustment, updateArtefact, onUpdate]);

  const handleStatusChange = useCallback(async (newStatus) => {
    if (!adjustment?.id) return;

    setSaving(true);
    try {
      await updateArtefact(adjustment.id, {
        custom_fields: {
          ...adjustment.custom_fields,
          adjustment_status: newStatus,
        },
      });
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSaving(false);
    }
  }, [adjustment, updateArtefact, onUpdate]);

  const handleExtendTrial = useCallback(async () => {
    if (!adjustment?.id) return;

    setSaving(true);
    try {
      await updateArtefact(adjustment.id, {
        custom_fields: {
          ...adjustment.custom_fields,
          experiment_duration_days: durationDays + 7,
        },
      });
      onUpdate?.();
    } catch (err) {
      console.error('Failed to extend trial:', err);
    } finally {
      setSaving(false);
    }
  }, [adjustment, durationDays, updateArtefact, onUpdate]);

  const handleCaptureLearning = useCallback(async () => {
    if (!adjustment?.id) return;

    try {
      const learning = await createArtefact('dwd_learning', {
        name: `Learning from: ${adjustment.name}`,
        description: '',
        custom_fields: {
          observation: observations.map(o => o.text).join('\n'),
          outcome: status === 'adopted' ? 'Experiment successful' : status === 'reverted' ? 'Experiment reverted' : 'Ongoing',
          confidence: 'medium',
        },
      });

      if (learning?.id) {
        await createRelationship(adjustment.id, learning.id, 'adjustment_produced_learning', null);
      }

      onClose?.();
    } catch (err) {
      console.error('Failed to capture learning:', err);
    }
  }, [adjustment, observations, status, createArtefact, createRelationship, onClose]);

  if (!open || !adjustment) return null;

  const successCriteria = adjustment.custom_fields?.success_criteria || [];
  const revertTriggers = adjustment.custom_fields?.revert_triggers || [];
  const reversibility = adjustment.custom_fields?.adjustment_reversibility || 'medium';
  const reversibilityConfig = DWD_REVERSIBILITY_LEVELS.find(r => r.value === reversibility);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ScienceIcon color="primary" />
            <Box>
              <Typography variant="h6">{adjustment.name}</Typography>
              <Chip
                icon={<StatusIcon style={{ color: statusConfig.color }} />}
                label={statusConfig.label}
                size="small"
                sx={{
                  backgroundColor: statusConfig.color + '20',
                  color: statusConfig.color,
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Timeline Progress */}
        {status === 'trying' && startDate && (
          <Paper className="experiment-tracker__timeline" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon fontSize="small" />
                Day {daysElapsed} of {durationDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {daysRemaining} days remaining
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress >= 100 ? '#10b981' : '#f59e0b',
                  borderRadius: 5,
                },
              }}
            />
          </Paper>
        )}

        {/* Hypothesis / Expected Effect */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Hypothesis / Expected Effect
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2">
              {adjustment.custom_fields?.expected_effect || adjustment.description || 'No expected effect specified'}
            </Typography>
          </Paper>
        </Box>

        {/* Success Criteria */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Success Signals
          </Typography>
          {successCriteria.length > 0 ? (
            <List dense>
              {successCriteria.map((criteria, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText primary={criteria} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No success criteria defined. Consider adding what you'll see if this works.
            </Typography>
          )}
        </Box>

        {/* Revert Triggers */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Revert Triggers
          </Typography>
          {revertTriggers.length > 0 ? (
            <List dense>
              {revertTriggers.map((trigger, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <WarningIcon fontSize="small" sx={{ color: '#ef4444' }} />
                  </ListItemIcon>
                  <ListItemText primary={trigger} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No revert triggers defined. What would make you stop this experiment?
            </Typography>
          )}
        </Box>

        {/* Reversibility */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Reversibility
          </Typography>
          <Chip
            label={`${reversibilityConfig?.label || reversibility} - ${reversibilityConfig?.description || ''}`}
            sx={{
              backgroundColor: reversibilityConfig?.color + '20',
              color: reversibilityConfig?.color,
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Observations */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Observations ({observations.length})
            </Typography>
            <Button
              size="small"
              startIcon={<NoteAddIcon />}
              onClick={() => setShowObservationDialog(true)}
            >
              Add Note
            </Button>
          </Box>

          {observations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No observations yet. Add notes as you run the experiment.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {observations.map((obs) => (
                <Paper key={obs.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Day {obs.day} - {new Date(obs.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">{obs.text}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {status === 'proposed' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartExperiment}
            disabled={saving}
          >
            Start Experiment
          </Button>
        )}

        {status === 'trying' && (
          <>
            <Button
              variant="outlined"
              startIcon={<ExtensionIcon />}
              onClick={handleExtendTrial}
              disabled={saving}
            >
              Extend Trial
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleStatusChange('adopted')}
              disabled={saving}
            >
              Adopt
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<UndoIcon />}
              onClick={() => handleStatusChange('reverted')}
              disabled={saving}
            >
              Revert
            </Button>
          </>
        )}

        {(status === 'adopted' || status === 'reverted') && (
          <Button
            variant="contained"
            onClick={handleCaptureLearning}
            disabled={saving}
          >
            Capture Learning
          </Button>
        )}

        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {/* Add Observation Dialog */}
      <Dialog
        open={showObservationDialog}
        onClose={() => setShowObservationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Observation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            label="What did you observe?"
            value={newObservation}
            onChange={(e) => setNewObservation(e.target.value)}
            placeholder="Quick notes about what's happening..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowObservationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddObservation}
            disabled={!newObservation.trim() || saving}
          >
            {saving ? 'Saving...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
