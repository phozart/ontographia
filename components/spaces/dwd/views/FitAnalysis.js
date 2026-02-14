// components/dwd/views/FitAnalysis.js
// Fit Analysis Dashboard - Auto-detect mismatches between work and coordination

import { useMemo, useState } from 'react';
import { useDWD } from '../DWDContext';
import { analyzeFit, DWD_VOLATILITY_LEVELS, DWD_AUTHORITY_LEVELS, DWD_COORDINATION_PATTERN_TYPES } from '../../../../lib/dwd-types';

// MUI
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';

const FIT_COLORS = {
  good: { bg: '#dcfce7', color: '#16a34a', icon: CheckCircleIcon },
  ok: { bg: '#e0f2fe', color: '#0284c7', icon: CheckCircleIcon },
  warning: { bg: '#fef3c7', color: '#d97706', icon: WarningIcon },
  mismatch: { bg: '#fee2e2', color: '#dc2626', icon: ErrorIcon },
  unknown: { bg: '#f3f4f6', color: '#6b7280', icon: HelpOutlineIcon },
};

function FitBadge({ fit, showLabel = true }) {
  const style = FIT_COLORS[fit] || FIT_COLORS.unknown;
  const Icon = style.icon;

  return (
    <Chip
      icon={<Icon style={{ color: style.color }} />}
      label={showLabel ? fit.toUpperCase() : undefined}
      size="small"
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: 10,
        textTransform: 'uppercase',
      }}
    />
  );
}

function VolatilityBadge({ level }) {
  const vol = DWD_VOLATILITY_LEVELS.find(v => v.value === level);
  return (
    <Chip
      label={level}
      size="small"
      sx={{
        backgroundColor: vol?.color + '20',
        color: vol?.color,
        fontWeight: 500,
        textTransform: 'capitalize',
      }}
    />
  );
}

function AuthorityBadge({ level }) {
  const auth = DWD_AUTHORITY_LEVELS.find(a => a.value === level);
  return (
    <Chip
      label={level}
      size="small"
      sx={{
        backgroundColor: auth?.color + '20',
        color: auth?.color,
        fontWeight: 500,
        textTransform: 'capitalize',
      }}
    />
  );
}

export default function FitAnalysis({ onCreateArtefact }) {
  const { artefacts, relationships, refreshData } = useDWD();
  const [refreshing, setRefreshing] = useState(false);

  // Run fit analysis
  const fitResults = useMemo(() => {
    return analyzeFit(artefacts, relationships);
  }, [artefacts, relationships]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData?.();
    setRefreshing(false);
  };

  const handleCreateAdjustment = () => {
    onCreateArtefact?.('dwd_adjustment');
  };

  // Get score color
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#16a34a';
    if (percentage >= 60) return '#d97706';
    return '#dc2626';
  };

  const hasData = fitResults.workItems.length > 0 || fitResults.actors.length > 0;

  return (
    <Box className="dwd-fit-analysis">
      {/* Header */}
      <Box className="dwd-fit-analysis__header">
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Fit Analysis</Typography>
          <Typography variant="body2" color="text.secondary">
            Auto-detect mismatches between work characteristics and coordination patterns
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {!hasData ? (
        <Paper className="dwd-fit-analysis__empty">
          <HelpOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Data to Analyze</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add work items, actors, and coordination patterns to see fit analysis.
          </Typography>
          <Button variant="contained" onClick={() => onCreateArtefact?.('dwd_work_item')}>
            Add Work Item
          </Button>
        </Paper>
      ) : (
        <>
          {/* Overall Score */}
          <Paper className="dwd-fit-analysis__score-card">
            <Box className="dwd-fit-analysis__score-header">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                OVERALL FIT SCORE
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: getScoreColor(fitResults.overall.percentage) }}
              >
                {fitResults.overall.percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={fitResults.overall.percentage}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(fitResults.overall.percentage),
                  borderRadius: 6,
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {fitResults.overall.issues.length} issue{fitResults.overall.issues.length !== 1 ? 's' : ''} detected
            </Typography>
          </Paper>

          {/* Work Item Fit Table */}
          <Paper className="dwd-fit-analysis__section">
            <Box className="dwd-fit-analysis__section-header">
              <AssignmentIcon color="primary" />
              <Typography variant="h6">Work Item Fit</Typography>
            </Box>
            {fitResults.workItems.length === 0 ? (
              <Alert severity="info" sx={{ m: 2 }}>
                No work items with coordination patterns to analyze.
              </Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Work Item</TableCell>
                      <TableCell>Volatility</TableCell>
                      <TableCell>Coordination Pattern</TableCell>
                      <TableCell>Fit</TableCell>
                      <TableCell>Assessment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fitResults.workItems.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.workItem.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <VolatilityBadge level={item.volatility} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {item.patternType?.replace('_', ' ') || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <FitBadge fit={item.fit} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={item.suggestion || ''}>
                            <Typography variant="caption" color="text.secondary">
                              {item.message}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Actor Authority Fit Table */}
          <Paper className="dwd-fit-analysis__section">
            <Box className="dwd-fit-analysis__section-header">
              <PersonIcon color="secondary" />
              <Typography variant="h6">Actor Authority Fit</Typography>
            </Box>
            {fitResults.actors.length === 0 ? (
              <Alert severity="info" sx={{ m: 2 }}>
                No actors to analyze.
              </Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Actor</TableCell>
                      <TableCell>Authority</TableCell>
                      <TableCell>Work Handled</TableCell>
                      <TableCell>Fit</TableCell>
                      <TableCell>Assessment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fitResults.actors.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.actor.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <AuthorityBadge level={item.authority} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.workItemCount} item{item.workItemCount !== 1 ? 's' : ''} ({item.workVolatility} vol.)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <FitBadge fit={item.fit} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={item.suggestion || ''}>
                            <Typography variant="caption" color="text.secondary">
                              {item.message}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Suggestions */}
          {fitResults.suggestions.length > 0 && (
            <Paper className="dwd-fit-analysis__section dwd-fit-analysis__suggestions">
              <Box className="dwd-fit-analysis__section-header">
                <BuildIcon sx={{ color: '#10b981' }} />
                <Typography variant="h6">Suggested Adjustments</Typography>
              </Box>
              <Box className="dwd-fit-analysis__suggestions-list">
                {fitResults.suggestions.map((suggestion, idx) => (
                  <Box key={idx} className="dwd-fit-analysis__suggestion">
                    <Box className="dwd-fit-analysis__suggestion-content">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip
                          label={suggestion.priority}
                          size="small"
                          color={suggestion.priority === 'high' ? 'error' : 'warning'}
                          sx={{ fontSize: 10, height: 20 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {suggestion.workItem || suggestion.actor}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.message}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: '#10b981' }}>
                        <LightbulbIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {suggestion.suggestion}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleCreateAdjustment}
                    >
                      Create Adjustment
                    </Button>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Guidance */}
          <Paper className="dwd-fit-analysis__guidance">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Understanding Fit Analysis
            </Typography>
            <Box className="dwd-fit-analysis__guidance-grid">
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Work-Coordination Fit</Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  High-volatility work needs collaboration. Low-volatility work fits handover.
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Actor-Authority Fit</Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Authority should match work volatility. Low authority + high volatility = bottleneck.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </>
      )}

      <style jsx>{`
        .dwd-fit-analysis {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dwd-fit-analysis__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .dwd-fit-analysis__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          text-align: center;
        }

        .dwd-fit-analysis__score-card {
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        }

        .dwd-fit-analysis__score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .dwd-fit-analysis__section {
          overflow: hidden;
        }

        .dwd-fit-analysis__section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border, #e5e7eb);
          background: var(--bg, #f8fafc);
        }

        .dwd-fit-analysis__suggestions-list {
          display: flex;
          flex-direction: column;
        }

        .dwd-fit-analysis__suggestion {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }

        .dwd-fit-analysis__suggestion:last-child {
          border-bottom: none;
        }

        .dwd-fit-analysis__suggestion-content {
          flex: 1;
        }

        .dwd-fit-analysis__guidance {
          padding: 16px 20px;
          background: var(--bg, #f8fafc);
        }

        .dwd-fit-analysis__guidance-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .dwd-fit-analysis__guidance-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Box>
  );
}
