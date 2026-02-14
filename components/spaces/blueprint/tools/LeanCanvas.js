// components/spaces/blueprint/tools/LeanCanvas.js
// Lean Canvas - One-page business model

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';
import GroupsIcon from '@mui/icons-material/Groups';
import CampaignIcon from '@mui/icons-material/Campaign';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import SaveIcon from '@mui/icons-material/Save';

const LEAN_SECTIONS = [
  { id: 'problem', name: 'Problem', icon: ReportProblemIcon, hint: 'Top 3 problems', row: 1, col: 1 },
  { id: 'solution', name: 'Solution', icon: CheckCircleIcon, hint: 'Top 3 features', row: 1, col: 2 },
  { id: 'uniqueValue', name: 'Unique Value Proposition', icon: StarIcon, hint: 'Single, clear message', row: 1, col: 3, wide: true },
  { id: 'unfairAdvantage', name: 'Unfair Advantage', icon: EmojiObjectsIcon, hint: 'Can\'t be easily copied', row: 1, col: 4 },
  { id: 'customerSegments', name: 'Customer Segments', icon: GroupsIcon, hint: 'Target customers', row: 1, col: 5 },
  { id: 'keyMetrics', name: 'Key Metrics', icon: BarChartIcon, hint: 'Key activities you measure', row: 2, col: 2 },
  { id: 'channels', name: 'Channels', icon: CampaignIcon, hint: 'Path to customers', row: 2, col: 4 },
  { id: 'costStructure', name: 'Cost Structure', icon: AccountBalanceWalletIcon, hint: 'Customer acquisition, distribution, hosting, etc.', row: 3, col: 'left' },
  { id: 'revenueStreams', name: 'Revenue Streams', icon: MonetizationOnIcon, hint: 'Revenue model, lifetime value, revenue, gross margin', row: 3, col: 'right' },
];

const EMPTY_CANVAS = LEAN_SECTIONS.reduce((acc, section) => {
  acc[section.id] = '';
  return acc;
}, {});

export default function LeanCanvas() {
  const { updateInitiative, activeInitiative } = useBlueprint();

  // Use activeInitiative from context
  const selectedInitiative = activeInitiative;

  // Get canvas data from initiative or use empty
  const canvasData = useMemo(() => {
    return selectedInitiative?.canvases?.lean || EMPTY_CANVAS;
  }, [selectedInitiative]);

  const [localData, setLocalData] = useState(canvasData);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset local data when selected initiative changes
  useEffect(() => {
    setLocalData(selectedInitiative?.canvases?.lean || EMPTY_CANVAS);
    setHasChanges(false);
  }, [selectedInitiative?.id]);

  // Handle text change
  const handleChange = useCallback((sectionId, value) => {
    setLocalData(prev => ({
      ...prev,
      [sectionId]: value,
    }));
    setHasChanges(true);
  }, []);

  // Save canvas
  const handleSave = useCallback(async () => {
    if (!selectedInitiative) return;

    try {
      await updateInitiative(selectedInitiative.id, {
        canvases: {
          ...selectedInitiative.canvases,
          lean: localData,
        },
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  }, [selectedInitiative, localData, updateInitiative]);

  // No initiative selected
  if (!selectedInitiative) {
    return (
      <div className="canvas-empty">
        <AssignmentIcon />
        <h3>Select an Initiative</h3>
        <p>Choose an initiative from the Initiative Board to work on its Lean Canvas</p>
      </div>
    );
  }

  return (
    <div className="lean-canvas">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <AssignmentIcon />
          <div>
            <h2>Lean Canvas</h2>
            <p>{selectedInitiative.display_id}: {selectedInitiative.name}</p>
          </div>
        </div>
        <div className="canvas-header-right">
          {hasChanges && (
            <button className="btn btn-primary" onClick={handleSave}>
              <SaveIcon fontSize="small" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="lean-canvas-grid">
        {/* Row 1: Problem, Solution, UVP, Unfair Advantage, Customer Segments */}
        <div className="lean-canvas-row lean-canvas-row--main">
          {/* Problem */}
          <div className="lean-canvas-cell lean-canvas-cell--problem">
            <div className="lean-canvas-cell-header">
              <ReportProblemIcon />
              <span>Problem</span>
            </div>
            <p className="lean-canvas-cell-hint">Top 3 problems</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.problem || ''}
              onChange={(e) => handleChange('problem', e.target.value)}
              placeholder="1. &#10;2. &#10;3. "
            />
            <div className="lean-canvas-sub">
              <span className="lean-canvas-sub-label">Existing Alternatives</span>
              <textarea
                className="lean-canvas-textarea lean-canvas-textarea--small"
                value={localData.existingAlternatives || ''}
                onChange={(e) => handleChange('existingAlternatives', e.target.value)}
                placeholder="How do people solve this today?"
              />
            </div>
          </div>

          {/* Solution */}
          <div className="lean-canvas-cell lean-canvas-cell--solution">
            <div className="lean-canvas-cell-header">
              <CheckCircleIcon />
              <span>Solution</span>
            </div>
            <p className="lean-canvas-cell-hint">Top 3 features</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.solution || ''}
              onChange={(e) => handleChange('solution', e.target.value)}
              placeholder="1. &#10;2. &#10;3. "
            />
          </div>

          {/* Unique Value Proposition */}
          <div className="lean-canvas-cell lean-canvas-cell--uvp">
            <div className="lean-canvas-cell-header">
              <StarIcon />
              <span>Unique Value Proposition</span>
            </div>
            <p className="lean-canvas-cell-hint">Single, clear, compelling message that states why you are different and worth buying</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.uniqueValue || ''}
              onChange={(e) => handleChange('uniqueValue', e.target.value)}
              placeholder="For [customer segment] who [has problem], our [product] provides [key benefit]. Unlike [alternatives], we [key differentiator]."
            />
            <div className="lean-canvas-sub">
              <span className="lean-canvas-sub-label">High-Level Concept</span>
              <textarea
                className="lean-canvas-textarea lean-canvas-textarea--small"
                value={localData.highLevelConcept || ''}
                onChange={(e) => handleChange('highLevelConcept', e.target.value)}
                placeholder="X for Y (e.g., 'YouTube for cats')"
              />
            </div>
          </div>

          {/* Unfair Advantage */}
          <div className="lean-canvas-cell lean-canvas-cell--advantage">
            <div className="lean-canvas-cell-header">
              <EmojiObjectsIcon />
              <span>Unfair Advantage</span>
            </div>
            <p className="lean-canvas-cell-hint">Something that cannot be easily copied or bought</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.unfairAdvantage || ''}
              onChange={(e) => handleChange('unfairAdvantage', e.target.value)}
              placeholder="Insider info, right team, reputation, network effects, community, SEO, patents, etc."
            />
          </div>

          {/* Customer Segments */}
          <div className="lean-canvas-cell lean-canvas-cell--customers">
            <div className="lean-canvas-cell-header">
              <GroupsIcon />
              <span>Customer Segments</span>
            </div>
            <p className="lean-canvas-cell-hint">Target customers</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.customerSegments || ''}
              onChange={(e) => handleChange('customerSegments', e.target.value)}
              placeholder="Who are your ideal customers?"
            />
            <div className="lean-canvas-sub">
              <span className="lean-canvas-sub-label">Early Adopters</span>
              <textarea
                className="lean-canvas-textarea lean-canvas-textarea--small"
                value={localData.earlyAdopters || ''}
                onChange={(e) => handleChange('earlyAdopters', e.target.value)}
                placeholder="First target customers"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Key Metrics, Channels (spanning under relevant cells) */}
        <div className="lean-canvas-row lean-canvas-row--middle">
          <div className="lean-canvas-spacer" /> {/* Under Problem */}

          {/* Key Metrics */}
          <div className="lean-canvas-cell lean-canvas-cell--metrics">
            <div className="lean-canvas-cell-header">
              <BarChartIcon />
              <span>Key Metrics</span>
            </div>
            <p className="lean-canvas-cell-hint">Key activities you measure</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.keyMetrics || ''}
              onChange={(e) => handleChange('keyMetrics', e.target.value)}
              placeholder="Activation, Retention, Revenue, Referral metrics"
            />
          </div>

          <div className="lean-canvas-spacer" /> {/* Under UVP */}

          {/* Channels */}
          <div className="lean-canvas-cell lean-canvas-cell--channels">
            <div className="lean-canvas-cell-header">
              <CampaignIcon />
              <span>Channels</span>
            </div>
            <p className="lean-canvas-cell-hint">Path to customers</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.channels || ''}
              onChange={(e) => handleChange('channels', e.target.value)}
              placeholder="How will you reach your customers?"
            />
          </div>

          <div className="lean-canvas-spacer" /> {/* Under Customers */}
        </div>

        {/* Row 3: Cost Structure, Revenue Streams */}
        <div className="lean-canvas-row lean-canvas-row--bottom">
          {/* Cost Structure */}
          <div className="lean-canvas-cell lean-canvas-cell--costs">
            <div className="lean-canvas-cell-header">
              <AccountBalanceWalletIcon />
              <span>Cost Structure</span>
            </div>
            <p className="lean-canvas-cell-hint">Customer acquisition costs, distribution costs, hosting, people, etc.</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.costStructure || ''}
              onChange={(e) => handleChange('costStructure', e.target.value)}
              placeholder="List your fixed and variable costs"
            />
          </div>

          {/* Revenue Streams */}
          <div className="lean-canvas-cell lean-canvas-cell--revenue">
            <div className="lean-canvas-cell-header">
              <MonetizationOnIcon />
              <span>Revenue Streams</span>
            </div>
            <p className="lean-canvas-cell-hint">Revenue model, lifetime value, revenue, gross margin</p>
            <textarea
              className="lean-canvas-textarea"
              value={localData.revenueStreams || ''}
              onChange={(e) => handleChange('revenueStreams', e.target.value)}
              placeholder="How will you make money?"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
