// components/ba/RepositoryTree.js
// Hierarchical repository navigation tree
// Groups artefacts by type, category, status, or hierarchy with expand/collapse

import { useState, useMemo, useCallback } from 'react';
import { ARTEFACT_TYPES, ARTEFACT_STATUS, VIEWPOINTS, RELATIONSHIP_TYPES } from '../../ArtefactContext';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

// ============ HIERARCHY RANK (from high to low level) ============
const ARTEFACT_HIERARCHY_RANK = {
  // Strategy (highest)
  Capability: 1,
  ValueStream: 1,
  Principle: 1,
  // Business
  BusinessProcess: 2,
  OrganizationUnit: 2,
  BusinessNeed: 2,
  // Requirements
  BusinessRequirement: 3,
  StakeholderRequirement: 4,
  // Architecture
  Application: 3,
  DataDomain: 3,
  TechnologyComponent: 4,
  // Delivery
  Epic: 5,
  Feature: 6,
  UserStory: 7,
  UseCase: 7,
  SolutionRequirement: 7,
  Ticket: 8,
  // Governance
  Risk: 9,
  Assumption: 9,
  Constraint: 9,
};

// Relationships that establish parent-child hierarchy
const HIERARCHICAL_RELATIONSHIPS = ['decomposesTo', 'drives', 'refines', 'realizedBy', 'implementedBy', 'tracesTo'];

// ============ TREE NODE ============
function TreeNode({ type, artefacts, selectedId, onSelect, defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const typeDef = ARTEFACT_TYPES[type];

  if (!artefacts || artefacts.length === 0) return null;

  return (
    <div className="tree-node">
      <button
        className="tree-node-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="tree-expand-icon">
          {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </span>
        <span
          className="tree-type-icon"
          style={{ backgroundColor: typeDef?.color }}
        >
          {typeDef?.icon || type.slice(0, 2)}
        </span>
        <span className="tree-type-name">{typeDef?.name || type}</span>
        <span className="tree-count">{artefacts.length}</span>
      </button>

      {isExpanded && (
        <div className="tree-node-children">
          {artefacts.map(artefact => (
            <TreeItem
              key={artefact.id}
              artefact={artefact}
              isSelected={selectedId === artefact.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ TREE ITEM ============
function TreeItem({ artefact, isSelected, onSelect, depth = 0, showRelationship = null }) {
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];

  return (
    <button
      className={`tree-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(artefact)}
      style={{ paddingLeft: depth > 0 ? `${8 + depth * 16}px` : undefined }}
    >
      {showRelationship && (
        <span
          className="tree-item-relationship"
          style={{ color: RELATIONSHIP_TYPES[showRelationship]?.color || '#94a3b8' }}
          title={RELATIONSHIP_TYPES[showRelationship]?.name || showRelationship}
        >
          <SubdirectoryArrowRightIcon fontSize="small" />
        </span>
      )}
      <span
        className="tree-item-status"
        style={{ backgroundColor: statusDef?.color }}
        title={statusDef?.name}
      />
      <span
        className="tree-item-type-badge"
        style={{ backgroundColor: typeDef?.color }}
        title={typeDef?.name}
      >
        {typeDef?.icon || artefact.artefactType.slice(0, 2)}
      </span>
      <span className="tree-item-name">{artefact.name}</span>
      {artefact.priority === 'Critical' && (
        <span className="tree-item-priority critical">!</span>
      )}
      {artefact.priority === 'High' && (
        <span className="tree-item-priority high">!</span>
      )}
    </button>
  );
}

// ============ FOLDER TREE ITEM (simple hierarchy, no lines) ============
function FolderTreeItem({
  artefact,
  childrenMap,
  selectedId,
  onSelect,
  depth = 0
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 3); // Auto-expand first 3 levels
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];
  const children = childrenMap[artefact.id] || [];
  const hasChildren = children.length > 0;

  return (
    <div className="folder-tree-item">
      <div
        className="folder-item-row"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {/* Expand/collapse button for items with children */}
        {hasChildren ? (
          <button
            className="folder-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </button>
        ) : (
          <span className="folder-expand-placeholder" />
        )}

        {/* The actual item */}
        <button
          className={`folder-item ${selectedId === artefact.id ? 'selected' : ''}`}
          onClick={() => onSelect(artefact)}
        >
          <span
            className="folder-item-status"
            style={{ backgroundColor: statusDef?.color }}
            title={statusDef?.name}
          />
          <span
            className="folder-item-icon"
            style={{ backgroundColor: typeDef?.color }}
          >
            {typeDef?.icon || artefact.artefactType.slice(0, 2)}
          </span>
          <span className="folder-item-name">{artefact.name}</span>
          {hasChildren && !isExpanded && (
            <span className="folder-item-count">+{children.length}</span>
          )}
        </button>
      </div>

      {/* Render children recursively */}
      {isExpanded && hasChildren && (
        <div className="folder-children">
          {children.map((child) => (
            <FolderTreeItem
              key={child.artefact.id}
              artefact={child.artefact}
              childrenMap={childrenMap}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ HIERARCHY TREE ITEM (recursive - legacy with lines) ============
function HierarchyTreeItem({
  artefact,
  childrenMap,
  selectedId,
  onSelect,
  depth = 0,
  relationship = null,
  isLast = false,
  parentConnectors = []
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 3); // Auto-expand first 3 levels
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];
  const children = childrenMap[artefact.id] || [];
  const hasChildren = children.length > 0;

  return (
    <div className="hierarchy-tree-item">
      {/* Tree connector lines */}
      <div className="hierarchy-item-row">
        {/* Render parent connectors */}
        {parentConnectors.map((showLine, idx) => (
          <span
            key={idx}
            className={`hierarchy-connector ${showLine ? 'vertical-line' : ''}`}
          />
        ))}

        {/* Current level connector */}
        {depth > 0 && (
          <span className={`hierarchy-connector ${isLast ? 'corner' : 'tee'}`} />
        )}

        {/* Expand/collapse button for items with children */}
        {hasChildren ? (
          <button
            className="hierarchy-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </button>
        ) : (
          <span className="hierarchy-expand-placeholder" />
        )}

        {/* The actual item */}
        <button
          className={`hierarchy-item ${selectedId === artefact.id ? 'selected' : ''}`}
          onClick={() => onSelect(artefact)}
        >
          <span
            className="hierarchy-item-status"
            style={{ backgroundColor: statusDef?.color }}
            title={statusDef?.name}
          />
          <span
            className="hierarchy-item-icon"
            style={{ backgroundColor: typeDef?.color }}
          >
            {typeDef?.icon || artefact.artefactType.slice(0, 2)}
          </span>
          <span className="hierarchy-item-name">{artefact.name}</span>
          {relationship && (
            <span
              className="hierarchy-item-rel-badge"
              style={{ backgroundColor: RELATIONSHIP_TYPES[relationship]?.color || '#94a3b8' }}
              title={RELATIONSHIP_TYPES[relationship]?.name}
            >
              {RELATIONSHIP_TYPES[relationship]?.name?.split(' ')[0] || relationship}
            </span>
          )}
          {hasChildren && !isExpanded && (
            <span className="hierarchy-item-count">+{children.length}</span>
          )}
        </button>
      </div>

      {/* Render children recursively */}
      {isExpanded && hasChildren && (
        <div className="hierarchy-children">
          {children.map((child, idx) => (
            <HierarchyTreeItem
              key={child.artefact.id}
              artefact={child.artefact}
              childrenMap={childrenMap}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              relationship={child.relationship}
              isLast={idx === children.length - 1}
              parentConnectors={[...parentConnectors, !isLast && depth > 0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ CATEGORY GROUPING ============
const CATEGORY_ORDER = {
  strategy: { order: 1, label: 'Strategy & Business' },
  business: { order: 2, label: 'Business' },
  requirements: { order: 3, label: 'Requirements' },
  delivery: { order: 4, label: 'Delivery' },
  application: { order: 5, label: 'Application' },
  data: { order: 6, label: 'Data' },
  technology: { order: 7, label: 'Technology' },
  architecture: { order: 8, label: 'Architecture' },
  governance: { order: 9, label: 'Governance' },
};

// ============ MAIN REPOSITORY TREE ============
export default function RepositoryTree({ artefacts, relationships = [], selectedId, onSelect, viewpoint }) {
  const [groupBy, setGroupBy] = useState('type'); // 'type', 'category', 'status', 'hierarchy'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'updated', 'priority'

  // Get visible types for this viewpoint
  const vp = VIEWPOINTS[viewpoint];
  const visibleTypes = vp?.visibleArtefactTypes || Object.keys(ARTEFACT_TYPES);

  // Build hierarchy from relationships
  const hierarchyData = useMemo(() => {
    if (groupBy !== 'hierarchy') return null;

    // Build a map of artefact children based on relationships
    const childrenMap = {}; // parentId -> [{artefact, relationship}]
    const hasParent = new Set(); // track artefacts that have a parent

    // Process each relationship
    relationships.forEach(rel => {
      if (!HIERARCHICAL_RELATIONSHIPS.includes(rel.type)) return;

      const fromArtefact = artefacts.find(a => a.id === rel.from);
      const toArtefact = artefacts.find(a => a.id === rel.to);

      if (!fromArtefact || !toArtefact) return;

      // Determine parent-child direction based on relationship type
      let parentId, childId, childArtefact;

      // These relationships: parent --rel--> child
      if (['decomposesTo', 'drives', 'refines', 'implementedBy'].includes(rel.type)) {
        parentId = rel.from;
        childId = rel.to;
        childArtefact = toArtefact;
      } else {
        // These relationships: child --rel--> parent (realizedBy, tracesTo)
        parentId = rel.to;
        childId = rel.from;
        childArtefact = fromArtefact;
      }

      if (!childrenMap[parentId]) {
        childrenMap[parentId] = [];
      }

      // Avoid duplicates
      if (!childrenMap[parentId].some(c => c.artefact.id === childId)) {
        childrenMap[parentId].push({
          artefact: childArtefact,
          relationship: rel.type
        });
        hasParent.add(childId);
      }
    });

    // Sort children within each parent by hierarchy rank then name
    Object.keys(childrenMap).forEach(parentId => {
      childrenMap[parentId].sort((a, b) => {
        const rankA = ARTEFACT_HIERARCHY_RANK[a.artefact.artefactType] || 99;
        const rankB = ARTEFACT_HIERARCHY_RANK[b.artefact.artefactType] || 99;
        if (rankA !== rankB) return rankA - rankB;
        return a.artefact.name.localeCompare(b.artefact.name);
      });
    });

    // Find root artefacts (those without parents in our hierarchy)
    const roots = artefacts.filter(a => !hasParent.has(a.id));

    // Sort roots by hierarchy rank then name
    roots.sort((a, b) => {
      const rankA = ARTEFACT_HIERARCHY_RANK[a.artefactType] || 99;
      const rankB = ARTEFACT_HIERARCHY_RANK[b.artefactType] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });

    // Also find orphans (artefacts with no relationships at all)
    const artefactsWithRelationships = new Set();
    relationships.forEach(rel => {
      artefactsWithRelationships.add(rel.from);
      artefactsWithRelationships.add(rel.to);
    });

    const orphans = artefacts.filter(a => !artefactsWithRelationships.has(a.id));
    orphans.sort((a, b) => a.name.localeCompare(b.name));

    return { childrenMap, roots, orphans };
  }, [artefacts, relationships, groupBy]);

  // Group artefacts (for non-hierarchy modes)
  const groupedArtefacts = useMemo(() => {
    if (groupBy === 'hierarchy') return null;

    // Sort artefacts
    const sorted = [...artefacts].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'updated') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'priority') {
        const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      }
      return 0;
    });

    if (groupBy === 'type') {
      // Group by artefact type
      const groups = {};
      sorted.forEach(a => {
        if (!groups[a.artefactType]) {
          groups[a.artefactType] = [];
        }
        groups[a.artefactType].push(a);
      });

      // Sort types by category order then alphabetically
      const sortedTypes = Object.keys(groups).sort((a, b) => {
        const catA = ARTEFACT_TYPES[a]?.category || 'other';
        const catB = ARTEFACT_TYPES[b]?.category || 'other';
        const orderA = CATEGORY_ORDER[catA]?.order || 99;
        const orderB = CATEGORY_ORDER[catB]?.order || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b);
      });

      return { type: 'byType', groups, sortedKeys: sortedTypes };
    }

    if (groupBy === 'category') {
      // Group by category
      const groups = {};
      sorted.forEach(a => {
        const category = ARTEFACT_TYPES[a.artefactType]?.category || 'other';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(a);
      });

      const sortedCategories = Object.keys(groups).sort((a, b) => {
        const orderA = CATEGORY_ORDER[a]?.order || 99;
        const orderB = CATEGORY_ORDER[b]?.order || 99;
        return orderA - orderB;
      });

      return { type: 'byCategory', groups, sortedKeys: sortedCategories };
    }

    if (groupBy === 'status') {
      // Group by status
      const groups = {};
      sorted.forEach(a => {
        if (!groups[a.status]) {
          groups[a.status] = [];
        }
        groups[a.status].push(a);
      });

      const statusOrder = ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'];
      const sortedStatuses = statusOrder.filter(s => groups[s]);

      return { type: 'byStatus', groups, sortedKeys: sortedStatuses };
    }

    return { type: 'flat', artefacts: sorted };
  }, [artefacts, groupBy, sortBy]);

  return (
    <div className="repository-tree">
      {/* Tree Controls */}
      <div className="tree-controls">
        <select
          className="tree-control-select"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          title="Group by"
        >
          <option value="type">By Type</option>
          <option value="category">By Category</option>
          <option value="status">By Status</option>
          <option value="hierarchy">By Hierarchy</option>
        </select>
        {groupBy !== 'hierarchy' && (
          <select
            className="tree-control-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            title="Sort by"
          >
            <option value="name">Name</option>
            <option value="updated">Updated</option>
            <option value="priority">Priority</option>
          </select>
        )}
      </div>

      {/* Tree Content */}
      <div className="tree-content">
        {artefacts.length === 0 ? (
          <div className="tree-empty">
            <p>No artefacts found</p>
            <p className="tree-empty-hint">Create artefacts using the + New button</p>
          </div>
        ) : groupBy === 'hierarchy' ? (
          // Render folder-style hierarchy view (no lines, just indentation)
          <div className="folder-tree">
            {/* Root artefacts */}
            {hierarchyData?.roots.map((artefact) => (
              <FolderTreeItem
                key={artefact.id}
                artefact={artefact}
                childrenMap={hierarchyData.childrenMap}
                selectedId={selectedId}
                onSelect={onSelect}
                depth={0}
              />
            ))}

            {/* Orphan artefacts (no relationships) */}
            {hierarchyData?.orphans.length > 0 && (
              <div className="folder-orphans">
                <div className="folder-orphans-header">
                  <FolderIcon fontSize="small" />
                  <span className="folder-orphans-label">Unlinked Items</span>
                  <span className="folder-orphans-count">{hierarchyData.orphans.length}</span>
                </div>
                <div className="folder-orphans-list">
                  {hierarchyData.orphans.map(artefact => (
                    <TreeItem
                      key={artefact.id}
                      artefact={artefact}
                      isSelected={selectedId === artefact.id}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty hierarchy state */}
            {hierarchyData?.roots.length === 0 && hierarchyData?.orphans.length === 0 && (
              <div className="tree-empty">
                <p>No hierarchy to display</p>
                <p className="tree-empty-hint">Create relationships between artefacts to build a hierarchy</p>
              </div>
            )}
          </div>
        ) : groupBy === 'type' ? (
          // Render by type
          groupedArtefacts.sortedKeys.map(type => (
            <TreeNode
              key={type}
              type={type}
              artefacts={groupedArtefacts.groups[type]}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultExpanded={groupedArtefacts.groups[type].length <= 10}
            />
          ))
        ) : groupBy === 'category' ? (
          // Render by category
          groupedArtefacts.sortedKeys.map(category => (
            <CategoryNode
              key={category}
              category={category}
              artefacts={groupedArtefacts.groups[category]}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))
        ) : groupBy === 'status' ? (
          // Render by status
          groupedArtefacts.sortedKeys.map(status => (
            <StatusNode
              key={status}
              status={status}
              artefacts={groupedArtefacts.groups[status]}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))
        ) : null}
      </div>
    </div>
  );
}

// ============ CATEGORY NODE ============
function CategoryNode({ category, artefacts, selectedId, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const categoryDef = CATEGORY_ORDER[category];

  // Group by type within category
  const typeGroups = useMemo(() => {
    const groups = {};
    artefacts.forEach(a => {
      if (!groups[a.artefactType]) {
        groups[a.artefactType] = [];
      }
      groups[a.artefactType].push(a);
    });
    return groups;
  }, [artefacts]);

  return (
    <div className="tree-category">
      <button
        className="tree-category-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="tree-expand-icon">
          {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </span>
        <span className="tree-category-icon">
          {isExpanded ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
        </span>
        <span className="tree-category-name">{categoryDef?.label || category}</span>
        <span className="tree-count">{artefacts.length}</span>
      </button>

      {isExpanded && (
        <div className="tree-category-children">
          {Object.entries(typeGroups).map(([type, items]) => (
            <TreeNode
              key={type}
              type={type}
              artefacts={items}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultExpanded={items.length <= 5}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ STATUS NODE ============
function StatusNode({ status, artefacts, selectedId, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const statusDef = ARTEFACT_STATUS[status];

  return (
    <div className="tree-status-group">
      <button
        className="tree-status-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="tree-expand-icon">
          {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </span>
        <span
          className="tree-status-dot"
          style={{ backgroundColor: statusDef?.color }}
        />
        <span className="tree-status-name">{statusDef?.name || status}</span>
        <span className="tree-count">{artefacts.length}</span>
      </button>

      {isExpanded && (
        <div className="tree-status-children">
          {artefacts.map(artefact => (
            <TreeItem
              key={artefact.id}
              artefact={artefact}
              isSelected={selectedId === artefact.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { TreeNode, TreeItem, CategoryNode, StatusNode, HierarchyTreeItem, FolderTreeItem };
