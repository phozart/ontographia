// components/dwd/views/CaseBrowser.js
// DWD Case Browser - Browse and select work situations

import { useState, useMemo } from 'react';
import { useDWD } from '../DWDContext';

// MUI Icons
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function CaseBrowser({
  onSelectCase,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    cases,
    setActiveCase,
    DWD_CASE_STATUS,
  } = useDWD();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!c.name.toLowerCase().includes(search) &&
            !c.description?.toLowerCase().includes(search) &&
            !c.custom_fields?.summary?.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const status = c.custom_fields?.case_status || 'draft';
        if (status !== statusFilter) return false;
      }

      return true;
    });
  }, [cases, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: cases.length,
    byStatus: {
      draft: cases.filter(c => c.custom_fields?.case_status === 'draft' || !c.custom_fields?.case_status).length,
      active: cases.filter(c => c.custom_fields?.case_status === 'active').length,
      observed: cases.filter(c => c.custom_fields?.case_status === 'observed').length,
      stabilised: cases.filter(c => c.custom_fields?.case_status === 'stabilised').length,
      archived: cases.filter(c => c.custom_fields?.case_status === 'archived').length,
    },
  }), [cases]);

  const statusColors = {
    draft: '#9ca3af',
    active: '#3b82f6',
    observed: '#f59e0b',
    stabilised: '#10b981',
    archived: '#6b7280',
  };

  const handleOpenCase = (c) => {
    setActiveCase(c);
    onSelectCase?.(c);
  };

  return (
    <div className="dwd-case-browser">
      {/* Header */}
      <div className="dwd-view-header">
        <div className="dwd-view-stats">
          <span className="dwd-view-stat">
            <FolderIcon fontSize="small" />
            {stats.total} work situations
          </span>
          <span className="dwd-view-stat" style={{ color: '#3b82f6' }}>
            {stats.byStatus.active} active
          </span>
          <span className="dwd-view-stat" style={{ color: '#10b981' }}>
            {stats.byStatus.stabilised} stabilised
          </span>
        </div>

        <div className="dwd-view-actions">
          <div className="dwd-search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="dwd-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {DWD_CASE_STATUS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button
            className="btn btn--primary btn--small"
            onClick={() => onCreateArtefact?.('dwd_case')}
          >
            <AddIcon fontSize="small" />
            New Situation
          </button>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="dwd-cases-grid">
        {filteredCases.length === 0 ? (
          <div className="dwd-empty-state">
            <FolderIcon style={{ fontSize: 48, opacity: 0.3 }} />
            <p>No work situations found</p>
            <button
              className="btn btn--primary"
              onClick={() => onCreateArtefact?.('dwd_case')}
            >
              Create Your First Situation
            </button>
          </div>
        ) : (
          filteredCases.map(c => (
            <CaseCard
              key={c.id}
              workCase={c}
              statusColors={statusColors}
              onOpen={handleOpenCase}
              onEdit={onEditArtefact}
              onDelete={onDeleteArtefact}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Case card component
function CaseCard({ workCase, statusColors, onOpen, onEdit, onDelete }) {
  const customFields = workCase.custom_fields || {};
  const status = customFields.case_status || 'draft';
  const relatedCounts = workCase.relatedCounts || {};
  const completeness = workCase.completeness || { percentage: 0 };

  return (
    <div
      className="dwd-case-card"
      style={{ borderTopColor: statusColors[status] }}
    >
      <div className="dwd-case-card__header">
        <div className="dwd-case-card__icon" style={{ backgroundColor: `${statusColors[status]}15` }}>
          <FolderIcon style={{ color: statusColors[status] }} />
        </div>
        <div className="dwd-case-card__title">
          <h4>{workCase.name}</h4>
          <span
            className="dwd-case-card__status"
            style={{ backgroundColor: statusColors[status] }}
          >
            {status}
          </span>
        </div>
      </div>

      {customFields.summary && (
        <p className="dwd-case-card__summary">{customFields.summary}</p>
      )}

      {/* Related counts */}
      <div className="dwd-case-card__counts">
        <span className="dwd-case-card__count" title="Signals">
          <WarningIcon fontSize="small" />
          {relatedCounts.signals || 0}
        </span>
        <span className="dwd-case-card__count" title="Work Items">
          <AssignmentIcon fontSize="small" />
          {relatedCounts.workItems || 0}
        </span>
        <span className="dwd-case-card__count" title="Actors">
          <PersonIcon fontSize="small" />
          {relatedCounts.actors || 0}
        </span>
        <span className="dwd-case-card__count" title="Adjustments">
          <TuneIcon fontSize="small" />
          {relatedCounts.adjustments || 0}
        </span>
      </div>

      {/* Completeness bar */}
      <div className="dwd-case-card__completeness">
        <div className="dwd-case-card__completeness-bar">
          <div
            className="dwd-case-card__completeness-fill"
            style={{
              width: `${completeness.percentage}%`,
              backgroundColor: completeness.percentage >= 75 ? '#10b981' :
                             completeness.percentage >= 50 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
        <span className="dwd-case-card__completeness-label">
          {completeness.percentage}% complete
        </span>
      </div>

      {/* Actions */}
      <div className="dwd-case-card__actions">
        <button
          className="dwd-case-card__action dwd-case-card__action--primary"
          onClick={() => onOpen?.(workCase)}
        >
          <OpenInNewIcon fontSize="small" />
          Open
        </button>
        <button
          className="dwd-case-card__action"
          onClick={(e) => { e.stopPropagation(); onEdit?.(workCase); }}
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          className="dwd-case-card__action dwd-case-card__action--danger"
          onClick={(e) => { e.stopPropagation(); onDelete?.(workCase); }}
        >
          <DeleteIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
