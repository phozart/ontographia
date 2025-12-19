/**
 * Risk List View Component
 *
 * Displays a list of risk artefacts with filtering and sorting.
 */

import { useState, useMemo } from 'react';
import { useRisk } from './RiskContext';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import {
  RISK_TYPE_DEFS,
  RISK_CATEGORIES,
  RISK_STAGES,
  getRiskLevel,
  calculateRiskScore,
} from '../../lib/risk-types';

const TYPE_ICONS = {
  risk_risk: WarningIcon,
  risk_control: SecurityIcon,
  risk_resilience: ShieldIcon,
  risk_scenario: TimelineIcon,
  risk_assessment: AssessmentIcon,
};

export default function RiskListView({ type, onSelect, onEdit, onDelete, onCreate }) {
  const { artefacts, loading } = useRisk();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Filter artefacts by type
  const typeArtefacts = useMemo(() => {
    return artefacts.filter(a => a.type === type);
  }, [artefacts, type]);

  // Apply filters and sorting
  const filteredArtefacts = useMemo(() => {
    let result = [...typeArtefacts];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(a =>
        a.name?.toLowerCase().includes(searchLower) ||
        a.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter (for risks)
    if (categoryFilter !== 'all' && type === 'risk_risk') {
      result = result.filter(a => a.properties?.category === categoryFilter);
    }

    // Stage filter
    if (stageFilter !== 'all') {
      result = result.filter(a => a.properties?.stage === stageFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'score':
          aVal = calculateRiskScore(a.properties?.likelihood, a.properties?.impact);
          bVal = calculateRiskScore(b.properties?.likelihood, b.properties?.impact);
          break;
        case 'stage':
          aVal = RISK_STAGES[a.properties?.stage]?.order || 0;
          bVal = RISK_STAGES[b.properties?.stage]?.order || 0;
          break;
        case 'updated':
          aVal = new Date(a.updatedAt || 0).getTime();
          bVal = new Date(b.updatedAt || 0).getTime();
          break;
        default:
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [typeArtefacts, search, categoryFilter, stageFilter, sortBy, sortDir, type]);

  const typeDef = RISK_TYPE_DEFS[type];
  const TypeIcon = TYPE_ICONS[type] || WarningIcon;

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="risk-list-view">
      {/* Header */}
      <div className="list-header">
        <div className="list-header__title">
          <TypeIcon style={{ color: typeDef?.color }} />
          <h2>{typeDef?.label || 'Artefacts'}</h2>
          <span className="count-badge">{filteredArtefacts.length}</span>
        </div>
        <button className="btn-primary" onClick={() => onCreate?.(type)}>
          <AddIcon fontSize="small" />
          Add {typeDef?.label}
        </button>
      </div>

      {/* Filters */}
      <div className="list-filters">
        <div className="search-box">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder={`Search ${typeDef?.label?.toLowerCase() || 'artefacts'}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {type === 'risk_risk' && (
          <select
            className="form-select filter-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {Object.entries(RISK_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
            ))}
          </select>
        )}

        <select
          className="form-select filter-select"
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
        >
          <option value="all">All Stages</option>
          {Object.entries(RISK_STAGES).map(([key, stage]) => (
            <option key={key} value={key}>{stage.label}</option>
          ))}
        </select>

        <select
          className="form-select filter-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          {type === 'risk_risk' && <option value="score">Sort by Risk Score</option>}
          <option value="stage">Sort by Stage</option>
          <option value="updated">Sort by Updated</option>
        </select>

        <button
          className="btn-ghost"
          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
        >
          <SortIcon style={{ transform: sortDir === 'desc' ? 'scaleY(-1)' : 'none' }} />
        </button>
      </div>

      {/* List */}
      {filteredArtefacts.length === 0 ? (
        <div className="empty-state">
          <TypeIcon style={{ fontSize: 48, color: 'var(--text-muted)' }} />
          <p>No {typeDef?.label?.toLowerCase() || 'artefacts'} found</p>
          <button className="btn-primary" onClick={() => onCreate?.(type)}>
            <AddIcon fontSize="small" />
            Create First {typeDef?.label}
          </button>
        </div>
      ) : (
        <div className="artefact-list">
          {filteredArtefacts.map(artefact => (
            <ArtefactCard
              key={artefact.id}
              artefact={artefact}
              typeDef={typeDef}
              TypeIcon={TypeIcon}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .risk-list-view {
          padding: 24px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .list-header__title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .list-header__title h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text);
        }

        .count-badge {
          font-size: 0.75rem;
          padding: 2px 10px;
          background: var(--border);
          border-radius: 12px;
          color: var(--text-muted);
        }

        .list-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          flex: 1;
          min-width: 200px;
          color: var(--text-muted);
        }

        .search-box input {
          border: none;
          background: none;
          color: var(--text);
          font-size: 0.9rem;
          flex: 1;
          outline: none;
        }

        .filter-select {
          padding: 8px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--text);
          cursor: pointer;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-ghost {
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .btn-ghost:hover {
          background: var(--bg);
          color: var(--text);
        }

        .artefact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
        }

        .empty-state p {
          margin: 16px 0;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

// Artefact Card Component
function ArtefactCard({ artefact, typeDef, TypeIcon, onSelect, onEdit, onDelete }) {
  const riskScore = artefact.type === 'risk_risk'
    ? calculateRiskScore(artefact.properties?.likelihood, artefact.properties?.impact)
    : null;
  const riskLevel = riskScore ? getRiskLevel(riskScore) : null;
  const stage = RISK_STAGES[artefact.properties?.stage];
  const category = RISK_CATEGORIES[artefact.properties?.category];

  return (
    <div className="artefact-card" onClick={() => onSelect?.(artefact)}>
      <div className="card-icon" style={{ background: `${typeDef?.color}20`, color: typeDef?.color }}>
        <TypeIcon />
      </div>

      <div className="card-content">
        <div className="card-header">
          <h4>{artefact.name}</h4>
          <div className="card-badges">
            {riskLevel && (
              <span
                className="risk-badge"
                style={{ background: `${riskLevel.color}20`, color: riskLevel.color }}
              >
                {riskLevel.label} ({riskScore})
              </span>
            )}
            {stage && (
              <span className="stage-badge" style={{ background: `${stage.color}20`, color: stage.color }}>
                {stage.label}
              </span>
            )}
          </div>
        </div>

        {artefact.description && (
          <p className="card-description">{artefact.description}</p>
        )}

        <div className="card-meta">
          {category && (
            <span className="meta-item">
              <span className="meta-dot" style={{ background: category.color }} />
              {category.label}
            </span>
          )}
          {artefact.properties?.owner && (
            <span className="meta-item">Owner: {artefact.properties.owner}</span>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button
          className="action-btn"
          onClick={e => { e.stopPropagation(); onEdit?.(artefact); }}
          title="Edit"
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          className="action-btn action-btn--danger"
          onClick={e => { e.stopPropagation(); onDelete?.(artefact); }}
          title="Delete"
        >
          <DeleteIcon fontSize="small" />
        </button>
      </div>

      <style jsx>{`
        .artefact-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .artefact-card:hover {
          border-color: var(--accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .card-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .card-content {
          flex: 1;
          min-width: 0;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }

        .card-header h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--text);
        }

        .card-badges {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .risk-badge,
        .stage-badge {
          font-size: 0.7rem;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .card-description {
          margin: 8px 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .meta-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .card-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .artefact-card:hover .card-actions {
          opacity: 1;
        }

        .action-btn {
          padding: 8px;
          background: none;
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .action-btn:hover {
          background: var(--bg);
          color: var(--text);
        }

        .action-btn--danger:hover {
          background: #fee2e2;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
