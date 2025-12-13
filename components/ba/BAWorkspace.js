// components/ba/BAWorkspace.js
// Professional BA workspace with Requirements & Delivery separation
// Based on BABOK meta-model: Requirements (What & Why) vs Delivery (How & When)
// Enhanced with subtle, contextual guidance

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useArtefacts, VIEWPOINTS, ARTEFACT_TYPES, RELATIONSHIP_TYPES } from '../ArtefactContext';
import { useProjects } from '../ProjectContext';
import { useAuth } from '../AuthContext';
import { useBA, BAProvider, BA_CONCEPTS } from './BAContext';
import RepositoryTree from './RepositoryTree';
import DocumentView from './DocumentView';
import ArtefactDetailPanel from './ArtefactDetailPanel';
import KanbanBoard from './KanbanBoard';
import StrategyMap from './StrategyMap';
import DocumentEditor from './DocumentEditor';
import GuidedCreateModal from './GuidedCreateModal';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TimelineIcon from '@mui/icons-material/Timeline';
import MapIcon from '@mui/icons-material/Map';
import ArticleIcon from '@mui/icons-material/Article';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ============ UNIFIED CREATE MENU ============
// Separates Requirements (What & Why) from Delivery (How & When) per BABOK/meta-model
function UnifiedCreateMenu({ activeViewpoint, onViewpointChange, onCreate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('requirements');

  // Sections matching the meta-model
  const sections = {
    requirements: {
      id: 'requirements',
      name: 'Requirements (What & Why)',
      description: 'Authoritative requirement definitions - knowledge assets',
      color: '#dc2626',
      types: ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'],
    },
    delivery: {
      id: 'delivery',
      name: 'Delivery Planning (How & When)',
      description: 'Work containers that organise delivery - NOT requirements',
      color: '#7c3aed',
      types: ['Epic', 'Feature', 'UserStory', 'Ticket'],
    },
    artefacts: {
      id: 'artefacts',
      name: 'BA Artefacts',
      description: 'Supporting documentation - explains but never replaces requirements',
      color: '#14b8a6',
      types: ['UseCase', 'BusinessRule', 'Assumption', 'Constraint', 'Risk', 'Stakeholder'],
    },
  };

  const currentSection = sections[selectedSection];

  const handleCreate = (type) => {
    // Switch viewpoint to match section
    if (selectedSection === 'requirements' && activeViewpoint !== 'requirements') {
      onViewpointChange('requirements');
    } else if (selectedSection === 'delivery' && activeViewpoint !== 'delivery') {
      onViewpointChange('delivery');
    } else if (selectedSection === 'artefacts' && activeViewpoint !== 'artefacts') {
      onViewpointChange('artefacts');
    }
    onCreate(type);
    setIsOpen(false);
  };

  return (
    <div className="unified-create-menu">
      <button
        className="unified-create-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Create new artefact"
      >
        <AddIcon fontSize="small" />
        <span>New</span>
        <ExpandMoreIcon fontSize="small" className={isOpen ? 'rotated' : ''} />
      </button>

      {isOpen && (
        <>
          <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />
          <div className="unified-create-dropdown">
            {/* Section Tabs - Requirements vs Delivery vs Artefacts */}
            <div className="viewpoint-tabs">
              {Object.entries(sections).map(([id, section]) => (
                <button
                  key={id}
                  className={`viewpoint-tab ${selectedSection === id ? 'active' : ''}`}
                  onClick={() => setSelectedSection(id)}
                  style={{ '--vp-color': section.color }}
                >
                  <span className="viewpoint-tab-dot" style={{ backgroundColor: section.color }} />
                  <span className="viewpoint-tab-name">{section.name.split(' (')[0]}</span>
                </button>
              ))}
            </div>

            {/* Section Header with explanation */}
            <div className="create-types-grid">
              <div className="create-section-header" style={{ borderLeftColor: currentSection.color }}>
                <span>{currentSection.name}</span>
                <span className="create-section-desc">{currentSection.description}</span>
              </div>

              {/* Important Note for Delivery */}
              {selectedSection === 'delivery' && (
                <div className="create-section-note warning">
                  <WarningIcon fontSize="small" />
                  <span>Delivery items must be linked to Requirements. They implement/realise requirements but never replace them.</span>
                </div>
              )}

              {/* Artefact Types List */}
              <div className="create-types-list">
                {currentSection.types.map(type => {
                  const typeDef = ARTEFACT_TYPES[type];
                  return (
                    <button
                      key={type}
                      className="create-type-option"
                      onClick={() => handleCreate(type)}
                    >
                      <span
                        className="create-type-icon"
                        style={{ backgroundColor: typeDef?.color }}
                      >
                        {typeDef?.icon}
                      </span>
                      <div className="create-type-info">
                        <span className="create-type-name">{typeDef?.name}</span>
                        <span className="create-type-desc">{typeDef?.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="create-quick-actions">
              <button className="quick-action" onClick={() => { onCreate('document'); setIsOpen(false); }}>
                <ArticleIcon fontSize="small" />
                <span>New Document</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============ VIEWPOINT INDICATOR ============
// Compact display of current viewpoint (read-only, viewpoint changed via create menu)
function ViewpointIndicator({ activeViewpoint }) {
  const vp = VIEWPOINTS[activeViewpoint];
  return (
    <div className="viewpoint-indicator" title={vp?.description}>
      <span className="viewpoint-indicator-dot" style={{ backgroundColor: vp?.color }} />
      <span className="viewpoint-indicator-name">{vp?.name || 'Select View'}</span>
    </div>
  );
}

// ============ WORKSPACE TABS ============
function WorkspaceTabs({ activeTab, onTabChange, counts, activeViewpoint }) {
  // Main workspace views - organized by meta-model
  const tabs = [
    { id: 'requirements', label: 'Requirements', icon: DescriptionIcon, color: '#dc2626', tooltip: 'What & Why - Knowledge Assets' },
    { id: 'delivery', label: 'Delivery', icon: ViewKanbanIcon, color: '#7c3aed', tooltip: 'How & When - Work Containers' },
    { id: 'trace', label: 'Traceability', icon: TimelineIcon, color: '#059669', tooltip: 'End-to-end requirement coverage' },
    { id: 'documents', label: 'Documents', icon: ArticleIcon, color: '#64748b', tooltip: 'Project documentation' },
    { id: 'map', label: 'Strategy Map', icon: MapIcon, color: '#3b82f6', tooltip: 'Visual hierarchy' },
  ];

  return (
    <div className="workspace-tabs">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`workspace-tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.tooltip}
            style={isActive ? { borderBottomColor: tab.color } : {}}
          >
            <Icon fontSize="small" style={isActive ? { color: tab.color } : {}} />
            <span>{tab.label}</span>
            {counts[tab.id] !== undefined && counts[tab.id] > 0 && (
              <span className="tab-count" style={isActive ? { backgroundColor: tab.color } : {}}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============ SEARCH BAR ============
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="workspace-search">
      <SearchIcon fontSize="small" className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search artefacts..."}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>
          ×
        </button>
      )}
    </div>
  );
}

// ============ STATUS BAR ============
function StatusBar({ artefacts, viewpoint }) {
  const vp = VIEWPOINTS[viewpoint];
  const visibleArtefacts = artefacts.filter(a =>
    vp?.visibleArtefactTypes.includes(a.artefactType)
  );

  const counts = useMemo(() => {
    const result = {};
    visibleArtefacts.forEach(a => {
      result[a.artefactType] = (result[a.artefactType] || 0) + 1;
    });
    return result;
  }, [visibleArtefacts]);

  const statusCounts = useMemo(() => {
    const result = {};
    visibleArtefacts.forEach(a => {
      result[a.status] = (result[a.status] || 0) + 1;
    });
    return result;
  }, [visibleArtefacts]);

  return (
    <div className="workspace-status-bar">
      <div className="status-counts">
        {Object.entries(counts).slice(0, 5).map(([type, count]) => (
          <span key={type} className="status-count-item">
            <span
              className="status-count-dot"
              style={{ backgroundColor: ARTEFACT_TYPES[type]?.color }}
            />
            {count} {ARTEFACT_TYPES[type]?.name || type}
          </span>
        ))}
      </div>
      <div className="status-summary">
        {Object.entries(statusCounts).map(([status, count]) => (
          <span
            key={status}
            className="status-badge"
            style={{ color: ARTEFACT_STATUS[status]?.color }}
          >
            {count} {status}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============ TRACE VIEW ============
function TraceView({ artefact, artefacts, relationships, onSelectArtefact }) {
  const getUpstream = useCallback((id, visited = new Set()) => {
    if (visited.has(id)) return [];
    visited.add(id);

    const incoming = relationships.filter(r => r.to === id);
    const results = [];

    incoming.forEach(rel => {
      const source = artefacts.find(a => a.id === rel.from);
      if (source) {
        results.push({ relationship: rel, artefact: source, depth: 0 });
        const upstream = getUpstream(rel.from, visited);
        upstream.forEach(u => results.push({ ...u, depth: u.depth + 1 }));
      }
    });

    return results;
  }, [artefacts, relationships]);

  const getDownstream = useCallback((id, visited = new Set()) => {
    if (visited.has(id)) return [];
    visited.add(id);

    const outgoing = relationships.filter(r => r.from === id);
    const results = [];

    outgoing.forEach(rel => {
      const target = artefacts.find(a => a.id === rel.to);
      if (target) {
        results.push({ relationship: rel, artefact: target, depth: 0 });
        const downstream = getDownstream(rel.to, visited);
        downstream.forEach(d => results.push({ ...d, depth: d.depth + 1 }));
      }
    });

    return results;
  }, [artefacts, relationships]);

  if (!artefact) {
    return (
      <div className="trace-view-empty">
        <TimelineIcon style={{ fontSize: 48, opacity: 0.3 }} />
        <h3>Traceability View</h3>
        <p>Select an artefact from the repository to view its traceability chain.</p>
        <div className="trace-explanation">
          <h4>What is Traceability?</h4>
          <p>Traceability shows how requirements, features, and work items connect to each other:</p>
          <ul>
            <li><strong>Upstream (Origin)</strong> - Where this artefact comes from (e.g., the business need that drove this requirement)</li>
            <li><strong>Downstream (Impact)</strong> - What depends on this artefact (e.g., features implementing this requirement)</li>
          </ul>
        </div>
      </div>
    );
  }

  const upstream = getUpstream(artefact.id);
  const downstream = getDownstream(artefact.id);

  const TraceItem = ({ item, direction }) => {
    const typeDef = ARTEFACT_TYPES[item.artefact.artefactType];
    const relDef = RELATIONSHIP_TYPES[item.relationship.type];

    return (
      <div
        className="trace-item"
        style={{ marginLeft: item.depth * 24 }}
        onClick={() => onSelectArtefact(item.artefact)}
      >
        <div className="trace-item-line" style={{ backgroundColor: relDef?.color }} />
        <span className="trace-item-icon" style={{ backgroundColor: typeDef?.color }}>
          {typeDef?.icon}
        </span>
        <div className="trace-item-content">
          <span className="trace-item-name">{item.artefact.name}</span>
          <span className="trace-item-rel" style={{ color: relDef?.color }}>
            {relDef?.name}
          </span>
        </div>
        <span className={`trace-item-status status-${item.artefact.status?.toLowerCase()}`}>
          {item.artefact.status}
        </span>
      </div>
    );
  };

  return (
    <div className="trace-view">
      <div className="trace-header">
        <h3>Traceability for: {artefact.name}</h3>
        <span className="trace-type-badge" style={{ backgroundColor: ARTEFACT_TYPES[artefact.artefactType]?.color }}>
          {ARTEFACT_TYPES[artefact.artefactType]?.name}
        </span>
      </div>

      <div className="trace-columns">
        {/* Upstream Column */}
        <div className="trace-column">
          <div className="trace-column-header">
            <ChevronLeftIcon />
            <span>Traces From (Origin)</span>
            <span className="trace-count">{upstream.length}</span>
          </div>
          <div className="trace-column-content">
            {upstream.length > 0 ? (
              upstream.map((item, idx) => (
                <TraceItem key={idx} item={item} direction="upstream" />
              ))
            ) : (
              <div className="trace-empty">No upstream dependencies</div>
            )}
          </div>
        </div>

        {/* Current Item */}
        <div className="trace-center">
          <div className="trace-current-item">
            <span className="trace-current-icon" style={{ backgroundColor: ARTEFACT_TYPES[artefact.artefactType]?.color }}>
              {ARTEFACT_TYPES[artefact.artefactType]?.icon}
            </span>
            <div className="trace-current-info">
              <span className="trace-current-name">{artefact.name}</span>
              <span className="trace-current-type">{ARTEFACT_TYPES[artefact.artefactType]?.name}</span>
            </div>
          </div>
        </div>

        {/* Downstream Column */}
        <div className="trace-column">
          <div className="trace-column-header">
            <span>Traces To (Impact)</span>
            <ChevronRightIcon />
            <span className="trace-count">{downstream.length}</span>
          </div>
          <div className="trace-column-content">
            {downstream.length > 0 ? (
              downstream.map((item, idx) => (
                <TraceItem key={idx} item={item} direction="downstream" />
              ))
            ) : (
              <div className="trace-empty">No downstream dependencies</div>
            )}
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="trace-summary">
        <div className="trace-metric">
          <span className="trace-metric-value">{upstream.length}</span>
          <span className="trace-metric-label">Dependencies</span>
        </div>
        <div className="trace-metric">
          <span className="trace-metric-value">{downstream.length}</span>
          <span className="trace-metric-label">Dependents</span>
        </div>
        <div className="trace-metric">
          <span className="trace-metric-value">
            {downstream.filter(d => d.artefact.status === 'Approved').length}
          </span>
          <span className="trace-metric-label">Approved Dependents</span>
        </div>
      </div>
    </div>
  );
}

// ============ DOCUMENTS LIST ============
function DocumentsList({ projectId, onOpenDocument }) {
  const { documents = [], createDocument, deleteDocument, artefacts } = useArtefacts();
  const [showCustomCreate, setShowCustomCreate] = useState(false);
  const [customDocName, setCustomDocName] = useState('');

  // Get all documents for this project (not linked to specific artefact)
  const projectDocuments = useMemo(() => {
    return documents.filter(d => d.projectId === projectId);
  }, [documents, projectId]);

  const templates = [
    {
      id: 'stakeholder-requirements',
      name: 'Stakeholder Requirements Document',
      icon: '📋',
      blocks: [
        { id: 'b1', type: 'heading', content: { level: 1, text: 'Stakeholder Requirements Document' } },
        { id: 'b2', type: 'heading', content: { level: 2, text: 'Executive Summary' } },
        { id: 'b3', type: 'paragraph', content: { text: '' } },
        { id: 'b4', type: 'heading', content: { level: 2, text: 'Stakeholders' } },
        { id: 'b5', type: 'paragraph', content: { text: '' } },
        { id: 'b6', type: 'heading', content: { level: 2, text: 'Requirements' } },
        { id: 'b7', type: 'paragraph', content: { text: '' } },
      ]
    },
    {
      id: 'user-stories',
      name: 'User Story Specification',
      icon: '📝',
      blocks: [
        { id: 'b1', type: 'heading', content: { level: 1, text: 'User Story Specification' } },
        { id: 'b2', type: 'heading', content: { level: 2, text: 'Epic Overview' } },
        { id: 'b3', type: 'paragraph', content: { text: '' } },
        { id: 'b4', type: 'heading', content: { level: 2, text: 'User Stories' } },
        { id: 'b5', type: 'paragraph', content: { text: '' } },
        { id: 'b6', type: 'heading', content: { level: 2, text: 'Acceptance Criteria' } },
        { id: 'b7', type: 'paragraph', content: { text: '' } },
      ]
    },
    {
      id: 'brd',
      name: 'Business Requirements Document',
      icon: '📄',
      blocks: [
        { id: 'b1', type: 'heading', content: { level: 1, text: 'Business Requirements Document' } },
        { id: 'b2', type: 'heading', content: { level: 2, text: 'Business Need' } },
        { id: 'b3', type: 'paragraph', content: { text: '' } },
        { id: 'b4', type: 'heading', content: { level: 2, text: 'Business Requirements' } },
        { id: 'b5', type: 'paragraph', content: { text: '' } },
        { id: 'b6', type: 'heading', content: { level: 2, text: 'Functional Requirements' } },
        { id: 'b7', type: 'paragraph', content: { text: '' } },
        { id: 'b8', type: 'heading', content: { level: 2, text: 'Non-Functional Requirements' } },
        { id: 'b9', type: 'paragraph', content: { text: '' } },
      ]
    },
    {
      id: 'capability-map',
      name: 'Capability Map',
      icon: '🗺️',
      blocks: [
        { id: 'b1', type: 'heading', content: { level: 1, text: 'Capability Map' } },
        { id: 'b2', type: 'heading', content: { level: 2, text: 'Strategic Context' } },
        { id: 'b3', type: 'paragraph', content: { text: '' } },
        { id: 'b4', type: 'heading', content: { level: 2, text: 'Capabilities' } },
        { id: 'b5', type: 'paragraph', content: { text: '' } },
        { id: 'b6', type: 'heading', content: { level: 2, text: 'Traceability Matrix' } },
        { id: 'b7', type: 'paragraph', content: { text: '' } },
      ]
    },
    {
      id: 'solution-design',
      name: 'Solution Design Document',
      icon: '🏗️',
      blocks: [
        { id: 'b1', type: 'heading', content: { level: 1, text: 'Solution Design Document' } },
        { id: 'b2', type: 'heading', content: { level: 2, text: 'Architecture Overview' } },
        { id: 'b3', type: 'paragraph', content: { text: '' } },
        { id: 'b4', type: 'heading', content: { level: 2, text: 'Component Specifications' } },
        { id: 'b5', type: 'paragraph', content: { text: '' } },
        { id: 'b6', type: 'heading', content: { level: 2, text: 'Non-Functional Requirements' } },
        { id: 'b7', type: 'paragraph', content: { text: '' } },
      ]
    },
  ];

  const handleCreateFromTemplate = (template) => {
    console.log('Creating document from template:', template.name);
    if (!createDocument) {
      console.error('createDocument not available');
      return;
    }
    const newDoc = createDocument({
      name: template.name,
      type: template.id,
      blocks: template.blocks,
      // No artefactId - this is a project-level document
    });
    console.log('Created document:', newDoc);
    if (newDoc && onOpenDocument) {
      onOpenDocument(newDoc);
    }
  };

  const handleCreateCustom = () => {
    if (!customDocName.trim() || !createDocument) return;
    const newDoc = createDocument({
      name: customDocName.trim(),
      type: 'custom',
      blocks: [
        { id: 'b1', type: 'heading', content: { level: 1, text: customDocName.trim() } },
        { id: 'b2', type: 'paragraph', content: { text: '' } },
      ],
    });
    if (newDoc && onOpenDocument) {
      onOpenDocument(newDoc);
    }
    setCustomDocName('');
    setShowCustomCreate(false);
  };

  const handleDeleteDocument = (doc) => {
    if (window.confirm(`Delete "${doc.name}"?`)) {
      deleteDocument?.(doc.id);
    }
  };

  // Get artefact name for linked documents
  const getArtefactName = (artefactId) => {
    if (!artefactId) return null;
    const artefact = artefacts?.find(a => a.id === artefactId);
    return artefact?.name || 'Unknown Artefact';
  };

  return (
    <div className="documents-list">
      <div className="documents-header">
        <h3>Documents</h3>
        <p>Create and manage project documentation</p>
      </div>

      {/* Templates */}
      <div className="documents-section">
        <h4>Create from Template</h4>
        <div className="document-templates">
          {templates.map(template => (
            <button
              key={template.id}
              className="document-template-card"
              onClick={() => handleCreateFromTemplate(template)}
            >
              <span className="template-icon">{template.icon}</span>
              <span className="template-name">{template.name}</span>
            </button>
          ))}
          <button
            className="document-template-card custom"
            onClick={() => setShowCustomCreate(true)}
          >
            <span className="template-icon">➕</span>
            <span className="template-name">Custom Document</span>
          </button>
        </div>
      </div>

      {/* Custom Create Form */}
      {showCustomCreate && (
        <div className="documents-section custom-create">
          <h4>Create Custom Document</h4>
          <div className="custom-create-form">
            <input
              type="text"
              placeholder="Document name..."
              value={customDocName}
              onChange={(e) => setCustomDocName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customDocName.trim()) handleCreateCustom();
                if (e.key === 'Escape') setShowCustomCreate(false);
              }}
            />
            <div className="custom-create-actions">
              <button
                className="btn-primary"
                onClick={handleCreateCustom}
                disabled={!customDocName.trim()}
              >
                Create
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowCustomCreate(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Documents */}
      <div className="documents-section">
        <h4>Project Documents ({projectDocuments.length})</h4>
        {projectDocuments.length > 0 ? (
          <div className="documents-grid">
            {projectDocuments.map(doc => (
              <div key={doc.id} className="document-card">
                <button
                  className="document-card-main"
                  onClick={() => onOpenDocument?.(doc)}
                >
                  <ArticleIcon />
                  <div className="document-card-info">
                    <span className="document-title">{doc.name}</span>
                    <span className="document-meta">
                      {doc.artefactId && (
                        <span className="document-artefact">
                          Linked to: {getArtefactName(doc.artefactId)}
                        </span>
                      )}
                      <span className="document-date">
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                </button>
                <button
                  className="document-card-delete"
                  onClick={() => handleDeleteDocument(doc)}
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="documents-empty">
            <ArticleIcon style={{ fontSize: 48, opacity: 0.3 }} />
            <p>No documents yet. Create one from a template above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ REQUIREMENTS VIEW ============
// Shows the requirement hierarchy: Business → Stakeholder → Solution (Functional/Non-Functional)
// With contextual guidance for each level
function RequirementsView({ artefacts, relationships, selectedArtefact, onSelectArtefact, onCreate }) {
  // Contextual hints for each level - shown inline
  const levelHints = {
    BusinessRequirement: {
      empty: 'Start here: What business problem are you solving?',
      hint: 'High-level needs that justify the project',
    },
    StakeholderRequirement: {
      empty: 'Who needs what? Break down business needs by stakeholder',
      hint: 'What specific users/roles need to accomplish',
    },
    SolutionRequirement: {
      empty: 'What must the solution do (Functional) or be (Non-Functional)?',
      hint: 'Testable specifications for the solution',
    },
  };

  // Filter to requirements only
  const requirements = useMemo(() => {
    return artefacts.filter(a =>
      ARTEFACT_TYPES[a.artefactType]?.section === 'requirements'
    );
  }, [artefacts]);

  // Group by type
  const grouped = useMemo(() => ({
    BusinessRequirement: requirements.filter(a => a.artefactType === 'BusinessRequirement'),
    StakeholderRequirement: requirements.filter(a => a.artefactType === 'StakeholderRequirement'),
    SolutionRequirement: requirements.filter(a => a.artefactType === 'SolutionRequirement'),
  }), [requirements]);

  // Split Solution Requirements into Functional and Non-Functional
  const functionalReqs = grouped.SolutionRequirement.filter(a => a.solutionCategory === 'Functional');
  const nonFunctionalReqs = grouped.SolutionRequirement.filter(a => a.solutionCategory === 'Non-Functional');

  // Get implementation coverage
  const getCoverage = (reqId) => {
    const implementingRels = relationships.filter(r =>
      r.to === reqId && ['implements', 'realises', 'operationalises'].includes(r.type)
    );
    return implementingRels.length;
  };

  const RequirementCard = ({ req }) => {
    const typeDef = ARTEFACT_TYPES[req.artefactType];
    const coverage = getCoverage(req.id);
    const isSelected = selectedArtefact?.id === req.id;

    return (
      <div
        className={`requirement-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelectArtefact(req)}
        style={{ borderLeftColor: typeDef?.color }}
      >
        <div className="req-card-header">
          <span className="req-id">{req.requirementId || req.id.slice(0, 8)}</span>
          <span className={`req-status status-${req.status?.toLowerCase().replace(' ', '-')}`}>
            {req.status}
          </span>
        </div>
        <div className="req-card-title">{req.name}</div>
        {req.rationale && (
          <div className="req-card-rationale">{req.rationale.slice(0, 100)}{req.rationale.length > 100 ? '...' : ''}</div>
        )}
        <div className="req-card-footer">
          <span className="req-owner">{req.owner || 'Unassigned'}</span>
          {coverage > 0 ? (
            <span className="req-coverage covered"><CheckCircleIcon fontSize="small" /> {coverage} linked</span>
          ) : (
            <span className="req-coverage uncovered"><WarningIcon fontSize="small" /> No delivery</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="requirements-view">
      <div className="view-header">
        <div className="view-header-title">
          <span className="view-icon" style={{ backgroundColor: '#dc2626' }}>📋</span>
          <div>
            <h2>Requirements (What & Why)</h2>
            <p>Authoritative requirement definitions - stable knowledge assets</p>
          </div>
        </div>
        <div className="view-stats">
          <span className="stat">{requirements.length} Total</span>
          <span className="stat covered">{requirements.filter(r => getCoverage(r.id) > 0).length} Covered</span>
          <span className="stat uncovered">{requirements.filter(r => getCoverage(r.id) === 0).length} Uncovered</span>
        </div>
      </div>

      <div className="requirements-hierarchy">
        {/* L1: Business Requirements */}
        <div className="requirement-level">
          <div className="level-header" style={{ borderColor: '#dc2626' }}>
            <span className="level-badge" style={{ backgroundColor: '#dc2626' }}>L1</span>
            <span className="level-name">Business Requirements</span>
            <span className="level-count">{grouped.BusinessRequirement.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('BusinessRequirement')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content">
            {grouped.BusinessRequirement.length > 0 ? (
              grouped.BusinessRequirement.map(req => <RequirementCard key={req.id} req={req} />)
            ) : (
              <div className="empty-level guided">
                <span className="empty-icon">🎯</span>
                <span className="empty-text">{levelHints.BusinessRequirement.empty}</span>
                <button className="empty-add-btn" onClick={() => onCreate('BusinessRequirement')}>
                  + Add Business Requirement
                </button>
              </div>
            )}
          </div>
        </div>

        {/* L2: Stakeholder Requirements */}
        <div className="requirement-level">
          <div className="level-header" style={{ borderColor: '#ea580c' }}>
            <span className="level-badge" style={{ backgroundColor: '#ea580c' }}>L2</span>
            <span className="level-name">Stakeholder Requirements</span>
            <span className="level-hint">{levelHints.StakeholderRequirement.hint}</span>
            <span className="level-count">{grouped.StakeholderRequirement.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('StakeholderRequirement')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content">
            {grouped.StakeholderRequirement.length > 0 ? (
              grouped.StakeholderRequirement.map(req => <RequirementCard key={req.id} req={req} />)
            ) : (
              <div className="empty-level guided">
                <span className="empty-icon">👥</span>
                <span className="empty-text">{levelHints.StakeholderRequirement.empty}</span>
                <button className="empty-add-btn" onClick={() => onCreate('StakeholderRequirement')}>
                  + Add Stakeholder Requirement
                </button>
              </div>
            )}
          </div>
        </div>

        {/* L3: Solution Requirements (split into Functional and Non-Functional) */}
        <div className="requirement-level">
          <div className="level-header" style={{ borderColor: '#f59e0b' }}>
            <span className="level-badge" style={{ backgroundColor: '#f59e0b' }}>L3</span>
            <span className="level-name">Solution Requirements</span>
            <span className="level-hint">{levelHints.SolutionRequirement.hint}</span>
            <span className="level-count">{grouped.SolutionRequirement.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('SolutionRequirement')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-sublevel">
            <div className="sublevel-section">
              <div className="sublevel-header">
                <span>Functional Requirements</span>
                <span className="sublevel-hint">What the system must DO</span>
                <span className="sublevel-count">{functionalReqs.length}</span>
              </div>
              <div className="level-content">
                {functionalReqs.length > 0 ? (
                  functionalReqs.map(req => <RequirementCard key={req.id} req={req} />)
                ) : (
                  <div className="empty-level guided small">
                    <span className="empty-text">Behaviors, features, functions the system provides</span>
                  </div>
                )}
              </div>
            </div>
            <div className="sublevel-section">
              <div className="sublevel-header">
                <span>Non-Functional Requirements</span>
                <span className="sublevel-hint">What the system must BE</span>
                <span className="sublevel-count">{nonFunctionalReqs.length}</span>
              </div>
              <div className="level-content">
                {nonFunctionalReqs.length > 0 ? (
                  nonFunctionalReqs.map(req => <RequirementCard key={req.id} req={req} />)
                ) : (
                  <div className="empty-level guided small">
                    <span className="empty-text">Performance, security, usability, reliability</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ DELIVERY VIEW ============
// Shows the delivery hierarchy: Epic → Feature → User Story → Ticket
// With validation warnings for items missing requirement links
function DeliveryView({ artefacts, relationships, selectedArtefact, onSelectArtefact, onCreate }) {
  // Filter to delivery items only
  const deliveryItems = useMemo(() => {
    return artefacts.filter(a =>
      ARTEFACT_TYPES[a.artefactType]?.section === 'delivery'
    );
  }, [artefacts]);

  // Group by type
  const grouped = useMemo(() => ({
    Epic: deliveryItems.filter(a => a.artefactType === 'Epic'),
    Feature: deliveryItems.filter(a => a.artefactType === 'Feature'),
    UserStory: deliveryItems.filter(a => a.artefactType === 'UserStory'),
    Ticket: deliveryItems.filter(a => a.artefactType === 'Ticket'),
  }), [deliveryItems]);

  // Check if delivery item has required requirement links
  const hasRequirementLink = (itemId, itemType) => {
    const requiredRelTypes = {
      Epic: 'implements',
      Feature: 'realises',
      UserStory: 'operationalises',
    };
    const relType = requiredRelTypes[itemType];
    if (!relType) return true; // Tickets don't require links

    return relationships.some(r =>
      r.from === itemId && r.type === relType
    );
  };

  // Get linked requirements for an item
  const getLinkedRequirements = (itemId) => {
    const reqRels = relationships.filter(r =>
      r.from === itemId && ['implements', 'realises', 'operationalises'].includes(r.type)
    );
    return reqRels.map(r => artefacts.find(a => a.id === r.to)).filter(Boolean);
  };

  const DeliveryCard = ({ item }) => {
    const typeDef = ARTEFACT_TYPES[item.artefactType];
    const isSelected = selectedArtefact?.id === item.id;
    const hasLink = hasRequirementLink(item.id, item.artefactType);
    const linkedReqs = getLinkedRequirements(item.id);

    return (
      <div
        className={`delivery-card ${isSelected ? 'selected' : ''} ${!hasLink ? 'warning' : ''}`}
        onClick={() => onSelectArtefact(item)}
        style={{ borderLeftColor: typeDef?.color }}
      >
        <div className="delivery-card-header">
          <span className="delivery-type-badge" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.icon}
          </span>
          <span className={`delivery-status status-${item.status?.toLowerCase().replace(' ', '-')}`}>
            {item.status}
          </span>
        </div>
        <div className="delivery-card-title">{item.name}</div>
        {item.description && (
          <div className="delivery-card-desc">{item.description.slice(0, 80)}{item.description.length > 80 ? '...' : ''}</div>
        )}
        <div className="delivery-card-footer">
          {linkedReqs.length > 0 ? (
            <div className="delivery-reqs">
              <CheckCircleIcon fontSize="small" className="linked" />
              <span>{linkedReqs.length} requirement{linkedReqs.length !== 1 ? 's' : ''}</span>
            </div>
          ) : item.artefactType !== 'Ticket' ? (
            <div className="delivery-reqs warning">
              <WarningIcon fontSize="small" />
              <span>No requirements linked</span>
            </div>
          ) : null}
          {item.priority && (
            <span className={`delivery-priority priority-${item.priority?.toLowerCase()}`}>
              {item.priority}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Count items missing requirement links
  const missingLinks = useMemo(() => {
    return deliveryItems.filter(item =>
      item.artefactType !== 'Ticket' && !hasRequirementLink(item.id, item.artefactType)
    ).length;
  }, [deliveryItems, relationships]);

  return (
    <div className="delivery-view">
      <div className="view-header">
        <div className="view-header-title">
          <span className="view-icon" style={{ backgroundColor: '#7c3aed' }}>📦</span>
          <div>
            <h2>Delivery Planning (How & When)</h2>
            <p>Work containers that organise delivery - must link to requirements</p>
          </div>
        </div>
        <div className="view-stats">
          <span className="stat">{deliveryItems.length} Total</span>
          {missingLinks > 0 && (
            <span className="stat warning"><WarningIcon fontSize="small" /> {missingLinks} missing links</span>
          )}
        </div>
      </div>

      {/* Warning banner if items missing requirement links */}
      {missingLinks > 0 && (
        <div className="delivery-warning-banner">
          <WarningIcon />
          <span>
            <strong>{missingLinks} delivery item{missingLinks !== 1 ? 's' : ''}</strong> missing required requirement links.
            Delivery items should implement/realise requirements, not replace them.
          </span>
        </div>
      )}

      <div className="delivery-hierarchy">
        {/* D1: Epics */}
        <div className="delivery-level">
          <div className="level-header" style={{ borderColor: '#7c3aed' }}>
            <span className="level-badge" style={{ backgroundColor: '#7c3aed' }}>D1</span>
            <span className="level-name">Epics</span>
            <span className="level-desc">IMPLEMENTS Business Requirements</span>
            <span className="level-count">{grouped.Epic.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('Epic')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content horizontal">
            {grouped.Epic.length > 0 ? (
              grouped.Epic.map(item => <DeliveryCard key={item.id} item={item} />)
            ) : (
              <div className="empty-level">No epics yet</div>
            )}
          </div>
        </div>

        {/* D2: Features */}
        <div className="delivery-level">
          <div className="level-header" style={{ borderColor: '#8b5cf6' }}>
            <span className="level-badge" style={{ backgroundColor: '#8b5cf6' }}>D2</span>
            <span className="level-name">Features</span>
            <span className="level-desc">REALISES Stakeholder/Solution Requirements</span>
            <span className="level-count">{grouped.Feature.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('Feature')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content horizontal">
            {grouped.Feature.length > 0 ? (
              grouped.Feature.map(item => <DeliveryCard key={item.id} item={item} />)
            ) : (
              <div className="empty-level">No features yet</div>
            )}
          </div>
        </div>

        {/* D3: User Stories */}
        <div className="delivery-level">
          <div className="level-header" style={{ borderColor: '#a78bfa' }}>
            <span className="level-badge" style={{ backgroundColor: '#a78bfa' }}>D3</span>
            <span className="level-name">User Stories</span>
            <span className="level-desc">OPERATIONALISES Functional Requirements</span>
            <span className="level-count">{grouped.UserStory.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('UserStory')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content horizontal">
            {grouped.UserStory.length > 0 ? (
              grouped.UserStory.map(item => <DeliveryCard key={item.id} item={item} />)
            ) : (
              <div className="empty-level">No user stories yet</div>
            )}
          </div>
        </div>

        {/* D4: Tickets */}
        <div className="delivery-level">
          <div className="level-header" style={{ borderColor: '#c4b5fd' }}>
            <span className="level-badge" style={{ backgroundColor: '#c4b5fd' }}>D4</span>
            <span className="level-name">Tickets</span>
            <span className="level-desc">Technical tasks</span>
            <span className="level-count">{grouped.Ticket.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('Ticket')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content horizontal">
            {grouped.Ticket.length > 0 ? (
              grouped.Ticket.map(item => <DeliveryCard key={item.id} item={item} />)
            ) : (
              <div className="empty-level">No tickets yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN WORKSPACE ============
export default function BAWorkspace({ diagramComponent }) {
  const { user } = useAuth();
  const { activeProject } = useProjects();
  const {
    artefacts,
    relationships,
    createArtefact,
    updateDocument,
    getRequirements,
    getDeliveryItems,
    getOrphanedDeliveryItems,
    getUnimplementedRequirements,
  } = useArtefacts();

  // Current viewpoint - derived from active tab
  const [activeViewpoint, setActiveViewpoint] = useState('requirements');

  // State
  const [activeTab, setActiveTabState] = useState('requirements');
  const [selectedArtefact, setSelectedArtefactState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailCollapsed, setDetailCollapsed] = useState(false);
  // Document/Diagram editing state
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingDiagram, setEditingDiagram] = useState(null);

  // Persist active tab to localStorage
  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    if (activeProject) {
      localStorage.setItem(`ba-tab-${activeProject.id}`, tab);
    }
  }, [activeProject]);

  // Persist selected artefact to localStorage
  const setSelectedArtefact = useCallback((artefact) => {
    setSelectedArtefactState(artefact);
    if (activeProject && artefact) {
      localStorage.setItem(`ba-selected-${activeProject.id}`, artefact.id);
    } else if (activeProject) {
      localStorage.removeItem(`ba-selected-${activeProject.id}`);
    }
  }, [activeProject]);

  // Restore last state on mount/project change
  useEffect(() => {
    if (!activeProject || !artefacts.length) return;

    // Restore active tab
    const savedTab = localStorage.getItem(`ba-tab-${activeProject.id}`);
    if (savedTab) {
      setActiveTabState(savedTab);
    }

    // Restore selected artefact
    const savedArtefactId = localStorage.getItem(`ba-selected-${activeProject.id}`);
    if (savedArtefactId) {
      const found = artefacts.find(a => a.id === savedArtefactId);
      if (found) {
        setSelectedArtefactState(found);
      }
    }
  }, [activeProject, artefacts]);

  // Filtered artefacts based on search
  const filteredArtefacts = useMemo(() => {
    let result = artefacts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.artefactType.toLowerCase().includes(query)
      );
    }

    return result;
  }, [artefacts, searchQuery]);

  // Tab counts - based on meta-model sections
  const tabCounts = useMemo(() => {
    const requirements = artefacts.filter(a => ARTEFACT_TYPES[a.artefactType]?.section === 'requirements');
    const delivery = artefacts.filter(a => ARTEFACT_TYPES[a.artefactType]?.section === 'delivery');
    const orphanedDelivery = delivery.filter(item => {
      if (item.artefactType === 'Ticket') return false;
      const requiredRelTypes = { Epic: 'implements', Feature: 'realises', UserStory: 'operationalises' };
      const relType = requiredRelTypes[item.artefactType];
      return !relationships.some(r => r.from === item.id && r.type === relType);
    });

    return {
      requirements: requirements.length,
      delivery: delivery.length,
      trace: orphanedDelivery.length, // Show count of items needing attention
      documents: 0,
      map: 0,
    };
  }, [artefacts, relationships]);

  // Handle create
  const handleCreate = (type) => {
    if (type === 'document') {
      setActiveTab('documents');
      return;
    }
    setCreateType(type);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (data) => {
    // createArtefact expects (type, data) as separate arguments
    const newArtefact = await createArtefact(createType, data);
    if (newArtefact) {
      setSelectedArtefact(newArtefact);
    }
    setShowCreateModal(false);
    setCreateType(null);
  };

  // Handle selection from tree
  const handleSelectFromTree = (artefact) => {
    setSelectedArtefact(artefact);
    // If on kanban and selecting non-ticket, switch to document
    if (activeTab === 'kanban' && artefact.artefactType !== 'Ticket') {
      setActiveTab('document');
    }
  };

  // Handle opening document from artefact
  const handleOpenDocument = (doc) => {
    setEditingDocument(doc);
  };

  // Handle opening diagram from artefact
  const handleOpenDiagram = (diag) => {
    setEditingDiagram(diag);
  };

  if (!user) {
    return (
      <div className="workspace-login-prompt">
        <h2>Business Analysis Workspace</h2>
        <p>Please log in to access the workspace.</p>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="workspace-no-project">
        <h2>No Project Selected</h2>
        <p>Select or create a project to start working.</p>
      </div>
    );
  }

  return (
    <div className="ba-workspace">
      {/* Header */}
      <div className="workspace-header">
        <div className="workspace-header-left">
          <ViewpointIndicator activeViewpoint={activeViewpoint} />
          <div className="header-separator" />
          <div className="project-indicator">
            <span className="project-name">{activeProject.name}</span>
          </div>
        </div>

        <div className="workspace-header-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search artefacts..."
          />
        </div>

        <div className="workspace-header-right">
          <UnifiedCreateMenu
            activeViewpoint={activeViewpoint}
            onViewpointChange={setActiveViewpoint}
            onCreate={handleCreate}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="workspace-body">
        {/* Repository Sidebar */}
        <div className={`workspace-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">Repository</span>
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </button>
          </div>
          {!sidebarCollapsed && (
            <RepositoryTree
              artefacts={filteredArtefacts}
              relationships={relationships}
              selectedId={selectedArtefact?.id}
              onSelect={handleSelectFromTree}
              viewpoint={activeViewpoint}
            />
          )}
        </div>

        {/* Main Workspace Area */}
        <div className="workspace-main">
          <WorkspaceTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={tabCounts}
          />

          <div className="workspace-content">
            {activeTab === 'requirements' && (
              <RequirementsView
                artefacts={filteredArtefacts}
                relationships={relationships}
                selectedArtefact={selectedArtefact}
                onSelectArtefact={setSelectedArtefact}
                onCreate={handleCreate}
              />
            )}

            {activeTab === 'delivery' && (
              <DeliveryView
                artefacts={filteredArtefacts}
                relationships={relationships}
                selectedArtefact={selectedArtefact}
                onSelectArtefact={setSelectedArtefact}
                onCreate={handleCreate}
              />
            )}

            {activeTab === 'map' && (
              <StrategyMap
                onSelectArtefact={(artefact) => {
                  setSelectedArtefact(artefact);
                }}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsList
                projectId={activeProject?.id}
                onOpenDocument={handleOpenDocument}
              />
            )}

            {activeTab === 'diagram' && diagramComponent}

            {activeTab === 'trace' && (
              <TraceView
                artefact={selectedArtefact}
                artefacts={artefacts}
                relationships={relationships}
                onSelectArtefact={setSelectedArtefact}
              />
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedArtefact && !detailCollapsed && (
          <div className="workspace-detail">
            <ArtefactDetailPanel
              artefact={selectedArtefact}
              onClose={() => setSelectedArtefact(null)}
              onUpdate={(updated) => setSelectedArtefact(updated)}
              onNavigate={handleSelectFromTree}
              onOpenDocument={handleOpenDocument}
              onOpenDiagram={handleOpenDiagram}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar
        artefacts={artefacts}
        viewpoint={activeViewpoint}
      />

      {/* Create Modal - Using Guided Modal with contextual help */}
      {showCreateModal && createType && (
        <GuidedCreateModal
          type={createType}
          onClose={() => { setShowCreateModal(false); setCreateType(null); }}
          onCreate={handleCreateSubmit}
        />
      )}

      {/* Document Editor Modal */}
      {editingDocument && (
        <div className="document-editor-modal">
          <div className="document-editor-modal-header">
            <h3>{editingDocument.name}</h3>
            <button
              className="close-btn"
              onClick={() => setEditingDocument(null)}
            >
              ×
            </button>
          </div>
          <div className="document-editor-modal-content">
            <DocumentEditor
              document={editingDocument}
              onSave={(updates) => {
                if (updateDocument) {
                  updateDocument(editingDocument.id, updates);
                  setEditingDocument(prev => ({ ...prev, ...updates }));
                }
              }}
              onClose={() => setEditingDocument(null)}
              artefactId={editingDocument.artefactId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============ IMPROVED CREATE MODAL ============
function CreateArtefactModal({ type, artefacts, relationships, onClose, onCreate }) {
  const typeDef = ARTEFACT_TYPES[type];
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    status: 'Draft',
    parentId: '',
    parentRelType: '',
    tags: '',
  });

  // Find potential parent types for this artefact type
  const parentOptions = useMemo(() => {
    const options = [];
    Object.entries(ALLOWED_RELATIONSHIPS).forEach(([fromType, rels]) => {
      Object.entries(rels).forEach(([relType, toTypes]) => {
        if (toTypes.includes(type)) {
          // Find artefacts of fromType
          const parents = artefacts.filter(a => a.artefactType === fromType);
          parents.forEach(p => {
            options.push({
              artefact: p,
              relationType: relType,
              relDef: RELATIONSHIP_TYPES[relType],
              typeDef: ARTEFACT_TYPES[fromType],
            });
          });
        }
      });
    });
    return options;
  }, [artefacts, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const tags = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    onCreate({
      ...formData,
      tags,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-artefact-modal-v2" onClick={e => e.stopPropagation()}>
        {/* Header with type badge */}
        <div className="modal-header-v2" style={{ '--type-color': typeDef?.color }}>
          <div className="modal-type-header">
            <span className="modal-type-icon" style={{ backgroundColor: typeDef?.color }}>
              {typeDef?.icon}
            </span>
            <div className="modal-type-info">
              <h3>Create {typeDef?.name}</h3>
              <span className="modal-type-desc">{typeDef?.description}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`modal-tab ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            <LinkIcon fontSize="small" />
            Links
            {formData.parentId && <span className="tab-badge">1</span>}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'basic' && (
            <div className="modal-form-content">
              <div className="form-field-v2">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`Enter ${typeDef?.name?.toLowerCase()} name...`}
                  autoFocus
                  required
                  className="input-large"
                />
              </div>

              <div className="form-field-v2">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this artefact..."
                  rows={4}
                />
              </div>

              <div className="form-row-v2">
                <div className="form-field-v2">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="select-with-indicator"
                    style={{ '--priority-color': formData.priority === 'Critical' ? '#ef4444' : formData.priority === 'High' ? '#f97316' : formData.priority === 'Medium' ? '#fbbf24' : '#22c55e' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-field-v2">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="InReview">In Review</option>
                  </select>
                </div>
              </div>

              <div className="form-field-v2">
                <label>Tags <span className="hint">(comma separated)</span></label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., mvp, phase-1, security"
                />
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="modal-form-content">
              <div className="links-section">
                <h4>Link to Parent Artefact</h4>
                <p className="links-description">
                  Connect this {typeDef?.name?.toLowerCase()} to a parent artefact to establish traceability.
                </p>

                {parentOptions.length > 0 ? (
                  <div className="parent-options">
                    <div className="form-field-v2">
                      <label>Select Parent</label>
                      <select
                        value={formData.parentId ? `${formData.parentId}|${formData.parentRelType}` : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [parentId, relType] = e.target.value.split('|');
                            setFormData({ ...formData, parentId, parentRelType: relType });
                          } else {
                            setFormData({ ...formData, parentId: '', parentRelType: '' });
                          }
                        }}
                      >
                        <option value="">No parent link</option>
                        {parentOptions.map((opt, idx) => (
                          <option key={idx} value={`${opt.artefact.id}|${opt.relationType}`}>
                            [{opt.typeDef?.icon}] {opt.artefact.name} ({opt.relDef?.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.parentId && (
                      <div className="selected-parent-preview">
                        <span className="preview-label">Will create relationship:</span>
                        <div className="preview-relationship">
                          <span className="preview-parent">
                            {parentOptions.find(o => o.artefact.id === formData.parentId)?.artefact.name}
                          </span>
                          <span className="preview-arrow" style={{ color: RELATIONSHIP_TYPES[formData.parentRelType]?.color }}>
                            → {RELATIONSHIP_TYPES[formData.parentRelType]?.name} →
                          </span>
                          <span className="preview-child">{formData.name || '(this artefact)'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-parents-message">
                    <p>No valid parent artefacts available for {typeDef?.name}.</p>
                    <p className="hint">Create parent artefacts first, or link after creation.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions-v2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!formData.name.trim()}
              style={{ backgroundColor: typeDef?.color }}
            >
              <AddIcon fontSize="small" />
              Create {typeDef?.name}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { UnifiedCreateMenu, ViewpointIndicator, WorkspaceTabs, SearchBar, StatusBar, TraceView };
