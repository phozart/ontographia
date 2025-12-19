/**
 * Admin Menu Configuration Page
 *
 * Allows admins to configure the default menu structure,
 * create/rename sections, and reorder items.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Snackbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import { useAuth } from '../../components/AuthContext';

// Icon mapping for display
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppsIcon from '@mui/icons-material/Apps';
import HubIcon from '@mui/icons-material/Hub';
import LoopIcon from '@mui/icons-material/Loop';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LockIcon from '@mui/icons-material/Lock';
import BuildIcon from '@mui/icons-material/Build';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import GridViewIcon from '@mui/icons-material/GridView';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import FlagIcon from '@mui/icons-material/Flag';
import GavelIcon from '@mui/icons-material/Gavel';
import ShieldIcon from '@mui/icons-material/Shield';

const ICON_MAP = {
  HomeIcon,
  DashboardIcon,
  AppsIcon,
  HubIcon,
  LoopIcon,
  AssignmentIcon,
  ArchitectureIcon,
  LightbulbIcon,
  LockIcon,
  BuildIcon,
  HandshakeIcon,
  PsychologyIcon,
  SchoolIcon,
  AutoStoriesIcon,
  ChangeCircleIcon,
  GridViewIcon,
  CategoryIcon,
  MiscellaneousServicesIcon,
  FlagIcon,
  GavelIcon,
  ShieldIcon,
};

export default function MenuConfigPage() {
  const router = useRouter();
  const { user, role, hydrated } = useAuth();

  // State
  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Edit dialogs
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [editingItemKey, setEditingItemKey] = useState(null);
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState('');

  // Drag state
  const [draggedSection, setDraggedSection] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Auth headers
  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': role || '',
  };

  // Redirect if not admin
  useEffect(() => {
    if (hydrated && (!user || role !== 'admin')) {
      router.push('/login');
    }
  }, [hydrated, user, role, router]);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const [configRes, itemsRes] = await Promise.all([
        fetch('/api/admin/menu-config', { headers: authHeaders }),
        fetch('/api/admin/menu-items', { headers: authHeaders }),
      ]);

      if (!configRes.ok || !itemsRes.ok) {
        throw new Error('Failed to fetch configuration');
      }

      const configData = await configRes.json();
      const itemsData = await itemsRes.json();

      setConfig(configData.config);
      setOriginalConfig(JSON.parse(JSON.stringify(configData.config)));
      setAvailableItems(itemsData.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    if (user && role === 'admin') {
      fetchConfig();
    }
  }, [user, role, fetchConfig]);

  // Check for unsaved changes
  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  // Save config
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/menu-config', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ config }),
      });

      if (!res.ok) throw new Error('Failed to save configuration');

      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setSuccess('Configuration saved successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset to original
  const handleReset = () => {
    setConfig(JSON.parse(JSON.stringify(originalConfig)));
    setSuccess('Changes discarded');
  };

  // Section operations
  const toggleSectionExpanded = (index) => {
    const newConfig = { ...config };
    newConfig.sections[index].expanded = !newConfig.sections[index].expanded;
    setConfig(newConfig);
  };

  const renameSection = (index, newLabel) => {
    const newConfig = { ...config };
    newConfig.sections[index].label = newLabel;
    setConfig(newConfig);
    setEditingSectionIndex(null);
  };

  const deleteSection = (index) => {
    if (!config.sections[index].isCustom) {
      setError('Cannot delete system sections');
      return;
    }
    const newConfig = { ...config };
    const section = newConfig.sections[index];
    // Move items to first section
    if (section.items.length > 0 && newConfig.sections.length > 1) {
      const target = newConfig.sections.find((s, i) => i !== index);
      if (target) target.items.push(...section.items);
    }
    newConfig.sections.splice(index, 1);
    setConfig(newConfig);
  };

  const addSection = () => {
    if (!newSectionLabel.trim()) return;
    const key = newSectionLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newConfig = { ...config };
    newConfig.sections.push({
      key: `custom-${key}-${Date.now()}`,
      label: newSectionLabel.trim(),
      isCustom: true,
      expanded: true,
      items: [],
    });
    setConfig(newConfig);
    setNewSectionDialogOpen(false);
    setNewSectionLabel('');
  };

  // Item operations
  const renameItem = (sectionIndex, itemIndex, newLabel) => {
    const newConfig = { ...config };
    newConfig.sections[sectionIndex].items[itemIndex].label = newLabel;
    setConfig(newConfig);
    setEditingItemKey(null);
  };

  const removeItem = (sectionIndex, itemIndex) => {
    const newConfig = { ...config };
    newConfig.sections[sectionIndex].items.splice(itemIndex, 1);
    setConfig(newConfig);
  };

  // Drag handlers for sections
  const handleSectionDragStart = (e, index) => {
    setDraggedSection(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e, index) => {
    e.preventDefault();
    if (draggedSection === null || draggedSection === index) return;
  };

  const handleSectionDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedSection === null || draggedSection === targetIndex) return;

    const newConfig = { ...config };
    const sections = [...newConfig.sections];
    const [moved] = sections.splice(draggedSection, 1);
    sections.splice(targetIndex, 0, moved);
    newConfig.sections = sections;
    setConfig(newConfig);
    setDraggedSection(null);
  };

  // Drag handlers for items
  const handleItemDragStart = (e, sectionIndex, itemIndex) => {
    setDraggedItem({ sectionIndex, itemIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e) => {
    e.preventDefault();
  };

  const handleItemDrop = (e, targetSectionIndex, targetItemIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    const newConfig = JSON.parse(JSON.stringify(config)); // Deep clone to prevent mutation issues

    // Check if dragging from available items (has key) or from existing section (has sectionIndex)
    if (draggedItem.key !== undefined && draggedItem.sectionIndex === undefined) {
      // Adding from available items - check it's not already in the section
      const alreadyInSection = newConfig.sections[targetSectionIndex].items.some(
        i => i.key === draggedItem.key
      );
      if (alreadyInSection) {
        setDraggedItem(null);
        return;
      }

      const newItem = { key: draggedItem.key, label: draggedItem.label };

      if (targetItemIndex === undefined) {
        newConfig.sections[targetSectionIndex].items.push(newItem);
      } else {
        newConfig.sections[targetSectionIndex].items.splice(targetItemIndex, 0, newItem);
      }
    } else {
      // Moving within or between sections
      const { sectionIndex: fromSection, itemIndex: fromIndex } = draggedItem;

      // Don't do anything if dropping on itself
      if (fromSection === targetSectionIndex && fromIndex === targetItemIndex) {
        setDraggedItem(null);
        return;
      }

      // Get the item to move
      const item = newConfig.sections[fromSection].items[fromIndex];

      // Handle same-section reordering
      if (fromSection === targetSectionIndex) {
        const items = newConfig.sections[fromSection].items;
        // Remove from original position
        items.splice(fromIndex, 1);
        // Calculate new target index (accounts for removal)
        const newTargetIndex = targetItemIndex === undefined
          ? items.length
          : (fromIndex < targetItemIndex ? targetItemIndex - 1 : targetItemIndex);
        // Insert at new position
        items.splice(newTargetIndex, 0, item);
      } else {
        // Cross-section move
        // Remove from source
        newConfig.sections[fromSection].items.splice(fromIndex, 1);
        // Insert at target
        if (targetItemIndex === undefined) {
          newConfig.sections[targetSectionIndex].items.push(item);
        } else {
          newConfig.sections[targetSectionIndex].items.splice(targetItemIndex, 0, item);
        }
      }
    }

    setConfig(newConfig);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    setDraggedItem(null);
  };

  // Get icon component
  const getIcon = (iconName) => {
    const Icon = ICON_MAP[iconName] || CategoryIcon;
    return <Icon fontSize="small" />;
  };

  // Get item details
  const getItemDetails = (itemKey) => {
    return availableItems.find(i => i.key === itemKey);
  };

  if (!hydrated || loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Menu Configuration | Admin | Ontographia</title>
      </Head>

      <Box sx={{ height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column', p: 3, overflow: 'hidden' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MenuIcon sx={{ fontSize: 32, color: 'var(--accent)' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text)' }}>
                Menu Configuration
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                Configure the default navigation menu structure
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasChanges && (
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={handleReset}
              >
                Discard
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {hasChanges && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 0 }}>
          {/* Main config panel */}
          <Paper sx={{ flex: 2, p: 0, borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Menu Sections
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setNewSectionDialogOpen(true)}
              >
                Add Section
              </Button>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
            {config?.sections?.map((section, sectionIndex) => (
              <Box
                key={section.key}
                draggable
                onDragStart={(e) => handleSectionDragStart(e, sectionIndex)}
                onDragOver={(e) => handleSectionDragOver(e, sectionIndex)}
                onDrop={(e) => handleSectionDrop(e, sectionIndex)}
                sx={{
                  borderBottom: '1px solid var(--border)',
                  background: draggedSection === sectionIndex ? 'var(--accent-soft)' : 'transparent',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                {/* Section header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    gap: 1,
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                  }}
                >
                  <DragIndicatorIcon sx={{ color: 'var(--text-muted)' }} />
                  <IconButton size="small" onClick={() => toggleSectionExpanded(sectionIndex)}>
                    {section.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>

                  {editingSectionIndex === sectionIndex ? (
                    <TextField
                      size="small"
                      defaultValue={section.label}
                      autoFocus
                      onBlur={(e) => renameSection(sectionIndex, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameSection(sectionIndex, e.target.value);
                        if (e.key === 'Escape') setEditingSectionIndex(null);
                      }}
                      sx={{ flex: 1 }}
                    />
                  ) : (
                    <>
                      <Typography sx={{ flex: 1, fontWeight: 600 }}>
                        {section.label}
                      </Typography>
                      {section.isCustom && (
                        <Chip label="Custom" size="small" sx={{ fontSize: 10, height: 20 }} />
                      )}
                    </>
                  )}

                  <Chip
                    label={`${section.items?.length || 0} items`}
                    size="small"
                    sx={{ fontSize: 10, height: 20 }}
                  />
                  <Tooltip title="Rename section">
                    <IconButton size="small" onClick={() => setEditingSectionIndex(sectionIndex)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {section.isCustom && (
                    <Tooltip title="Delete section">
                      <IconButton
                        size="small"
                        onClick={() => deleteSection(sectionIndex)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Section items */}
                {section.expanded && (
                  <Box
                    onDragOver={handleItemDragOver}
                    onDrop={(e) => handleItemDrop(e, sectionIndex)}
                    sx={{ minHeight: 50, bgcolor: 'var(--bg)', px: 2, py: 1 }}
                  >
                    {section.items?.length === 0 ? (
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Drag items here
                      </Typography>
                    ) : (
                      <List dense disablePadding>
                        {section.items?.map((item, itemIndex) => {
                          const details = getItemDetails(item.key);
                          const isEditing = editingItemKey === `${sectionIndex}-${itemIndex}`;

                          return (
                            <ListItem
                              key={item.key}
                              draggable
                              onDragStart={(e) => handleItemDragStart(e, sectionIndex, itemIndex)}
                              onDragOver={handleItemDragOver}
                              onDrop={(e) => handleItemDrop(e, sectionIndex, itemIndex)}
                              onDragEnd={handleDragEnd}
                              sx={{
                                bgcolor: draggedItem?.sectionIndex === sectionIndex && draggedItem?.itemIndex === itemIndex
                                  ? 'var(--accent-soft)'
                                  : 'var(--panel)',
                                mb: 0.5,
                                borderRadius: 1,
                                cursor: 'grab',
                                '&:active': { cursor: 'grabbing' },
                              }}
                            >
                              <DragIndicatorIcon sx={{ color: 'var(--text-muted)', mr: 1 }} />
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                {getIcon(details?.icon)}
                              </ListItemIcon>
                              {isEditing ? (
                                <TextField
                                  size="small"
                                  defaultValue={item.label}
                                  autoFocus
                                  fullWidth
                                  onBlur={(e) => renameItem(sectionIndex, itemIndex, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') renameItem(sectionIndex, itemIndex, e.target.value);
                                    if (e.key === 'Escape') setEditingItemKey(null);
                                  }}
                                />
                              ) : (
                                <ListItemText
                                  primary={item.label}
                                  secondary={details?.href}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                              )}
                              <ListItemSecondaryAction>
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingItemKey(`${sectionIndex}-${itemIndex}`)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => removeItem(sectionIndex, itemIndex)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </Box>
                )}
              </Box>
            ))}
            </Box>
          </Paper>

          {/* Available items panel */}
          <Paper sx={{ flex: 1, p: 0, borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Available Items
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                Drag items to add them to sections
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {availableItems.filter(item => {
                // Check if item is already in config
                const inConfig = config?.sections?.some(s =>
                  s.items?.some(i => i.key === item.key)
                );
                return !inConfig;
              }).map((item) => (
                <Box
                  key={item.key}
                  draggable
                  onDragStart={(e) => {
                    setDraggedItem({ key: item.key, label: item.label });
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    cursor: 'grab',
                    bgcolor: 'var(--panel)',
                    border: '1px solid var(--border)',
                    '&:hover': { borderColor: 'var(--accent)' },
                    '&:active': { cursor: 'grabbing' },
                  }}
                >
                  <DragIndicatorIcon sx={{ color: 'var(--text-muted)', fontSize: 18 }} />
                  {getIcon(item.icon)}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }} noWrap>
                      {item.href}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {availableItems.filter(item => {
                const inConfig = config?.sections?.some(s =>
                  s.items?.some(i => i.key === item.key)
                );
                return !inConfig;
              }).length === 0 && (
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontStyle: 'italic', p: 2, display: 'block' }}>
                  All items are in use
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
        </Box>
      </Box>

      {/* New section dialog */}
      <Dialog open={newSectionDialogOpen} onClose={() => setNewSectionDialogOpen(false)}>
        <DialogTitle>Create New Section</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Section Name"
            value={newSectionLabel}
            onChange={(e) => setNewSectionLabel(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={addSection} variant="contained" disabled={!newSectionLabel.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        message={success}
      />

      <style jsx>{`
        :global(.page-container) {
          max-width: none !important;
        }
      `}</style>
    </>
  );
}
