// components/spaces/analysis/requirements/RequirementsTree.js
// Hierarchical tree view for requirements with expand/collapse, search, and inline add.

import { useState, useMemo, useCallback } from 'react';
import { ANALYSIS_ARTEFACT_TYPES, ANALYSIS_STATUS } from '../../../../lib/analysis-types';
import { VALID_HIERARCHY } from '../../../../lib/analysis-rules';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

/**
 * RequirementsTree - Hierarchical tree view for requirements.
 *
 * @param {Object} props
 * @param {function} props.onSelect - Called with artefact when a node is clicked
 * @param {function} [props.onAddChild] - Called with (parentId, artefactType) to create a child
 * @param {string} [props.selectedId] - Currently selected artefact ID
 */
export default function RequirementsTree({ onSelect, onAddChild, selectedId }) {
  const { getArtefactsByModule, createArtefact } = useAnalysis();

  const allRequirements = useMemo(() => getArtefactsByModule('requirements'), [getArtefactsByModule]);

  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter requirements based on search and filters
  const filteredRequirements = useMemo(() => {
    let items = allRequirements;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (a) =>
          (a.name || '').toLowerCase().includes(query) ||
          (a.reference_number || '').toLowerCase().includes(query) ||
          (a.description || '').toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      items = items.filter((a) => a.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      items = items.filter((a) => a.artefactType === typeFilter);
    }

    return items;
  }, [allRequirements, searchQuery, statusFilter, typeFilter]);

  // Build tree structure from flat list
  const { rootNodes, childrenMap } = useMemo(() => {
    const childMap = {};
    const roots = [];
    const filteredIds = new Set(filteredRequirements.map((a) => a.id));

    // First pass: build children map
    for (const artefact of allRequirements) {
      const parentId = artefact.parent_id;
      if (parentId) {
        if (!childMap[parentId]) childMap[parentId] = [];
        childMap[parentId].push(artefact);
      }
    }

    // Sort children by sort_order, then reference_number, then name
    for (const key of Object.keys(childMap)) {
      childMap[key].sort((a, b) => {
        if (a.sort_order !== undefined && b.sort_order !== undefined) {
          return a.sort_order - b.sort_order;
        }
        const refA = a.reference_number || '';
        const refB = b.reference_number || '';
        if (refA && refB) return refA.localeCompare(refB, undefined, { numeric: true });
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    // When filtering, we need to show nodes that match OR have descendants that match
    const hasMatchingDescendant = (id) => {
      if (filteredIds.has(id)) return true;
      const children = childMap[id] || [];
      return children.some((child) => hasMatchingDescendant(child.id));
    };

    // Determine root nodes
    for (const artefact of allRequirements) {
      if (!artefact.parent_id) {
        if (searchQuery || statusFilter !== 'all' || typeFilter !== 'all') {
          if (hasMatchingDescendant(artefact.id)) {
            roots.push(artefact);
          }
        } else {
          roots.push(artefact);
        }
      }
    }

    roots.sort((a, b) => {
      if (a.sort_order !== undefined && b.sort_order !== undefined) {
        return a.sort_order - b.sort_order;
      }
      const refA = a.reference_number || '';
      const refB = b.reference_number || '';
      if (refA && refB) return refA.localeCompare(refB, undefined, { numeric: true });
      return (a.name || '').localeCompare(b.name || '');
    });

    return { rootNodes: roots, childrenMap: childMap };
  }, [allRequirements, filteredRequirements, searchQuery, statusFilter, typeFilter]);

  const toggleExpand = useCallback((nodeId) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allIds = new Set(allRequirements.map((a) => a.id));
    setExpandedNodes(allIds);
  }, [allRequirements]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const handleAddChild = useCallback(
    (parentId, parentType) => {
      if (onAddChild) {
        // Determine valid child type
        const validChildren = VALID_HIERARCHY[parentType] || [];
        const defaultChild = validChildren[0] || parentType;
        onAddChild(parentId, defaultChild);
      }
    },
    [onAddChild]
  );

  // Requirement types in this module
  const requirementTypes = useMemo(() => {
    const moduleTypes = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'NonFunctionalRequirement', 'BusinessRule', 'UseCase'];
    return moduleTypes.map((id) => ({ id, ...ANALYSIS_ARTEFACT_TYPES[id] }));
  }, []);

  return (
    <div className="requirements-tree">
      {/* Search and filter bar */}
      <div className="tree-toolbar">
        <div className="tree-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requirements..."
          />
        </div>
        <button
          className={`tree-toolbar-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          title="Toggle filters"
        >
          <FilterListIcon fontSize="small" />
        </button>
        <button className="tree-toolbar-btn" onClick={expandAll} title="Expand all">
          <ExpandMoreIcon fontSize="small" />
        </button>
        <button className="tree-toolbar-btn" onClick={collapseAll} title="Collapse all">
          <ChevronRightIcon fontSize="small" />
        </button>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="tree-filters">
          <div className="tree-filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {Object.entries(ANALYSIS_STATUS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          <div className="tree-filter-group">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {requirementTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tree content */}
      <div className="tree-content">
        {rootNodes.length === 0 ? (
          <div className="tree-empty">
            <AccountTreeIcon style={{ fontSize: 40, color: '#9C9A94' }} />
            <p className="tree-empty-title">No requirements yet</p>
            <p className="tree-empty-hint">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No requirements match your filters. Try adjusting the search or filters.'
                : 'Create your first business requirement to start building the hierarchy.'}
            </p>
          </div>
        ) : (
          <ul className="tree-root" role="tree">
            {rootNodes.map((node) => (
              <TreeNode
                key={node.id}
                artefact={node}
                childrenMap={childrenMap}
                expandedNodes={expandedNodes}
                onToggle={toggleExpand}
                onSelect={onSelect}
                onAddChild={handleAddChild}
                selectedId={selectedId}
                depth={0}
                searchQuery={searchQuery}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Summary */}
      <div className="tree-footer">
        <span className="tree-count">
          {filteredRequirements.length} of {allRequirements.length} requirements
        </span>
      </div>

      <style jsx>{`
        .requirements-tree {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          overflow: hidden;
        }

        .tree-toolbar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-bottom: 1px solid #E2E0DB;
          background: #F0EFEC;
        }

        .tree-search {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          padding: 4px 8px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          color: #9C9A94;
          transition: border-color 120ms ease-out;
        }

        .tree-search:focus-within {
          border-color: #47453F;
        }

        .tree-search input {
          border: none;
          outline: none;
          background: transparent;
          flex: 1;
          font-size: 13px;
          color: #1F1E1B;
          line-height: 1.5;
        }

        .tree-search input::placeholder {
          color: #9C9A94;
        }

        .tree-toolbar-btn {
          background: none;
          border: 1px solid transparent;
          cursor: pointer;
          color: #5C5A54;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 120ms ease-out;
        }

        .tree-toolbar-btn:hover {
          background: rgba(31, 30, 27, 0.06);
          color: #1F1E1B;
        }

        .tree-toolbar-btn.active {
          background: rgba(71, 69, 63, 0.1);
          border-color: #47453F;
          color: #1F1E1B;
        }

        .tree-filters {
          display: flex;
          gap: 12px;
          padding: 8px 12px;
          background: #F0EFEC;
          border-bottom: 1px solid #E2E0DB;
        }

        .tree-filter-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tree-filter-group label {
          font-size: 12px;
          color: #5C5A54;
          font-weight: 500;
          white-space: nowrap;
        }

        .tree-filter-group select {
          padding: 3px 6px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 12px;
          color: #1F1E1B;
          background: #FDFCFA;
          cursor: pointer;
        }

        .tree-content {
          flex: 1;
          overflow-y: auto;
          padding: 4px 0;
        }

        .tree-root {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tree-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .tree-empty-title {
          margin: 12px 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: #1F1E1B;
        }

        .tree-empty-hint {
          margin: 0;
          font-size: 13px;
          color: #9C9A94;
          max-width: 300px;
          line-height: 1.5;
        }

        .tree-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 12px;
          border-top: 1px solid #E2E0DB;
          background: #F0EFEC;
        }

        .tree-count {
          font-size: 11px;
          color: #9C9A94;
        }
      `}</style>
    </div>
  );
}

/**
 * Individual tree node with expand/collapse, status indicator, and inline add.
 */
function TreeNode({
  artefact,
  childrenMap,
  expandedNodes,
  onToggle,
  onSelect,
  onAddChild,
  selectedId,
  depth,
  searchQuery,
}) {
  const children = childrenMap[artefact.id] || [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedNodes.has(artefact.id);
  const isSelected = artefact.id === selectedId;
  const typeDef = ANALYSIS_ARTEFACT_TYPES[artefact.artefactType];
  const statusConfig = ANALYSIS_STATUS[artefact.status] || ANALYSIS_STATUS.Draft;
  const validChildren = VALID_HIERARCHY[artefact.artefactType] || [];
  const canAddChild = validChildren.length > 0;

  const [showAddMenu, setShowAddMenu] = useState(false);

  // Highlight search matches
  const highlightName = useMemo(() => {
    if (!searchQuery) return artefact.name || 'Untitled';
    const name = artefact.name || 'Untitled';
    const idx = name.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return name;
    return (
      <>
        {name.substring(0, idx)}
        <mark>{name.substring(idx, idx + searchQuery.length)}</mark>
        {name.substring(idx + searchQuery.length)}
      </>
    );
  }, [artefact.name, searchQuery]);

  return (
    <li className="tree-node" role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className={`tree-node-row ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          className={`tree-toggle ${hasChildren ? 'has-children' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(artefact.id);
          }}
          tabIndex={hasChildren ? 0 : -1}
          aria-label={hasChildren ? (isExpanded ? 'Collapse' : 'Expand') : undefined}
        >
          {hasChildren ? (
            isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />
          ) : (
            <span className="tree-leaf-spacer" />
          )}
        </button>

        {/* Status dot */}
        <span
          className="tree-status-dot"
          style={{ backgroundColor: statusConfig.color }}
          title={statusConfig.label}
        />

        {/* Type badge */}
        <span
          className="tree-type-badge"
          style={{ backgroundColor: typeDef?.color || '#9C9A94' }}
          title={typeDef?.name || artefact.artefactType}
        >
          {typeDef?.prefix || '?'}
        </span>

        {/* Node content - clickable */}
        <button
          className="tree-node-content"
          onClick={() => onSelect?.(artefact)}
          title={artefact.description || artefact.name || ''}
        >
          {/* Reference number */}
          {artefact.reference_number && (
            <span className="tree-ref">{artefact.reference_number}</span>
          )}
          <span className="tree-name">{highlightName}</span>
        </button>

        {/* Add child button */}
        {canAddChild && (
          <div className="tree-add-wrapper">
            <button
              className="tree-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (validChildren.length === 1) {
                  onAddChild(artefact.id, artefact.artefactType);
                } else {
                  setShowAddMenu(!showAddMenu);
                }
              }}
              title="Add child"
            >
              <AddIcon style={{ fontSize: 14 }} />
            </button>

            {showAddMenu && validChildren.length > 1 && (
              <div className="tree-add-menu">
                {validChildren.map((childType) => {
                  const childDef = ANALYSIS_ARTEFACT_TYPES[childType];
                  return (
                    <button
                      key={childType}
                      className="tree-add-menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddMenu(false);
                        onAddChild(artefact.id, artefact.artefactType);
                      }}
                    >
                      <span
                        className="tree-add-menu-dot"
                        style={{ backgroundColor: childDef?.color || '#9C9A94' }}
                      />
                      {childDef?.name || childType}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <ul className="tree-children" role="group">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              artefact={child}
              childrenMap={childrenMap}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onSelect={onSelect}
              onAddChild={onAddChild}
              selectedId={selectedId}
              depth={depth + 1}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      )}

      <style jsx>{`
        .tree-node {
          list-style: none;
        }

        .tree-node-row {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px 3px 12px;
          min-height: 32px;
          position: relative;
          transition: background-color 100ms ease-out;
        }

        .tree-node-row:hover {
          background: rgba(31, 30, 27, 0.04);
        }

        .tree-node-row.selected {
          background: rgba(71, 69, 63, 0.1);
        }

        .tree-node-row.selected::before {
          content: '';
          position: absolute;
          left: 0;
          top: 2px;
          bottom: 2px;
          width: 2px;
          background: #47453F;
        }

        /* Tree lines using pseudo-elements */
        .tree-children {
          list-style: none;
          padding: 0;
          margin: 0;
          position: relative;
        }

        .tree-children::before {
          content: '';
          position: absolute;
          left: calc(var(--depth-offset, 22px) + 9px);
          top: 0;
          bottom: 12px;
          width: 1px;
          background: #E2E0DB;
        }

        .tree-toggle {
          background: none;
          border: none;
          cursor: default;
          color: #9C9A94;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          border-radius: 4px;
          transition: all 100ms ease-out;
        }

        .tree-toggle.has-children {
          cursor: pointer;
          color: #5C5A54;
        }

        .tree-toggle.has-children:hover {
          background: rgba(31, 30, 27, 0.08);
          color: #1F1E1B;
        }

        .tree-leaf-spacer {
          width: 20px;
          height: 20px;
        }

        .tree-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .tree-type-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 9px;
          font-weight: 700;
          color: #FDFCFA;
          letter-spacing: 0.3px;
          flex-shrink: 0;
          line-height: 1.4;
        }

        .tree-node-content {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 2px;
          text-align: left;
          transition: background-color 100ms ease-out;
        }

        .tree-node-content:hover {
          background: rgba(31, 30, 27, 0.04);
        }

        .tree-ref {
          font-size: 11px;
          font-weight: 600;
          color: #5C5A54;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .tree-name {
          font-size: 13px;
          color: #1F1E1B;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tree-name :global(mark) {
          background: rgba(201, 162, 39, 0.3);
          color: inherit;
          border-radius: 1px;
          padding: 0 1px;
        }

        .tree-add-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .tree-add-btn {
          background: none;
          border: 1px solid transparent;
          cursor: pointer;
          color: #9C9A94;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 120ms ease-out;
        }

        .tree-node-row:hover .tree-add-btn {
          opacity: 1;
        }

        .tree-add-btn:hover {
          color: #47453F;
          background: rgba(71, 69, 63, 0.1);
          border-color: #E2E0DB;
        }

        .tree-add-menu {
          position: absolute;
          right: 0;
          top: 100%;
          z-index: 50;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(31, 30, 27, 0.12);
          padding: 4px;
          min-width: 180px;
        }

        .tree-add-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px 10px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 12px;
          color: #1F1E1B;
          border-radius: 2px;
          text-align: left;
          transition: background-color 100ms ease-out;
        }

        .tree-add-menu-item:hover {
          background: #F0EFEC;
        }

        .tree-add-menu-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>
    </li>
  );
}
