// components/ba/ArtefactDetailPanel.js
// Unified detail panel for any artefact type
// Shows properties, relationships, governance, and actions

import { useState, useMemo } from 'react';
import {
  useArtefacts,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
  PRIORITY,
  RELATIONSHIP_TYPES,
  ALLOWED_RELATIONSHIPS,
} from '../ArtefactContext';
import EALinkPanel from './EALinkPanel';

// ============ PROPERTY ROW ============
function PropertyRow({ label, value, editable, onChange, type = 'text', options = [] }) {
  if (editable) {
    if (type === 'select') {
      return (
        <div className="property-row">
          <label>{label}</label>
          <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }
    if (type === 'textarea') {
      return (
        <div className="property-row">
          <label>{label}</label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        </div>
      );
    }
    return (
      <div className="property-row">
        <label>{label}</label>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="property-row readonly">
      <label>{label}</label>
      <span className="property-value">{value || '-'}</span>
    </div>
  );
}

// ============ RELATIONSHIP SECTION ============
function RelationshipSection({ artefact, direction, onNavigate }) {
  const { relationships, artefacts, deleteRelationship } = useArtefacts();

  const relatedItems = useMemo(() => {
    if (direction === 'upstream') {
      return relationships
        .filter(r => r.to === artefact.id)
        .map(r => ({
          ...r,
          artefact: artefacts.find(a => a.id === r.from),
        }))
        .filter(r => r.artefact);
    }
    return relationships
      .filter(r => r.from === artefact.id)
      .map(r => ({
        ...r,
        artefact: artefacts.find(a => a.id === r.to),
      }))
      .filter(r => r.artefact);
  }, [artefact.id, relationships, artefacts, direction]);

  if (relatedItems.length === 0) {
    return (
      <div className="relation-section empty">
        <span className="relation-section-label">
          {direction === 'upstream' ? 'Traces From' : 'Traces To'}
        </span>
        <p className="relation-empty">No {direction} relationships</p>
      </div>
    );
  }

  return (
    <div className="relation-section">
      <span className="relation-section-label">
        {direction === 'upstream' ? 'Traces From' : 'Traces To'} ({relatedItems.length})
      </span>
      <div className="relation-list">
        {relatedItems.map(rel => {
          const typeDef = ARTEFACT_TYPES[rel.artefact.artefactType];
          const relDef = RELATIONSHIP_TYPES[rel.type];
          return (
            <div key={rel.id} className="relation-item">
              <button
                className="relation-item-content"
                onClick={() => onNavigate(rel.artefact)}
              >
                <span
                  className="relation-item-icon"
                  style={{ backgroundColor: typeDef?.color }}
                >
                  {typeDef?.icon}
                </span>
                <span className="relation-item-name">{rel.artefact.name}</span>
                <span className="relation-item-type">{relDef?.name || rel.type}</span>
              </button>
              <button
                className="relation-item-delete"
                onClick={() => deleteRelationship(rel.id)}
                title="Remove relationship"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ ADD RELATIONSHIP ============
function AddRelationship({ artefact, onAdd }) {
  const { artefacts, createRelationship } = useArtefacts();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');

  const allowedRels = ALLOWED_RELATIONSHIPS[artefact.artefactType] || {};
  const relTypes = Object.keys(allowedRels);

  const availableTargets = useMemo(() => {
    if (!selectedType) return [];
    const allowedTargetTypes = allowedRels[selectedType] || [];
    return artefacts.filter(a =>
      a.id !== artefact.id &&
      allowedTargetTypes.includes(a.artefactType)
    );
  }, [selectedType, allowedRels, artefacts, artefact.id]);

  const handleAdd = () => {
    if (selectedType && selectedTarget) {
      // createRelationship expects (type, fromId, toId)
      createRelationship(selectedType, artefact.id, selectedTarget);
      setIsOpen(false);
      setSelectedType('');
      setSelectedTarget('');
      onAdd?.();
    }
  };

  if (relTypes.length === 0) {
    return null;
  }

  return (
    <div className="add-relationship">
      {!isOpen ? (
        <button className="add-rel-trigger" onClick={() => setIsOpen(true)}>
          + Add Relationship
        </button>
      ) : (
        <div className="add-rel-form">
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setSelectedTarget(''); }}
          >
            <option value="">Select relationship type...</option>
            {relTypes.map(type => (
              <option key={type} value={type}>
                {RELATIONSHIP_TYPES[type]?.name || type}
              </option>
            ))}
          </select>

          {selectedType && (
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
            >
              <option value="">Select target...</option>
              {availableTargets.map(target => (
                <option key={target.id} value={target.id}>
                  [{ARTEFACT_TYPES[target.artefactType]?.icon}] {target.name}
                </option>
              ))}
            </select>
          )}

          <div className="add-rel-actions">
            <button className="btn-small" onClick={handleAdd} disabled={!selectedTarget}>
              Add
            </button>
            <button className="btn-small secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ USER STORY BREAKDOWN ============
function UserStoryBreakdown({ artefact, onNavigate, onCreateRequirement }) {
  const { artefacts, relationships, createArtefact, createRelationship } = useArtefacts();
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState('functional'); // 'functional' or 'nonfunctional'

  // Get linked solution requirements
  const linkedRequirements = useMemo(() => {
    const reqRelations = relationships
      .filter(r => r.from === artefact.id && r.type === 'tracesTo')
      .map(r => {
        const req = artefacts.find(a => a.id === r.to && a.artefactType === 'SolutionRequirement');
        return req ? { relationship: r, requirement: req } : null;
      })
      .filter(Boolean);

    // Also check reverse direction (requirements tracing to user story)
    const reverseRelations = relationships
      .filter(r => r.to === artefact.id && r.type === 'tracesTo')
      .map(r => {
        const req = artefacts.find(a => a.id === r.from && a.artefactType === 'SolutionRequirement');
        return req ? { relationship: r, requirement: req } : null;
      })
      .filter(Boolean);

    const all = [...reqRelations, ...reverseRelations];

    // Categorize by customFields.category or tags
    const functional = all.filter(r =>
      r.requirement.customFields?.category === 'functional' ||
      r.requirement.tags?.includes('functional')
    );
    const nonFunctional = all.filter(r =>
      r.requirement.customFields?.category === 'non-functional' ||
      r.requirement.tags?.includes('non-functional') ||
      r.requirement.tags?.includes('nfr')
    );
    const uncategorized = all.filter(r =>
      !functional.includes(r) && !nonFunctional.includes(r)
    );

    return { functional, nonFunctional, uncategorized, total: all.length };
  }, [artefact.id, relationships, artefacts]);

  const handleQuickCreate = (category) => {
    setCreateType(category);
    setShowCreate(true);
  };

  const handleCreateRequirement = (name) => {
    if (!name.trim()) return;

    // Create the solution requirement
    const newReq = createArtefact('SolutionRequirement', {
      name: name.trim(),
      description: `${createType === 'functional' ? 'Functional' : 'Non-functional'} requirement for: ${artefact.name}`,
      status: 'Draft',
      priority: 'Medium',
      tags: [createType === 'functional' ? 'functional' : 'non-functional'],
      customFields: {
        category: createType === 'functional' ? 'functional' : 'non-functional',
      },
    });

    if (newReq) {
      // Create relationship from user story to requirement
      // createRelationship expects (type, fromId, toId)
      createRelationship('tracesTo', artefact.id, newReq.id);
    }

    setShowCreate(false);
  };

  return (
    <div className="user-story-breakdown">
      <h4>Solution Requirements Breakdown</h4>
      <p className="breakdown-hint">
        Break down this user story into specific functional and non-functional requirements.
      </p>

      {/* Functional Requirements */}
      <div className="requirements-section">
        <div className="requirements-header">
          <span className="requirements-icon functional">F</span>
          <span className="requirements-title">Functional Requirements</span>
          <span className="requirements-count">{linkedRequirements.functional.length}</span>
          <button
            className="quick-create-btn"
            onClick={() => handleQuickCreate('functional')}
          >
            + Add
          </button>
        </div>
        {linkedRequirements.functional.length === 0 ? (
          <div className="requirements-empty">
            No functional requirements linked yet
          </div>
        ) : (
          <div className="requirements-list">
            {linkedRequirements.functional.map(({ requirement }) => (
              <button
                key={requirement.id}
                className="requirement-item"
                onClick={() => onNavigate?.(requirement)}
              >
                <span className="req-status" style={{ backgroundColor: ARTEFACT_STATUS[requirement.status]?.color }} />
                <span className="req-name">{requirement.name}</span>
                <span className="req-priority" style={{ color: PRIORITY[requirement.priority]?.color }}>
                  {requirement.priority}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Non-Functional Requirements */}
      <div className="requirements-section">
        <div className="requirements-header">
          <span className="requirements-icon nonfunctional">NF</span>
          <span className="requirements-title">Non-Functional Requirements</span>
          <span className="requirements-count">{linkedRequirements.nonFunctional.length}</span>
          <button
            className="quick-create-btn"
            onClick={() => handleQuickCreate('nonfunctional')}
          >
            + Add
          </button>
        </div>
        {linkedRequirements.nonFunctional.length === 0 ? (
          <div className="requirements-empty">
            No non-functional requirements linked yet
          </div>
        ) : (
          <div className="requirements-list">
            {linkedRequirements.nonFunctional.map(({ requirement }) => (
              <button
                key={requirement.id}
                className="requirement-item"
                onClick={() => onNavigate?.(requirement)}
              >
                <span className="req-status" style={{ backgroundColor: ARTEFACT_STATUS[requirement.status]?.color }} />
                <span className="req-name">{requirement.name}</span>
                <span className="req-priority" style={{ color: PRIORITY[requirement.priority]?.color }}>
                  {requirement.priority}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Uncategorized Requirements */}
      {linkedRequirements.uncategorized.length > 0 && (
        <div className="requirements-section uncategorized">
          <div className="requirements-header">
            <span className="requirements-icon uncategorized">?</span>
            <span className="requirements-title">Uncategorized</span>
            <span className="requirements-count">{linkedRequirements.uncategorized.length}</span>
          </div>
          <div className="requirements-list">
            {linkedRequirements.uncategorized.map(({ requirement }) => (
              <button
                key={requirement.id}
                className="requirement-item"
                onClick={() => onNavigate?.(requirement)}
              >
                <span className="req-status" style={{ backgroundColor: ARTEFACT_STATUS[requirement.status]?.color }} />
                <span className="req-name">{requirement.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      {showCreate && (
        <div className="quick-create-modal">
          <div className="quick-create-header">
            <span>New {createType === 'functional' ? 'Functional' : 'Non-Functional'} Requirement</span>
            <button onClick={() => setShowCreate(false)}>×</button>
          </div>
          <input
            type="text"
            placeholder="Requirement name..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateRequirement(e.target.value);
              }
              if (e.key === 'Escape') {
                setShowCreate(false);
              }
            }}
          />
          <p className="quick-create-hint">Press Enter to create, Escape to cancel</p>
        </div>
      )}

      {/* Summary */}
      <div className="breakdown-summary">
        <span>Total: {linkedRequirements.total} requirements</span>
        {linkedRequirements.total > 0 && (
          <span className="breakdown-coverage">
            Coverage: {Math.round(
              (linkedRequirements.functional.filter(r => r.requirement.status === 'Approved').length +
               linkedRequirements.nonFunctional.filter(r => r.requirement.status === 'Approved').length) /
              linkedRequirements.total * 100
            )}% approved
          </span>
        )}
      </div>
    </div>
  );
}

// ============ ARTEFACT DOCUMENTS ============
function ArtefactDocuments({ artefact, onOpenDocument }) {
  const artefactContext = useArtefacts();
  const { documents = [], createDocument, deleteDocument } = artefactContext || {};
  const [showCreate, setShowCreate] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [error, setError] = useState('');

  // Debug: log context and props
  console.log('ArtefactDocuments render - context:', {
    hasContext: !!artefactContext,
    hasCreateDocument: !!createDocument,
    hasOnOpenDocument: !!onOpenDocument,
    documentsCount: documents?.length,
    artefactId: artefact?.id
  });

  // Get documents linked to this artefact
  const artefactDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter(d => d.artefactId === artefact.id);
  }, [documents, artefact.id]);

  const handleCreateDocument = () => {
    if (!newDocName.trim()) return;
    setError('');

    if (!createDocument) {
      setError('Document creation not available');
      console.error('createDocument function is not available');
      return;
    }

    console.log('Creating document for artefact:', artefact.id);
    try {
      const newDoc = createDocument({
        name: newDocName.trim(),
        artefactId: artefact.id,
        type: 'document',
        blocks: [
          { id: 'block-1', type: 'heading', content: { level: 1, text: newDocName.trim() } },
          { id: 'block-2', type: 'paragraph', content: { text: '' } },
        ],
      });
      console.log('Created document:', newDoc);
      if (newDoc && onOpenDocument) {
        onOpenDocument(newDoc);
      }
      setNewDocName('');
      setShowCreate(false);
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Failed to create document: ' + err.message);
    }
  };

  const handleQuickCreate = (templateName) => {
    console.log('handleQuickCreate called with:', templateName);
    console.log('createDocument available:', !!createDocument);
    console.log('onOpenDocument available:', !!onOpenDocument);
    setError('');

    if (!createDocument) {
      setError('Document creation not available - createDocument is undefined');
      console.error('createDocument function is not available from context');
      return;
    }

    const templates = {
      'Specification': [
        { id: 'b1', type: 'heading', content: { level: 1, text: `${artefact.name} - Specification` } },
        { id: 'b2', type: 'heading', content: { level: 2, text: 'Overview' } },
        { id: 'b3', type: 'paragraph', content: { text: '' } },
        { id: 'b4', type: 'heading', content: { level: 2, text: 'Requirements' } },
        { id: 'b5', type: 'paragraph', content: { text: '' } },
        { id: 'b6', type: 'heading', content: { level: 2, text: 'Acceptance Criteria' } },
        { id: 'b7', type: 'paragraph', content: { text: '' } },
      ],
      'Notes': [
        { id: 'b1', type: 'heading', content: { level: 1, text: `${artefact.name} - Notes` } },
        { id: 'b2', type: 'paragraph', content: { text: '' } },
      ],
      'Meeting Notes': [
        { id: 'b1', type: 'heading', content: { level: 1, text: `Meeting Notes - ${new Date().toLocaleDateString()}` } },
        { id: 'b2', type: 'heading', content: { level: 2, text: 'Attendees' } },
        { id: 'b3', type: 'paragraph', content: { text: '' } },
        { id: 'b4', type: 'heading', content: { level: 2, text: 'Discussion' } },
        { id: 'b5', type: 'paragraph', content: { text: '' } },
        { id: 'b6', type: 'heading', content: { level: 2, text: 'Action Items' } },
        { id: 'b7', type: 'paragraph', content: { text: '' } },
      ],
    };

    try {
      console.log('Quick creating:', templateName);
      const newDoc = createDocument({
        name: `${artefact.name} - ${templateName}`,
        artefactId: artefact.id,
        type: 'document',
        blocks: templates[templateName] || templates['Notes'],
      });
      console.log('Created document:', newDoc);
      if (newDoc && onOpenDocument) {
        onOpenDocument(newDoc);
      }
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Failed to create document: ' + err.message);
    }
  };

  return (
    <div className="artefact-documents-panel">
      {/* Header with count */}
      <div className="docs-panel-header">
        <div className="docs-panel-title">
          <span className="docs-icon-large">📄</span>
          <div>
            <h4>Documents</h4>
            <span className="docs-count">{artefactDocs.length} document{artefactDocs.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="docs-error" style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Quick Create Templates */}
      {!showCreate && (
        <div className="docs-quick-templates" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
          <span className="templates-label" style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>Quick create:</span>
          <button
            type="button"
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Specification clicked');
              handleQuickCreate('Specification');
            }}
          >
            Specification
          </button>
          <button
            type="button"
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Notes clicked');
              handleQuickCreate('Notes');
            }}
          >
            Notes
          </button>
          <button
            type="button"
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Meeting Notes clicked');
              handleQuickCreate('Meeting Notes');
            }}
          >
            Meeting Notes
          </button>
          <button
            type="button"
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--primary)', cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Custom clicked');
              setShowCreate(true);
            }}
          >
            + Custom
          </button>
        </div>
      )}

      {/* Custom Create Form */}
      {showCreate && (
        <div className="docs-create-form">
          <label>Document Name</label>
          <input
            type="text"
            placeholder="Enter document name..."
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newDocName.trim()) handleCreateDocument();
              if (e.key === 'Escape') { setShowCreate(false); setNewDocName(''); }
            }}
          />
          <div className="docs-create-actions">
            <button
              className="btn-primary"
              onClick={handleCreateDocument}
              disabled={!newDocName.trim()}
            >
              Create & Open
            </button>
            <button className="btn-secondary" onClick={() => { setShowCreate(false); setNewDocName(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      {artefactDocs.length === 0 ? (
        <div className="docs-empty-state">
          <div className="empty-icon">📝</div>
          <h5>No documents yet</h5>
          <p>Documents help you capture detailed specifications, requirements, meeting notes, and other information for this artefact.</p>
          <button className="btn-create-first" onClick={() => setShowCreate(true)}>
            Create Your First Document
          </button>
        </div>
      ) : (
        <div className="docs-list">
          {artefactDocs.map(doc => (
            <div key={doc.id} className="doc-card">
              <button
                className="doc-card-main"
                onClick={() => onOpenDocument?.(doc)}
              >
                <span className="doc-card-icon">📄</span>
                <div className="doc-card-info">
                  <span className="doc-card-name">{doc.name}</span>
                  <span className="doc-card-meta">
                    Last edited {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="doc-card-arrow">→</span>
              </button>
              <button
                className="doc-card-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${doc.name}"?`)) {
                    deleteDocument?.(doc.id);
                  }
                }}
                title="Delete document"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ ARTEFACT DIAGRAMS ============
function ArtefactDiagrams({ artefact, onOpenDiagram }) {
  const { diagrams = [], createDiagram, deleteDiagram } = useArtefacts();
  const [showCreate, setShowCreate] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [newDiagramType, setNewDiagramType] = useState('flowchart');

  // Get diagrams linked to this artefact
  const artefactDiagrams = useMemo(() => {
    return diagrams.filter(d => d.artefactId === artefact.id);
  }, [diagrams, artefact.id]);

  const diagramTypes = [
    { value: 'flowchart', label: 'Flowchart', icon: '📊' },
    { value: 'process', label: 'Process Flow', icon: '🔄' },
    { value: 'sequence', label: 'Sequence', icon: '📋' },
    { value: 'architecture', label: 'Architecture', icon: '🏗️' },
    { value: 'wireframe', label: 'Wireframe', icon: '🖼️' },
  ];

  const handleCreateDiagram = () => {
    if (!newDiagramName.trim()) return;
    const newDiag = createDiagram?.({
      name: newDiagramName.trim(),
      artefactId: artefact.id,
      type: newDiagramType,
      nodes: [],
      edges: [],
    });
    if (newDiag && onOpenDiagram) {
      onOpenDiagram(newDiag);
    }
    setNewDiagramName('');
    setNewDiagramType('flowchart');
    setShowCreate(false);
  };

  return (
    <div className="artefact-diagrams">
      <div className="artefact-diagrams-header">
        <h4>Diagrams</h4>
        <button className="quick-create-btn" onClick={() => setShowCreate(true)}>
          + New Diagram
        </button>
      </div>

      {showCreate && (
        <div className="quick-create-inline">
          <input
            type="text"
            placeholder="Diagram name..."
            value={newDiagramName}
            onChange={(e) => setNewDiagramName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateDiagram();
              if (e.key === 'Escape') setShowCreate(false);
            }}
          />
          <select
            value={newDiagramType}
            onChange={(e) => setNewDiagramType(e.target.value)}
          >
            {diagramTypes.map(t => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
          <div className="quick-create-actions">
            <button onClick={handleCreateDiagram}>Create</button>
            <button className="secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {artefactDiagrams.length === 0 ? (
        <div className="artefact-diagrams-empty">
          <p>No diagrams yet</p>
          <p className="hint">Create diagrams to visualize processes, flows, or architecture for this artefact.</p>
        </div>
      ) : (
        <div className="artefact-diagrams-list">
          {artefactDiagrams.map(diag => {
            const typeInfo = diagramTypes.find(t => t.value === diag.type) || { icon: '📊', label: diag.type };
            return (
              <div key={diag.id} className="artefact-diagram-item">
                <button
                  className="diagram-item-content"
                  onClick={() => onOpenDiagram?.(diag)}
                >
                  <span className="diagram-icon">{typeInfo.icon}</span>
                  <span className="diagram-name">{diag.name}</span>
                  <span className="diagram-type">{typeInfo.label}</span>
                </button>
                <button
                  className="diagram-item-delete"
                  onClick={() => {
                    if (window.confirm(`Delete diagram "${diag.name}"?`)) {
                      deleteDiagram?.(diag.id);
                    }
                  }}
                  title="Delete diagram"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ GOVERNANCE INFO ============
function GovernanceInfo({ artefact }) {
  const { validateArtefactApproval } = useArtefacts();
  const validation = validateArtefactApproval(artefact.id);

  return (
    <div className="governance-info">
      <div className="governance-status">
        {validation.valid ? (
          <div className="governance-valid">
            Ready for approval
          </div>
        ) : (
          <div className="governance-invalid">
            <span className="governance-invalid-label">Blocking issues:</span>
            <ul>
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {validation.warnings?.length > 0 && (
          <div className="governance-warnings">
            <span className="governance-warnings-label">Warnings:</span>
            <ul>
              {validation.warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="governance-audit">
        <div className="audit-row">
          <span>Created:</span>
          <span>{new Date(artefact.createdAt).toLocaleString()}</span>
        </div>
        <div className="audit-row">
          <span>Updated:</span>
          <span>{new Date(artefact.updatedAt).toLocaleString()}</span>
        </div>
        <div className="audit-row">
          <span>Version:</span>
          <span>{artefact.version}</span>
        </div>
        <div className="audit-row">
          <span>ID:</span>
          <span className="audit-id">{artefact.id}</span>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN DETAIL PANEL ============
export default function ArtefactDetailPanel({ artefact, onClose, onUpdate, onNavigate, onOpenDocument, onOpenDiagram }) {
  const { updateArtefact, deleteArtefact } = useArtefacts();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState('details');

  const typeDef = ARTEFACT_TYPES[artefact.artefactType];

  const handleStartEdit = () => {
    setEditData({
      name: artefact.name,
      description: artefact.description,
      status: artefact.status,
      priority: artefact.priority,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const updated = updateArtefact(artefact.id, editData);
    if (updated) {
      onUpdate?.(updated);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${artefact.name}"? This cannot be undone.`)) {
      deleteArtefact(artefact.id);
      onClose?.();
    }
  };

  const handleNavigate = (targetArtefact) => {
    if (onNavigate) {
      onNavigate(targetArtefact);
    } else if (onUpdate) {
      onUpdate(targetArtefact);
    }
  };

  return (
    <div className="artefact-detail-panel">
      {/* Header */}
      <div className="detail-panel-header">
        <div className="detail-header-top">
          <span
            className="detail-type-badge"
            style={{ backgroundColor: typeDef?.color }}
          >
            {typeDef?.icon}
          </span>
          <span className="detail-type-name">{typeDef?.name}</span>
          <button className="detail-close" onClick={onClose}>×</button>
        </div>

        {isEditing ? (
          <input
            type="text"
            className="detail-title-input"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            autoFocus
          />
        ) : (
          <h2 className="detail-title">{artefact.name}</h2>
        )}

        <div className="detail-status-row">
          {isEditing ? (
            <>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="detail-status-select"
              >
                {Object.values(ARTEFACT_STATUS).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                className="detail-priority-select"
              >
                {Object.values(PRIORITY).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <span
                className="detail-status"
                style={{ color: ARTEFACT_STATUS[artefact.status]?.color }}
              >
                {ARTEFACT_STATUS[artefact.status]?.name}
              </span>
              <span
                className="detail-priority"
                style={{ color: PRIORITY[artefact.priority]?.color }}
              >
                {PRIORITY[artefact.priority]?.name} Priority
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`detail-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        {artefact.artefactType === 'UserStory' && (
          <button
            className={`detail-tab ${activeTab === 'breakdown' ? 'active' : ''}`}
            onClick={() => setActiveTab('breakdown')}
          >
            Breakdown
          </button>
        )}
        <button
          className={`detail-tab ${activeTab === 'relations' ? 'active' : ''}`}
          onClick={() => setActiveTab('relations')}
        >
          Relations
        </button>
        <button
          className={`detail-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button
          className={`detail-tab ${activeTab === 'diagrams' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagrams')}
        >
          Diagrams
        </button>
        <button
          className={`detail-tab ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          Governance
        </button>
        <button
          className={`detail-tab ${activeTab === 'ea-links' ? 'active' : ''}`}
          onClick={() => setActiveTab('ea-links')}
        >
          EA Links
        </button>
      </div>

      {/* Content */}
      <div className="detail-content">
        {activeTab === 'details' && (
          <div className="detail-details">
            <div className="detail-section">
              <h4>Description</h4>
              {isEditing ? (
                <textarea
                  className="detail-description-input"
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  placeholder="Add a description..."
                />
              ) : (
                <p className="detail-description">
                  {artefact.description || 'No description provided.'}
                </p>
              )}
            </div>

            {artefact.tags?.length > 0 && (
              <div className="detail-section">
                <h4>Tags</h4>
                <div className="detail-tags">
                  {artefact.tags.map(tag => (
                    <span key={tag} className="detail-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {typeDef?.supportsArchitectureState && artefact.architectureState !== 'N/A' && (
              <div className="detail-section">
                <h4>Architecture State</h4>
                <span className="detail-arch-state">{artefact.architectureState}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'breakdown' && artefact.artefactType === 'UserStory' && (
          <UserStoryBreakdown
            artefact={artefact}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'relations' && (
          <div className="detail-relations">
            <RelationshipSection
              artefact={artefact}
              direction="upstream"
              onNavigate={handleNavigate}
            />
            <RelationshipSection
              artefact={artefact}
              direction="downstream"
              onNavigate={handleNavigate}
            />
            <AddRelationship artefact={artefact} />
          </div>
        )}

        {activeTab === 'documents' && (
          <ArtefactDocuments artefact={artefact} onOpenDocument={onOpenDocument} />
        )}

        {activeTab === 'diagrams' && (
          <ArtefactDiagrams artefact={artefact} onOpenDiagram={onOpenDiagram} />
        )}

        {activeTab === 'governance' && (
          <GovernanceInfo artefact={artefact} />
        )}

        {activeTab === 'ea-links' && (
          <EALinkPanel
            artefact={artefact}
            linkedGraphNodes={artefact.linkedGraphNodes || []}
            onUpdate={(updates) => {
              const updated = updateArtefact(artefact.id, updates);
              if (updated) {
                onUpdate?.(updated);
              }
            }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="detail-actions">
        {isEditing ? (
          <>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={handleStartEdit}>
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={artefact.status === 'Approved'}
              title={artefact.status === 'Approved' ? 'Cannot delete approved artefacts' : ''}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export { PropertyRow, RelationshipSection, AddRelationship, GovernanceInfo, UserStoryBreakdown, ArtefactDocuments, ArtefactDiagrams };
