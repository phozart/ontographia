// components/diagrams/BoardSettingsPanel.js
// Settings panel for board configuration

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  FormControlLabel,
  Switch,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GridIcon from '@mui/icons-material/Grid4x4';
import ColorIcon from '@mui/icons-material/ColorLens';
import DeleteIcon from '@mui/icons-material/Delete';

// Default settings
const DEFAULT_SETTINGS = {
  gridEnabled: true,
  gridSize: 20,
  snapToGrid: true,
  snapThreshold: 8,
  backgroundColor: '#ffffff',
  defaultPack: 'process-flow',
};

// Background color presets
const BG_PRESETS = [
  { value: '#ffffff', label: 'White' },
  { value: '#f5f5f5', label: 'Light Gray' },
  { value: '#fafafa', label: 'Off White' },
  { value: '#f0f4f8', label: 'Light Blue' },
  { value: '#fff8e1', label: 'Light Yellow' },
  { value: '#e8f5e9', label: 'Light Green' },
  { value: '#212121', label: 'Dark' },
];

// Diagram packs
const DIAGRAM_PACKS = [
  { id: 'process-flow', name: 'Process Flow' },
  { id: 'bpmn', name: 'BPMN' },
  { id: 'uml-class', name: 'UML Class' },
  { id: 'erd', name: 'Entity Relationship' },
  { id: 'mind-map', name: 'Mind Map' },
  { id: 'flowchart', name: 'Flowchart' },
  { id: 'org-chart', name: 'Organization Chart' },
  { id: 'sticky-notes', name: 'Sticky Notes' },
  { id: 'cld', name: 'Causal Loop' },
];

export default function BoardSettingsPanel({
  open,
  onClose,
  board,
  onUpdate,
  onDelete,
}) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize from board data
  useEffect(() => {
    if (board) {
      setName(board.name || '');
      setDescription(board.description || '');
      setSettings({
        ...DEFAULT_SETTINGS,
        ...board.settings,
      });
      setHasChanges(false);
    }
  }, [board]);

  // Track changes
  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleNameChange = (value) => {
    setName(value);
    setHasChanges(true);
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Board name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onUpdate({
        name: name.trim(),
        description: description.trim(),
        settings,
      });
      setHasChanges(false);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 360, p: 2 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Board Settings</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Board Info Section */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Board Information
      </Typography>

      <TextField
        label="Board Name"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />

      <TextField
        label="Description"
        value={description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        fullWidth
        size="small"
        multiline
        rows={2}
        sx={{ mb: 3 }}
      />

      <Divider sx={{ mb: 3 }} />

      {/* Grid Settings Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <GridIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" color="text.secondary">
          Grid Settings
        </Typography>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={settings.gridEnabled}
            onChange={(e) => handleSettingChange('gridEnabled', e.target.checked)}
          />
        }
        label="Show grid"
        sx={{ mb: 1 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={settings.snapToGrid}
            onChange={(e) => handleSettingChange('snapToGrid', e.target.checked)}
          />
        }
        label="Snap to grid"
        sx={{ mb: 2 }}
      />

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Grid Size: {settings.gridSize}px
      </Typography>
      <Slider
        value={settings.gridSize}
        onChange={(e, value) => handleSettingChange('gridSize', value)}
        min={10}
        max={50}
        step={5}
        marks
        sx={{ mb: 3 }}
      />

      <Divider sx={{ mb: 3 }} />

      {/* Appearance Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ColorIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" color="text.secondary">
          Appearance
        </Typography>
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Background Color</InputLabel>
        <Select
          value={settings.backgroundColor}
          label="Background Color"
          onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
        >
          {BG_PRESETS.map((preset) => (
            <MenuItem key={preset.value} value={preset.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    bgcolor: preset.value,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                {preset.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Default Diagram Pack</InputLabel>
        <Select
          value={settings.defaultPack}
          label="Default Diagram Pack"
          onChange={(e) => handleSettingChange('defaultPack', e.target.value)}
        >
          {DIAGRAM_PACKS.map((pack) => (
            <MenuItem key={pack.id} value={pack.id}>
              {pack.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ mb: 3 }} />

      {/* Danger Zone */}
      <Typography variant="subtitle2" color="error" sx={{ mb: 2 }}>
        Danger Zone
      </Typography>

      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={onDelete}
        fullWidth
      >
        Delete Board
      </Button>

      {/* Save Button */}
      {hasChanges && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.paper',
            pt: 2,
            pb: 1,
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            fullWidth
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
