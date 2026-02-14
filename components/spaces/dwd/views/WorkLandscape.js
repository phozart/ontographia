// components/dwd/views/WorkLandscape.js
// DWD Work Landscape View - Work items clustered by volatility and state

import { useState, useMemo } from 'react';
import { useDWD } from '../DWDContext';
import DWDArtefactCard from '../artefacts/DWDArtefactCard';
import GuidancePanel from '../shared/GuidancePanel';
import QuickStartCard from '../shared/QuickStartCard';
import { WORK_LANDSCAPE_GUIDANCE } from '../../../../lib/dwd-guidance';

// MUI Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SearchIcon from '@mui/icons-material/Search';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';

// Volatility column header with guidance
function VolatilityColumnHeader({ level, count, color }) {
  const levelInfo = WORK_LANDSCAPE_GUIDANCE.sections
    .find(s => s.id === 'levels')?.levels
    ?.find(l => l.level.toLowerCase().includes(level));

  return (
    <div className="dwd-matrix-header" style={{ backgroundColor: `${color}15`, borderColor: color }}>
      <div className="dwd-matrix-header__main">
        <span className="dwd-matrix-title">{levelInfo?.level || `${level} Volatility`}</span>
        <span className="dwd-matrix-count">{count}</span>
      </div>
      <span className="dwd-matrix-hint">{levelInfo?.description || ''}</span>
      {levelInfo?.examples && (
        <span className="dwd-matrix-examples">
          <InfoIcon fontSize="small" />
          e.g., {levelInfo.examples.slice(0, 2).join(', ')}
        </span>
      )}
    </div>
  );
}

export default function WorkLandscape({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    artefacts,
    getArtefactsByType,
    activeCase,
    getCaseArtefacts,
    DWD_WORK_ITEM_STATE,
    DWD_VOLATILITY_LEVELS,
  } = useDWD();

  const [viewMode, setViewMode] = useState('matrix');
  const [stateFilter, setStateFilter] = useState('all');
  const [volatilityFilter, setVolatilityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);

  // Get work items (filtered by active case if set)
  const workItems = useMemo(() => {
    const items = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_work_item')
      : getArtefactsByType('dwd_work_item');

    return items.filter(item => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!item.name.toLowerCase().includes(search) &&
            !item.description?.toLowerCase().includes(search)) {
          return false;
        }
      }

      if (stateFilter !== 'all') {
        const itemState = item.custom_fields?.item_state || 'open';
        if (itemState !== stateFilter) return false;
      }

      if (volatilityFilter !== 'all') {
        const volatility = item.custom_fields?.volatility || 'medium';
        if (volatility !== volatilityFilter) return false;
      }

      return true;
    });
  }, [activeCase, getCaseArtefacts, getArtefactsByType, searchTerm, stateFilter, volatilityFilter]);

  // Get signals related to work items
  const signals = useMemo(() => {
    const allSignals = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_signal')
      : getArtefactsByType('dwd_signal');
    return allSignals;
  }, [activeCase, getCaseArtefacts, getArtefactsByType]);

  // Group by volatility for matrix view
  const itemsByVolatility = useMemo(() => {
    const groups = {
      high: workItems.filter(i => i.custom_fields?.volatility === 'high'),
      medium: workItems.filter(i => i.custom_fields?.volatility === 'medium' || !i.custom_fields?.volatility),
      low: workItems.filter(i => i.custom_fields?.volatility === 'low'),
    };
    return groups;
  }, [workItems]);

  // Stats
  const stats = useMemo(() => ({
    total: workItems.length,
    blocked: workItems.filter(i => i.custom_fields?.item_state === 'blocked').length,
    highVolatility: workItems.filter(i => i.custom_fields?.volatility === 'high').length,
    signals: signals.length,
    highImpactSignals: signals.filter(s => s.custom_fields?.impact === 'high').length,
  }), [workItems, signals]);

  const isEmpty = workItems.length === 0 && !searchTerm && stateFilter === 'all' && volatilityFilter === 'all';

  return (
    <div className="dwd-work-landscape">
      {/* Guidance Panel */}
      {showGuidance && (
        <GuidancePanel
          guidance={WORK_LANDSCAPE_GUIDANCE}
          onClose={() => setShowGuidance(false)}
        />
      )}

      {/* Header with stats */}
      <div className="dwd-view-header">
        <div className="dwd-view-header__left">
          <h2>Work Landscape</h2>
          <p>Map work activities by volatility to design appropriate coordination</p>
        </div>

        <div className="dwd-view-stats">
          <span className="dwd-view-stat">
            <AssignmentIcon fontSize="small" />
            {stats.total} work items
          </span>
          {stats.blocked > 0 && (
            <span className="dwd-view-stat dwd-view-stat--warning">
              {stats.blocked} blocked
            </span>
          )}
          {stats.highVolatility > 0 && (
            <span className="dwd-view-stat dwd-view-stat--danger">
              {stats.highVolatility} high volatility
            </span>
          )}
          {stats.signals > 0 && (
            <span className="dwd-view-stat">
              <WarningIcon fontSize="small" />
              {stats.signals} signals
            </span>
          )}
        </div>
      </div>

      <div className="dwd-view-actions">
        {/* Search */}
        <div className="dwd-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search work items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <select
          className="dwd-filter-select"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
        >
          <option value="all">All states</option>
          {DWD_WORK_ITEM_STATE?.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          className="dwd-filter-select"
          value={volatilityFilter}
          onChange={(e) => setVolatilityFilter(e.target.value)}
        >
          <option value="all">All volatility</option>
          {DWD_VOLATILITY_LEVELS?.map(v => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>

        {/* View toggle */}
        <div className="dwd-view-toggle">
          <button
            className={viewMode === 'matrix' ? 'active' : ''}
            onClick={() => setViewMode('matrix')}
            title="Matrix view"
          >
            <ViewModuleIcon fontSize="small" />
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <ViewListIcon fontSize="small" />
          </button>
        </div>

        {/* Help button */}
        <button
          className="btn btn--ghost btn--small"
          onClick={() => setShowGuidance(true)}
        >
          <HelpIcon fontSize="small" />
          How to use
        </button>

        {/* Create button */}
        <button
          className="btn btn--primary btn--small"
          onClick={() => onCreateArtefact?.('dwd_work_item')}
        >
          <AddIcon fontSize="small" />
          Add Work Item
        </button>
      </div>

      {/* Empty State with Quick Start */}
      {isEmpty && (
        <QuickStartCard
          quickStart={WORK_LANDSCAPE_GUIDANCE.quickStart}
          onCreate={onCreateArtefact}
          showVolatilityGuide={true}
        />
      )}

      {/* Matrix View */}
      {!isEmpty && viewMode === 'matrix' && (
        <div className="dwd-volatility-matrix">
          {/* High Volatility */}
          <div className="dwd-matrix-column dwd-matrix-column--high">
            <VolatilityColumnHeader level="high" count={itemsByVolatility.high.length} color="#ef4444" />
            <div className="dwd-matrix-content">
              {itemsByVolatility.high.length === 0 ? (
                <div className="dwd-matrix-empty">
                  <p>No high volatility items</p>
                  <span className="dwd-matrix-empty-hint">
                    Work with unpredictable timing or changing requirements
                  </span>
                </div>
              ) : (
                itemsByVolatility.high.map(item => (
                  <DWDArtefactCard
                    key={item.id}
                    artefact={item}
                    onSelect={onSelectArtefact}
                    onEdit={onEditArtefact}
                    onDelete={onDeleteArtefact}
                  />
                ))
              )}
            </div>
          </div>

          {/* Medium Volatility */}
          <div className="dwd-matrix-column dwd-matrix-column--medium">
            <VolatilityColumnHeader level="medium" count={itemsByVolatility.medium.length} color="#f59e0b" />
            <div className="dwd-matrix-content">
              {itemsByVolatility.medium.length === 0 ? (
                <div className="dwd-matrix-empty">
                  <p>No medium volatility items</p>
                  <span className="dwd-matrix-empty-hint">
                    Work with some variability but known patterns
                  </span>
                </div>
              ) : (
                itemsByVolatility.medium.map(item => (
                  <DWDArtefactCard
                    key={item.id}
                    artefact={item}
                    onSelect={onSelectArtefact}
                    onEdit={onEditArtefact}
                    onDelete={onDeleteArtefact}
                  />
                ))
              )}
            </div>
          </div>

          {/* Low Volatility */}
          <div className="dwd-matrix-column dwd-matrix-column--low">
            <VolatilityColumnHeader level="low" count={itemsByVolatility.low.length} color="#10b981" />
            <div className="dwd-matrix-content">
              {itemsByVolatility.low.length === 0 ? (
                <div className="dwd-matrix-empty">
                  <p>No low volatility items</p>
                  <span className="dwd-matrix-empty-hint">
                    Predictable, routine work that follows patterns
                  </span>
                </div>
              ) : (
                itemsByVolatility.low.map(item => (
                  <DWDArtefactCard
                    key={item.id}
                    artefact={item}
                    onSelect={onSelectArtefact}
                    onEdit={onEditArtefact}
                    onDelete={onDeleteArtefact}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {!isEmpty && viewMode === 'list' && (
        <div className="dwd-list-view">
          <div className="dwd-cards-list">
            {workItems.map(item => (
              <DWDArtefactCard
                key={item.id}
                artefact={item}
                onSelect={onSelectArtefact}
                onEdit={onEditArtefact}
                onDelete={onDeleteArtefact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isEmpty && workItems.length === 0 && (
        <div className="dwd-empty-filtered">
          <p>No work items match your filters.</p>
          <button
            className="btn btn--secondary"
            onClick={() => {
              setSearchTerm('');
              setStateFilter('all');
              setVolatilityFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Signals Panel */}
      {signals.length > 0 && (
        <div className="dwd-signals-panel">
          <h4>
            <WarningIcon fontSize="small" />
            Related Signals ({signals.length})
            {stats.highImpactSignals > 0 && (
              <span className="dwd-signals-panel__alert">
                {stats.highImpactSignals} high impact
              </span>
            )}
          </h4>
          <p className="dwd-signals-panel__hint">
            Signals indicate problems or opportunities in how work is being handled
          </p>
          <div className="dwd-signals-list">
            {signals.slice(0, 5).map(signal => (
              <DWDArtefactCard
                key={signal.id}
                artefact={signal}
                compact
                onSelect={onSelectArtefact}
                showActions={false}
              />
            ))}
            {signals.length > 5 && (
              <button className="dwd-signals-more">
                +{signals.length - 5} more signals
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
