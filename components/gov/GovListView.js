/**
 * GovListView - List and hierarchy views for governance artefacts
 *
 * @component
 * @module components/gov/GovListView
 */

import { useState, useMemo } from 'react';
import { GOV_TYPE_DEFS, GOV_POLICY_STATUS, GOV_AUTHORITY_LEVELS } from './GovContext';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GavelIcon from '@mui/icons-material/Gavel';
import GroupsIcon from '@mui/icons-material/Groups';
import PolicyIcon from '@mui/icons-material/Policy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const TYPE_ICONS = {
  gov_decision_type: CategoryIcon,
  gov_decision_right: GavelIcon,
  gov_forum: GroupsIcon,
  gov_policy: PolicyIcon,
  gov_escalation: TrendingUpIcon,
  gov_accountability: AccountBoxIcon,
  gov_principle: StarIcon,
};

/**
 * Artefact Card Component
 */
function ArtefactCard({ artefact, isSelected, onSelect, onEdit }) {
  const typeDef = GOV_TYPE_DEFS[artefact.artefact_type];
  const Icon = TYPE_ICONS[artefact.artefact_type] || CategoryIcon;

  // Get status badge for policies
  const getStatusBadge = () => {
    if (artefact.artefact_type !== 'gov_policy') return null;
    const status = artefact.custom_fields?.status;
    const statusDef = GOV_POLICY_STATUS[status];
    if (!statusDef) return null;
    return (
      <span
        className="status-badge"
        style={{ backgroundColor: statusDef.color }}
      >
        {statusDef.name}
      </span>
    );
  };

  // Get authority badge for forums
  const getAuthorityBadge = () => {
    if (artefact.artefact_type !== 'gov_forum') return null;
    const level = artefact.custom_fields?.authority_level;
    const levelDef = GOV_AUTHORITY_LEVELS[level];
    if (!levelDef) return null;
    return (
      <span
        className="authority-badge"
        style={{ backgroundColor: levelDef.color }}
      >
        {levelDef.name}
      </span>
    );
  };

  return (
    <div
      className={`artefact-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(artefact.id)}
    >
      <div className="card-icon" style={{ backgroundColor: `${typeDef?.color}20`, color: typeDef?.color }}>
        <Icon />
      </div>
      <div className="card-content">
        <div className="card-header">
          <h4>{artefact.name}</h4>
          {getStatusBadge()}
          {getAuthorityBadge()}
        </div>
        <p className="card-type">{typeDef?.name || artefact.artefact_type}</p>
        {artefact.description && (
          <p className="card-description">{artefact.description.slice(0, 100)}...</p>
        )}
        {artefact.custom_fields?.scope && (
          <span className="card-scope">{artefact.custom_fields.scope}</span>
        )}
      </div>
      <button className="card-edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(artefact); }}>
        <EditIcon fontSize="small" />
      </button>
    </div>
  );
}

/**
 * Tree Node Component for hierarchical views
 */
function TreeNode({ node, level, onSelect, onEdit, selectedId }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const typeDef = GOV_TYPE_DEFS[node.artefact_type];
  const Icon = TYPE_ICONS[node.artefact_type] || CategoryIcon;

  return (
    <div className="tree-node">
      <div
        className={`tree-node-header ${selectedId === node.id ? 'selected' : ''}`}
        style={{ paddingLeft: level * 24 + 12 }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </button>
        ) : (
          <span className="expand-placeholder" />
        )}
        <div className="node-icon" style={{ backgroundColor: `${typeDef?.color}20`, color: typeDef?.color }}>
          <Icon fontSize="small" />
        </div>
        <div className="node-content">
          <span className="node-name">{node.name}</span>
          {node.custom_fields?.forum_type && (
            <span className="node-type">{node.custom_fields.forum_type}</span>
          )}
          {node.custom_fields?.policy_type && (
            <span className="node-type">{node.custom_fields.policy_type}</span>
          )}
        </div>
        <button
          className="node-edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(node);
          }}
        >
          <EditIcon fontSize="small" />
        </button>
      </div>
      {expanded && hasChildren && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * GovListView Component
 */
export default function GovListView({
  artefacts,
  onSelect,
  onEdit,
  onCreate,
  selectedId,
  moduleId,
  viewMode = 'list',
  structure,
  hierarchy,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Get unique types from artefacts
  const availableTypes = useMemo(() => {
    const types = new Set(artefacts.map(a => a.artefact_type));
    return Array.from(types).map(t => ({
      id: t,
      name: GOV_TYPE_DEFS[t]?.name || t,
    }));
  }, [artefacts]);

  // Filter artefacts
  const filteredArtefacts = useMemo(() => {
    return artefacts.filter(a => {
      const matchesSearch = !searchTerm ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || a.artefact_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [artefacts, searchTerm, filterType]);

  // Render hierarchical view
  if (viewMode === 'structure' && structure) {
    return (
      <div className="gov-list-view">
        <div className="list-header">
          <div className="header-left">
            <h3>Governance Structure</h3>
            <span className="count">{artefacts.length} forums</span>
          </div>
          <button className="btn-create" onClick={() => onCreate()}>
            <AddIcon fontSize="small" />
            Add Forum
          </button>
        </div>
        <div className="tree-view">
          {structure.length === 0 ? (
            <div className="empty-state">
              <GroupsIcon style={{ fontSize: 48, color: 'var(--text-muted)' }} />
              <p>No forums defined yet</p>
              <button className="btn-create" onClick={() => onCreate()}>
                <AddIcon fontSize="small" />
                Create First Forum
              </button>
            </div>
          ) : (
            structure.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                onSelect={onSelect}
                onEdit={onEdit}
                selectedId={selectedId}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // Render policy hierarchy view
  if (viewMode === 'hierarchy' && hierarchy) {
    return (
      <div className="gov-list-view">
        <div className="list-header">
          <div className="header-left">
            <h3>Policy Hierarchy</h3>
            <span className="count">{artefacts.length} policies</span>
          </div>
          <button className="btn-create" onClick={() => onCreate()}>
            <AddIcon fontSize="small" />
            Add Policy
          </button>
        </div>
        <div className="tree-view">
          {hierarchy.length === 0 ? (
            <div className="empty-state">
              <PolicyIcon style={{ fontSize: 48, color: 'var(--text-muted)' }} />
              <p>No policies defined yet</p>
              <button className="btn-create" onClick={() => onCreate()}>
                <AddIcon fontSize="small" />
                Create First Policy
              </button>
            </div>
          ) : (
            hierarchy.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                onSelect={onSelect}
                onEdit={onEdit}
                selectedId={selectedId}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // Render list view
  return (
    <div className="gov-list-view">
      <div className="list-header">
        <div className="header-left">
          <div className="search-box">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {availableTypes.length > 1 && (
            <div className="filter-dropdown">
              <FilterListIcon fontSize="small" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                {availableTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button className="btn-create" onClick={() => onCreate()}>
          <AddIcon fontSize="small" />
          Add New
        </button>
      </div>

      <div className="artefact-list">
        {filteredArtefacts.length === 0 ? (
          <div className="empty-state">
            <CategoryIcon style={{ fontSize: 48, color: 'var(--text-muted)' }} />
            <p>No artefacts found</p>
            <button className="btn-create" onClick={() => onCreate()}>
              <AddIcon fontSize="small" />
              Create First Artefact
            </button>
          </div>
        ) : (
          filteredArtefacts.map((artefact) => (
            <ArtefactCard
              key={artefact.id}
              artefact={artefact}
              isSelected={selectedId === artefact.id}
              onSelect={onSelect}
              onEdit={onEdit}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .gov-list-view {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-left h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text);
        }

        .count {
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 4px 10px;
          background: var(--border);
          border-radius: 12px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-muted);
        }

        .search-box input {
          border: none;
          background: none;
          color: var(--text);
          font-size: 0.9rem;
          width: 200px;
        }

        .search-box input:focus {
          outline: none;
        }

        .filter-dropdown {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-muted);
        }

        .filter-dropdown select {
          border: none;
          background: none;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .btn-create {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-create:hover {
          opacity: 0.9;
        }

        .artefact-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .artefact-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .artefact-card:hover {
          border-color: var(--accent);
        }

        .artefact-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
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
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .card-header h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--text);
        }

        .status-badge, .authority-badge {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 4px;
          color: white;
          font-weight: 500;
        }

        .card-type {
          margin: 4px 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .card-description {
          margin: 8px 0 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .card-scope {
          display: inline-block;
          margin-top: 8px;
          font-size: 0.75rem;
          padding: 2px 8px;
          background: var(--border);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .card-edit-btn {
          padding: 8px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .artefact-card:hover .card-edit-btn {
          opacity: 1;
        }

        .card-edit-btn:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        /* Tree View */
        .tree-view {
          flex: 1;
          overflow-y: auto;
        }

        .tree-node-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .tree-node-header:hover {
          background: var(--bg);
        }

        .tree-node-header.selected {
          background: var(--accent-soft);
        }

        .expand-btn {
          padding: 2px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
        }

        .expand-placeholder {
          width: 24px;
        }

        .node-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }

        .node-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .node-name {
          font-size: 0.9rem;
          color: var(--text);
        }

        .node-type {
          font-size: 0.7rem;
          padding: 2px 6px;
          background: var(--border);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .node-edit-btn {
          padding: 6px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .tree-node-header:hover .node-edit-btn {
          opacity: 1;
        }

        .node-edit-btn:hover {
          color: var(--accent);
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
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
