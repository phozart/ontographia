// components/dwd/PatternLibrary.js
// Pattern library showing pre-built templates for common work design problems

import { useState, useCallback } from 'react';

// MUI
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import BlockIcon from '@mui/icons-material/Block';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';

import { DWD_PATTERNS } from '../../../lib/dwd-patterns';
import { DWD_SIGNAL_TYPES } from '../../../lib/dwd-types';
import { getPrinciple } from '../../../lib/dwd-principles';

// Import additional icons for new patterns
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import ChecklistIcon from '@mui/icons-material/Checklist';
import QueueIcon from '@mui/icons-material/Queue';
import GroupsIcon from '@mui/icons-material/Groups';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DomainIcon from '@mui/icons-material/Domain';
import LockIcon from '@mui/icons-material/Lock';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';

const PATTERN_ICONS = {
  // Original 5
  SyncAlt: SyncAltIcon,
  Block: BlockIcon,
  LocalFireDepartment: LocalFireDepartmentIcon,
  ContentCopy: ContentCopyIcon,
  ReportProblem: ReportProblemIcon,
  // New 10
  VisibilityOff: VisibilityOffIcon,
  Person: PersonIcon,
  Checklist: ChecklistIcon,
  Queue: QueueIcon,
  Groups: GroupsIcon,
  ExpandMore: ExpandMoreIcon,
  Sync: SyncAltIcon, // Reuse SyncAlt for Thrashing
  Domain: DomainIcon,
  Lock: LockIcon,
  TheaterComedy: TheaterComedyIcon,
};

export default function PatternLibrary({
  open,
  onClose,
  onSelectPattern,
  onStartBlank,
  onStartWizard,
}) {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern);
    setDetailOpen(true);
  };

  const handleUsePattern = useCallback(() => {
    if (selectedPattern) {
      onSelectPattern?.(selectedPattern);
      setDetailOpen(false);
      onClose?.();
    }
  }, [selectedPattern, onSelectPattern, onClose]);

  const handleClose = () => {
    setDetailOpen(false);
    setSelectedPattern(null);
  };

  if (!open) return null;

  return (
    <>
      <Box className="dwd-pattern-library-overlay">
        <Paper className="dwd-pattern-library-container">
          {/* Header */}
          <Box className="dwd-pattern-library-header">
            <Typography variant="h5">Start from Pattern</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2 }}>
            Choose a common pattern that matches your situation. Each pattern includes suggested work items, actors, and signals to get you started quickly.
          </Typography>

          {/* Pattern Grid */}
          <Box className="dwd-pattern-library-grid">
            {DWD_PATTERNS.map(pattern => {
              const IconComponent = PATTERN_ICONS[pattern.icon] || ReportProblemIcon;
              return (
                <Paper
                  key={pattern.id}
                  className="dwd-pattern-card"
                  onClick={() => handlePatternClick(pattern)}
                >
                  <Box className="dwd-pattern-card__icon">
                    <IconComponent fontSize="large" />
                  </Box>
                  <Typography variant="h6" className="dwd-pattern-card__title">
                    {pattern.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="dwd-pattern-card__description">
                    {pattern.description}
                  </Typography>
                  {/* Principle Badge */}
                  {pattern.principleViolated && (() => {
                    const principle = getPrinciple(pattern.principleViolated);
                    return principle ? (
                      <Chip
                        icon={<SchoolIcon />}
                        label={`P${principle.number}: ${principle.shortName}`}
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: `${principle.color}15`,
                          color: principle.color,
                          borderColor: principle.color,
                          '& .MuiChip-icon': { color: principle.color },
                        }}
                        variant="outlined"
                      />
                    ) : null;
                  })()}
                  <Box className="dwd-pattern-card__signals">
                    {pattern.signals.slice(0, 2).map(signalId => {
                      const signal = DWD_SIGNAL_TYPES.find(s => s.value === signalId);
                      return (
                        <Chip
                          key={signalId}
                          label={signal?.label || signalId}
                          size="small"
                          variant="outlined"
                          color="error"
                        />
                      );
                    })}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    className="dwd-pattern-card__button"
                    endIcon={<PlayArrowIcon />}
                  >
                    Use Pattern
                  </Button>
                </Paper>
              );
            })}
          </Box>

          {/* Alternative options */}
          <Divider sx={{ my: 2 }} />
          <Box className="dwd-pattern-library-alternatives">
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Or start differently:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  onStartBlank?.();
                  onClose?.();
                }}
              >
                Blank Case
              </Button>
              <Button
                variant="outlined"
                startIcon={<AutoFixHighIcon />}
                onClick={() => {
                  onStartWizard?.();
                  onClose?.();
                }}
              >
                Guided Wizard
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Pattern Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        {selectedPattern && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {(() => {
                  const IconComponent = PATTERN_ICONS[selectedPattern.icon] || ReportProblemIcon;
                  return <IconComponent color="primary" />;
                })()}
                {selectedPattern.name}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" paragraph>
                {selectedPattern.description}
              </Typography>

              {/* Principle Violated */}
              {selectedPattern.principleViolated && (() => {
                const principle = getPrinciple(selectedPattern.principleViolated);
                return principle ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 2,
                      borderColor: principle.color,
                      borderLeftWidth: 4,
                      bgcolor: `${principle.color}08`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SchoolIcon sx={{ color: principle.color }} />
                      <Typography variant="subtitle2" sx={{ color: principle.color }}>
                        Addresses Principle {principle.number}: {principle.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPattern.principleNote || principle.keyInsight}
                    </Typography>
                  </Paper>
                ) : null;
              })()}

              {/* Symptoms */}
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                <WarningAmberIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Symptoms You Might See
              </Typography>
              <List dense>
                {selectedPattern.symptoms.map((symptom, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={symptom} />
                  </ListItem>
                ))}
              </List>

              {/* Common Causes */}
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                <LightbulbIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Common Causes
              </Typography>
              <List dense>
                {selectedPattern.commonCauses.map((cause, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon fontSize="small" color="info" />
                    </ListItemIcon>
                    <ListItemText primary={cause} />
                  </ListItem>
                ))}
              </List>

              {/* What will be created */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>
                This pattern will pre-populate:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip
                  label={`${selectedPattern.suggestedWorkItems.length} Work Items`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`${selectedPattern.suggestedActors.length} Actors`}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`${selectedPattern.signals.length} Signals`}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              </Box>

              {/* Guidance preview */}
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 3 }}>
                Guidance
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    whiteSpace: 'pre-line',
                    '& strong': { fontWeight: 600 },
                  }}
                >
                  {selectedPattern.guidance.trim()}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleUsePattern}
                startIcon={<PlayArrowIcon />}
              >
                Use This Pattern
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <style jsx>{`
        .dwd-pattern-library-overlay {
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
    </>
  );
}
