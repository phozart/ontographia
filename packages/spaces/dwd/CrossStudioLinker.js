// components/dwd/CrossStudioLinker.js
// Link picker modal for connecting DWD artefacts to other studios

import { useState, useCallback, useEffect } from 'react';
import { useDWD } from './DWDContext';

// MUI
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const STUDIO_ICONS = {
  Architecture: ArchitectureIcon,
  Assignment: AssignmentIcon,
  Dashboard: DashboardIcon,
  Hub: HubIcon,
  Psychology: PsychologyIcon,
  Folder: FolderIcon,
};

const LINK_TYPES = [
  { value: 'relates_to', label: 'Relates To', description: 'General relationship' },
  { value: 'implements', label: 'Implements', description: 'DWD artefact implements this' },
  { value: 'affects', label: 'Affects', description: 'DWD artefact affects this' },
  { value: 'derived_from', label: 'Derived From', description: 'DWD artefact is derived from this' },
  { value: 'supports', label: 'Supports', description: 'DWD artefact supports this' },
];

export default function CrossStudioLinker({
  open,
  onClose,
  sourceArtefact,
  existingLinks = [],
  onLinkCreated,
}) {
  const { createRelationship } = useDWD();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [linkType, setLinkType] = useState('relates_to');
  const [expandedStudios, setExpandedStudios] = useState({});
  const [creating, setCreating] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/cross-studio/search?q=${encodeURIComponent(searchQuery)}&limit=30`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        setSearchResults(data);

        // Auto-expand all studios with results
        const expanded = {};
        data.grouped?.forEach(studio => {
          expanded[studio.studioId] = true;
        });
        setExpandedStudios(expanded);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleStudio = (studioId) => {
    setExpandedStudios(prev => ({ ...prev, [studioId]: !prev[studioId] }));
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleCreateLink = useCallback(async () => {
    if (!selectedItem || !sourceArtefact?.id) return;

    setCreating(true);
    try {
      await createRelationship(
        sourceArtefact.id,
        selectedItem.id,
        linkType,
        null
      );
      onLinkCreated?.({
        sourceId: sourceArtefact.id,
        targetId: selectedItem.id,
        targetName: selectedItem.name,
        targetType: selectedItem.artefact_type,
        linkType,
        studioId: selectedItem.studioId,
        studioName: selectedItem.studioName,
      });
      setSelectedItem(null);
      setSearchQuery('');
      setSearchResults(null);
      onClose?.();
    } catch (err) {
      console.error('Failed to create link:', err);
      setError('Failed to create link: ' + err.message);
    } finally {
      setCreating(false);
    }
  }, [selectedItem, sourceArtefact, linkType, createRelationship, onLinkCreated, onClose]);

  const isAlreadyLinked = (itemId) => {
    return existingLinks.some(link =>
      link.target_artefact_id === itemId || link.source_artefact_id === itemId
    );
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon color="primary" />
            <Typography variant="h6">Link to Other Studios</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        {sourceArtefact && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Linking from: <strong>{sourceArtefact.name}</strong>
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="Search across all studios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search Results */}
        {searchResults && searchResults.grouped?.length > 0 ? (
          <Box className="cross-studio-results">
            {searchResults.grouped.map(studio => {
              const StudioIcon = STUDIO_ICONS[studio.studioIcon] || FolderIcon;
              const isExpanded = expandedStudios[studio.studioId];

              return (
                <Paper key={studio.studioId} variant="outlined" sx={{ mb: 1 }}>
                  <ListItemButton onClick={() => toggleStudio(studio.studioId)}>
                    <ListItemIcon>
                      <StudioIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={studio.studioName}
                      secondary={`${studio.items.length} result${studio.items.length !== 1 ? 's' : ''}`}
                    />
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                  <Collapse in={isExpanded}>
                    <List dense disablePadding>
                      {studio.items.map(item => {
                        const linked = isAlreadyLinked(item.id);
                        const isSelected = selectedItem?.id === item.id;

                        return (
                          <ListItem
                            key={item.id}
                            disablePadding
                            secondaryAction={
                              linked ? (
                                <Chip
                                  icon={<CheckCircleIcon />}
                                  label="Linked"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ) : isSelected ? (
                                <Chip
                                  label="Selected"
                                  size="small"
                                  color="primary"
                                />
                              ) : null
                            }
                          >
                            <ListItemButton
                              onClick={() => !linked && handleSelectItem(item)}
                              disabled={linked}
                              selected={isSelected}
                              sx={{ pl: 4 }}
                            >
                              <ListItemText
                                primary={item.name}
                                secondary={
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip
                                      label={item.typeLabel}
                                      size="small"
                                      sx={{ height: 18, fontSize: 10 }}
                                    />
                                    {item.project_name && (
                                      <Typography variant="caption" color="text.secondary">
                                        in {item.project_name}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        ) : searchResults && searchResults.total === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No results found for "{searchQuery}"
            </Typography>
          </Box>
        ) : !searchQuery ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              Search to find artefacts from EA, Requirements, Portfolio, or Knowledge Graph
            </Typography>
          </Box>
        ) : null}

        {/* Selected Item & Link Type */}
        {selectedItem && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Creating link to:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedItem.name}
              </Typography>
              <Chip label={selectedItem.typeLabel} size="small" />
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>Link Type</InputLabel>
              <Select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value)}
                label="Link Type"
              >
                {LINK_TYPES.map(lt => (
                  <MenuItem key={lt.value} value={lt.value}>
                    <Box>
                      <Typography variant="body2">{lt.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lt.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreateLink}
          disabled={!selectedItem || creating}
          startIcon={<LinkIcon />}
        >
          {creating ? 'Creating...' : 'Create Link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
