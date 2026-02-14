// components/dwd/DiagnosticWizard.js
// Multi-step guided diagnostic wizard for DWD based on MIT's Dynamic Work Design
// Helps users diagnose work system problems step by step

import { useState, useCallback } from 'react';

// MUI
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningIcon from '@mui/icons-material/Warning';
import BugReportIcon from '@mui/icons-material/BugReport';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import GroupsIcon from '@mui/icons-material/Groups';
import ComputerIcon from '@mui/icons-material/Computer';

import { DWD_SIGNAL_TYPES, DWD_WORK_ITEM_TYPES, DWD_ACTOR_TYPES } from '../../../lib/dwd-types';

const STEPS = [
  { label: 'Describe Situation', key: 'situation' },
  { label: 'Work Items', key: 'workItems' },
  { label: 'Actors', key: 'actors' },
  { label: 'Signals', key: 'signals' },
  { label: 'Review & Create', key: 'review' },
];

const WORK_ITEM_TYPE_ICONS = {
  decision: GavelIcon,
  risk: WarningIcon,
  incident_cluster: BugReportIcon,
  customer_situation: PersonIcon,
  change_request: EditIcon,
};

const ACTOR_TYPE_ICONS = {
  person: PersonIcon,
  team: GroupsIcon,
  system: ComputerIcon,
};

export default function DiagnosticWizard({
  open,
  onClose,
  onComplete,
  createArtefact,
  createRelationship,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [creating, setCreating] = useState(false);

  // Form state for all steps
  const [formData, setFormData] = useState({
    // Step 1: Situation
    situationName: '',
    situationDescription: '',

    // Step 2: Work Items
    workItems: [],

    // Step 3: Actors
    actors: [],

    // Step 4: Signals
    selectedSignals: [],
    signalDetails: {},
  });

  // Temporary state for adding items
  const [newWorkItem, setNewWorkItem] = useState({ name: '', type: 'decision', volatility: 'medium' });
  const [newActor, setNewActor] = useState({ name: '', type: 'person', authority: 'medium' });

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Work Item management
  const addWorkItem = () => {
    if (!newWorkItem.name.trim()) return;
    updateFormData('workItems', [...formData.workItems, { ...newWorkItem, id: Date.now() }]);
    setNewWorkItem({ name: '', type: 'decision', volatility: 'medium' });
  };

  const removeWorkItem = (id) => {
    updateFormData('workItems', formData.workItems.filter(w => w.id !== id));
  };

  // Actor management
  const addActor = () => {
    if (!newActor.name.trim()) return;
    updateFormData('actors', [...formData.actors, { ...newActor, id: Date.now() }]);
    setNewActor({ name: '', type: 'person', authority: 'medium' });
  };

  const removeActor = (id) => {
    updateFormData('actors', formData.actors.filter(a => a.id !== id));
  };

  // Signal management
  const toggleSignal = (signalType) => {
    const current = formData.selectedSignals;
    if (current.includes(signalType)) {
      updateFormData('selectedSignals', current.filter(s => s !== signalType));
    } else {
      updateFormData('selectedSignals', [...current, signalType]);
    }
  };

  const updateSignalDetail = (signalType, detail) => {
    updateFormData('signalDetails', { ...formData.signalDetails, [signalType]: detail });
  };

  // Create all artefacts
  const handleComplete = useCallback(async () => {
    if (!createArtefact) return;

    setCreating(true);
    try {
      // 1. Create the case (work situation)
      const caseArtefact = await createArtefact('dwd_case', {
        name: formData.situationName,
        description: formData.situationDescription,
        status: 'active',
        custom_fields: {
          created_via: 'diagnostic_wizard',
        },
      });

      if (!caseArtefact?.id) {
        throw new Error('Failed to create case');
      }

      // 2. Create work items and link to case
      const createdWorkItems = [];
      for (const workItem of formData.workItems) {
        const wi = await createArtefact('dwd_work_item', {
          name: workItem.name,
          description: '',
          custom_fields: {
            item_type: workItem.type,
            volatility: workItem.volatility,
            item_state: 'open',
          },
        });
        if (wi?.id) {
          createdWorkItems.push(wi);
          await createRelationship(caseArtefact.id, wi.id, 'case_has_work_item', null);
        }
      }

      // 3. Create actors and link to case
      const createdActors = [];
      for (const actor of formData.actors) {
        const a = await createArtefact('dwd_actor', {
          name: actor.name,
          description: '',
          custom_fields: {
            actor_type: actor.type,
            authority_level: actor.authority,
          },
        });
        if (a?.id) {
          createdActors.push(a);
          await createRelationship(caseArtefact.id, a.id, 'case_has_actor', null);
        }
      }

      // 4. Create signals and link to case
      for (const signalType of formData.selectedSignals) {
        const signalDef = DWD_SIGNAL_TYPES.find(s => s.value === signalType);
        const signal = await createArtefact('dwd_signal', {
          name: signalDef?.label || signalType,
          description: formData.signalDetails[signalType] || '',
          custom_fields: {
            signal_type: signalType,
            frequency: 'frequent',
            impact: 'medium',
          },
        });
        if (signal?.id) {
          await createRelationship(caseArtefact.id, signal.id, 'case_has_signal', null);
        }
      }

      // Complete and close
      onComplete?.(caseArtefact);
      onClose?.();

      // Reset form
      setFormData({
        situationName: '',
        situationDescription: '',
        workItems: [],
        actors: [],
        selectedSignals: [],
        signalDetails: {},
      });
      setActiveStep(0);

    } catch (err) {
      console.error('Failed to create case:', err);
      alert('Failed to create case: ' + err.message);
    } finally {
      setCreating(false);
    }
  }, [formData, createArtefact, createRelationship, onComplete, onClose]);

  // Validation
  const canProceed = () => {
    switch (activeStep) {
      case 0: // Situation
        return formData.situationName.trim().length > 0;
      case 1: // Work Items
        return formData.workItems.length > 0;
      case 2: // Actors
        return formData.actors.length > 0;
      case 3: // Signals
        return true; // Signals are optional
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  if (!open) return null;

  return (
    <Box className="dwd-wizard-overlay">
      <Paper className="dwd-wizard-container">
        {/* Header */}
        <Box className="dwd-wizard-header">
          <Typography variant="h5">Diagnostic Wizard</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} className="dwd-wizard-stepper">
          {STEPS.map((step) => (
            <Step key={step.key}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Content */}
        <Box className="dwd-wizard-content">
          {/* Step 1: Describe Situation */}
          {activeStep === 0 && (
            <Box className="dwd-wizard-step">
              <Typography variant="h6" gutterBottom>
                What work isn't flowing well?
              </Typography>

              <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 3 }}>
                Focus on the situation, not blame. Describe what's happening without naming individuals as the problem.
              </Alert>

              <TextField
                label="Situation Name"
                value={formData.situationName}
                onChange={(e) => updateFormData('situationName', e.target.value)}
                fullWidth
                placeholder="e.g., Customer refund delays"
                sx={{ mb: 2 }}
              />

              <TextField
                label="Description"
                value={formData.situationDescription}
                onChange={(e) => updateFormData('situationDescription', e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="Describe what's happening. What symptoms are you seeing? What's the impact?"
              />
            </Box>
          )}

          {/* Step 2: Work Items */}
          {activeStep === 1 && (
            <Box className="dwd-wizard-step">
              <Typography variant="h6" gutterBottom>
                What do people coordinate around?
              </Typography>

              <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 3 }}>
                Work items are NOT tasks. They're the objects that trigger coordination: decisions, incidents, requests, situations that need handling.
              </Alert>

              {/* Add work item form */}
              <Box className="dwd-wizard-add-form">
                <TextField
                  label="Work Item Name"
                  value={newWorkItem.name}
                  onChange={(e) => setNewWorkItem(prev => ({ ...prev, name: e.target.value }))}
                  size="small"
                  sx={{ flex: 1 }}
                  onKeyPress={(e) => e.key === 'Enter' && addWorkItem()}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newWorkItem.type}
                    onChange={(e) => setNewWorkItem(prev => ({ ...prev, type: e.target.value }))}
                    label="Type"
                  >
                    {DWD_WORK_ITEM_TYPES.map(t => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel>Volatility</InputLabel>
                  <Select
                    value={newWorkItem.volatility}
                    onChange={(e) => setNewWorkItem(prev => ({ ...prev, volatility: e.target.value }))}
                    label="Volatility"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={addWorkItem}
                  disabled={!newWorkItem.name.trim()}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>

              {/* Work items list */}
              <Box className="dwd-wizard-items-list">
                {formData.workItems.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No work items added yet. Add at least one.
                  </Typography>
                ) : (
                  formData.workItems.map(item => {
                    const TypeIcon = WORK_ITEM_TYPE_ICONS[item.type] || EditIcon;
                    return (
                      <Paper key={item.id} className="dwd-wizard-item-card">
                        <Box className="dwd-wizard-item-icon">
                          <TypeIcon />
                        </Box>
                        <Box className="dwd-wizard-item-content">
                          <Typography variant="subtitle2">{item.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip label={item.type.replace('_', ' ')} size="small" />
                            <Chip
                              label={item.volatility}
                              size="small"
                              color={item.volatility === 'high' ? 'error' : item.volatility === 'medium' ? 'warning' : 'success'}
                            />
                          </Box>
                        </Box>
                        <IconButton size="small" onClick={() => removeWorkItem(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    );
                  })
                )}
              </Box>
            </Box>
          )}

          {/* Step 3: Actors */}
          {activeStep === 2 && (
            <Box className="dwd-wizard-step">
              <Typography variant="h6" gutterBottom>
                Who is involved?
              </Typography>

              <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 3 }}>
                Who touches this work? People, teams, or systems that handle, decide on, or process the work items.
              </Alert>

              {/* Add actor form */}
              <Box className="dwd-wizard-add-form">
                <TextField
                  label="Actor Name"
                  value={newActor.name}
                  onChange={(e) => setNewActor(prev => ({ ...prev, name: e.target.value }))}
                  size="small"
                  sx={{ flex: 1 }}
                  onKeyPress={(e) => e.key === 'Enter' && addActor()}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newActor.type}
                    onChange={(e) => setNewActor(prev => ({ ...prev, type: e.target.value }))}
                    label="Type"
                  >
                    {DWD_ACTOR_TYPES.map(t => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel>Authority</InputLabel>
                  <Select
                    value={newActor.authority}
                    onChange={(e) => setNewActor(prev => ({ ...prev, authority: e.target.value }))}
                    label="Authority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={addActor}
                  disabled={!newActor.name.trim()}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>

              {/* Actors list */}
              <Box className="dwd-wizard-items-list">
                {formData.actors.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No actors added yet. Add at least one.
                  </Typography>
                ) : (
                  formData.actors.map(actor => {
                    const TypeIcon = ACTOR_TYPE_ICONS[actor.type] || PersonIcon;
                    return (
                      <Paper key={actor.id} className="dwd-wizard-item-card">
                        <Box className="dwd-wizard-item-icon">
                          <TypeIcon />
                        </Box>
                        <Box className="dwd-wizard-item-content">
                          <Typography variant="subtitle2">{actor.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip label={actor.type} size="small" />
                            <Chip
                              label={`Authority: ${actor.authority}`}
                              size="small"
                              color={actor.authority === 'high' ? 'success' : actor.authority === 'medium' ? 'warning' : 'default'}
                            />
                          </Box>
                        </Box>
                        <IconButton size="small" onClick={() => removeActor(actor.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    );
                  })
                )}
              </Box>
            </Box>
          )}

          {/* Step 4: Signals */}
          {activeStep === 3 && (
            <Box className="dwd-wizard-step">
              <Typography variant="h6" gutterBottom>
                What signals do you see?
              </Typography>

              <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 3 }}>
                Signals are evidence of stress in the work system. They're symptoms that something isn't fitting well.
              </Alert>

              <Box className="dwd-wizard-signals-grid">
                {DWD_SIGNAL_TYPES.map(signal => (
                  <Paper
                    key={signal.value}
                    className={`dwd-wizard-signal-card ${formData.selectedSignals.includes(signal.value) ? 'selected' : ''}`}
                    onClick={() => toggleSignal(signal.value)}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.selectedSignals.includes(signal.value)}
                          onChange={() => toggleSignal(signal.value)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">{signal.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {signal.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0 }}
                    />

                    {formData.selectedSignals.includes(signal.value) && (
                      <TextField
                        label="Details (optional)"
                        value={formData.signalDetails[signal.value] || ''}
                        onChange={(e) => updateSignalDetail(signal.value, e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mt: 1 }}
                        placeholder="Where do you see this? How often?"
                      />
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {/* Step 5: Review */}
          {activeStep === 4 && (
            <Box className="dwd-wizard-step">
              <Typography variant="h6" gutterBottom>
                Review & Create
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                Review your diagnostic setup below. Click "Create Case" to create all artefacts.
              </Alert>

              <Box className="dwd-wizard-review">
                {/* Situation */}
                <Paper className="dwd-wizard-review-section">
                  <Typography variant="subtitle2" color="primary">Situation</Typography>
                  <Typography variant="h6">{formData.situationName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.situationDescription || 'No description'}
                  </Typography>
                </Paper>

                {/* Work Items */}
                <Paper className="dwd-wizard-review-section">
                  <Typography variant="subtitle2" color="primary">
                    Work Items ({formData.workItems.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.workItems.map(item => (
                      <Chip
                        key={item.id}
                        label={item.name}
                        color={item.volatility === 'high' ? 'error' : item.volatility === 'medium' ? 'warning' : 'success'}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Paper>

                {/* Actors */}
                <Paper className="dwd-wizard-review-section">
                  <Typography variant="subtitle2" color="primary">
                    Actors ({formData.actors.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.actors.map(actor => (
                      <Chip
                        key={actor.id}
                        label={actor.name}
                        icon={actor.type === 'team' ? <GroupsIcon /> : actor.type === 'system' ? <ComputerIcon /> : <PersonIcon />}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Paper>

                {/* Signals */}
                <Paper className="dwd-wizard-review-section">
                  <Typography variant="subtitle2" color="primary">
                    Signals ({formData.selectedSignals.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.selectedSignals.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No signals selected</Typography>
                    ) : (
                      formData.selectedSignals.map(signal => {
                        const signalDef = DWD_SIGNAL_TYPES.find(s => s.value === signal);
                        return (
                          <Chip
                            key={signal}
                            label={signalDef?.label || signal}
                            color="error"
                            variant="outlined"
                          />
                        );
                      })
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box className="dwd-wizard-footer">
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>

          <Box sx={{ flex: 1 }} />

          {activeStep < STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed()}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleComplete}
              disabled={creating || !canProceed()}
            >
              {creating ? 'Creating...' : 'Create Case'}
            </Button>
          )}
        </Box>
      </Paper>

      <style jsx>{`
        .dwd-wizard-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1300;
          padding: 20px;
        }
      `}</style>
    </Box>
  );
}
