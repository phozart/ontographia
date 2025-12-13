// components/ea/GuidedEAWorkspace.js
// Learning-first EA workspace with guided creation and viewpoint navigation

import { useState, useMemo, useCallback } from 'react';
import { useEA, EA_CONCEPTS, EA_RELATIONSHIPS, EA_VIEWPOINTS, EA_LEARNING, validateElement } from './EAContext';

// Icons (using emoji for simplicity - replace with MUI icons if preferred)
const ViewpointIcon = ({ viewpoint }) => {
  const icons = {
    capability: '🎯',
    process: '⚙️',
    application: '💻',
    information: '📊',
    impact: '💥',
  };
  return <span className="viewpoint-icon">{icons[viewpoint] || '📋'}</span>;
};

// ============ GUIDED CREATION WIZARD ============
function GuidedCreationWizard({ type, onComplete, onCancel }) {
  const { createElement, elements, relationships } = useEA();
  const concept = EA_CONCEPTS[type];
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [showTips, setShowTips] = useState(true);

  if (!concept) return null;

  const steps = [
    { id: 'info', title: 'About this element' },
    { id: 'fields', title: 'Define the element' },
    { id: 'review', title: 'Review & Create' },
  ];

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCreate = async () => {
    const element = {
      element_type: type,
      name: formData.name,
      description: formData.description || '',
      properties: { ...formData },
    };

    const result = await createElement(element);
    if (result) {
      onComplete(result);
    }
  };

  const validation = useMemo(() => {
    if (!formData.name) return { warnings: [], suggestions: [] };
    return validateElement({ ...formData, element_type: type }, elements, relationships);
  }, [formData, type, elements, relationships]);

  return (
    <div className="guided-wizard-overlay">
      <div className="guided-wizard">
        <div className="wizard-header">
          <span className="wizard-icon" style={{ background: concept.color }}>{concept.icon}</span>
          <div className="wizard-header-text">
            <h2>Create {concept.name}</h2>
            <p className="wizard-question">{concept.question}</p>
          </div>
          <button className="wizard-close" onClick={onCancel}>×</button>
        </div>

        {/* Progress Steps */}
        <div className="wizard-steps">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              className={`wizard-step ${idx === step ? 'active' : ''} ${idx < step ? 'completed' : ''}`}
              onClick={() => setStep(idx)}
            >
              <span className="step-num">{idx + 1}</span>
              <span className="step-title">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="wizard-body">
          {/* Step 0: Learning */}
          {step === 0 && (
            <div className="wizard-step-content">
              <div className="learning-section">
                <h3>What is a {concept.name}?</h3>
                <p className="concept-description">{concept.description}</p>

                <div className="examples-box">
                  <h4>Examples</h4>
                  <ul>
                    {concept.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>

                {concept.tips && (
                  <div className="tips-box">
                    <h4>Tips for Success</h4>
                    <ul>
                      {concept.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {concept.antiPatterns && concept.antiPatterns.length > 0 && (
                  <div className="antipattern-box">
                    <h4>Common Mistakes to Avoid</h4>
                    {concept.antiPatterns.map((ap, i) => (
                      <div key={i} className="antipattern">
                        <span className="antipattern-bad">❌ {ap.pattern}</span>
                        <span className="antipattern-fix">✓ {ap.fix}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Fields */}
          {step === 1 && (
            <div className="wizard-step-content">
              <div className="form-section">
                {concept.fields.map(field => (
                  <div key={field.id} className="form-field">
                    <label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        rows={3}
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                      >
                        <option value="">Select...</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}

                {/* Real-time validation feedback */}
                {validation.warnings.length > 0 && (
                  <div className="validation-warnings">
                    {validation.warnings.map((w, i) => (
                      <div key={i} className="validation-item warning">
                        <span className="validation-icon">⚠️</span>
                        <div>
                          <p>{w.message}</p>
                          {w.suggestion && <p className="suggestion">Tip: {w.suggestion}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side tips */}
              {showTips && concept.tips && (
                <div className="side-tips">
                  <div className="side-tips-header">
                    <span>Tips</span>
                    <button onClick={() => setShowTips(false)}>×</button>
                  </div>
                  <ul>
                    {concept.tips.slice(0, 2).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="wizard-step-content">
              <div className="review-section">
                <h3>Review Your {concept.name}</h3>

                <div className="review-card" style={{ borderColor: concept.color }}>
                  <div className="review-card-header" style={{ background: concept.color }}>
                    <span className="review-icon">{concept.icon}</span>
                    <span className="review-type">{concept.name}</span>
                  </div>
                  <div className="review-card-body">
                    {concept.fields.map(field => (
                      formData[field.id] && (
                        <div key={field.id} className="review-field">
                          <span className="review-label">{field.label}</span>
                          <span className="review-value">{formData[field.id]}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {validation.suggestions.length > 0 && (
                  <div className="suggestions-box">
                    <h4>Suggestions for after creation</h4>
                    {validation.suggestions.map((s, i) => (
                      <div key={i} className="suggestion-item">
                        <span>💡</span>
                        <span>{s.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {concept.recommendedLinks && (
                  <div className="next-steps-box">
                    <h4>Recommended Next Steps</h4>
                    <p>After creating this element, consider linking it to:</p>
                    <ul>
                      {concept.recommendedLinks.map(rel => {
                        const relDef = EA_RELATIONSHIPS[rel];
                        return relDef && (
                          <li key={rel}>
                            <strong>{relDef.name}</strong>: {relDef.description}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="wizard-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <div className="wizard-nav">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            {step < steps.length - 1 && (
              <button
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !formData.name}
              >
                Next
              </button>
            )}
            {step === steps.length - 1 && (
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!formData.name}
              >
                Create {concept.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ VIEWPOINT NAVIGATOR ============
function ViewpointNavigator({ activeViewpoint, onViewpointChange }) {
  return (
    <div className="viewpoint-nav">
      <div className="viewpoint-nav-header">
        <h3>Navigate by Question</h3>
        <p>What do you want to understand?</p>
      </div>
      <div className="viewpoint-list">
        {Object.values(EA_VIEWPOINTS).map(vp => (
          <button
            key={vp.id}
            className={`viewpoint-btn ${activeViewpoint === vp.id ? 'active' : ''}`}
            onClick={() => onViewpointChange(vp.id)}
            style={{ '--vp-color': vp.color }}
          >
            <ViewpointIcon viewpoint={vp.id} />
            <div className="viewpoint-info">
              <span className="viewpoint-question">{vp.question}</span>
              <span className="viewpoint-name">{vp.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ ELEMENT CARD ============
function ElementCard({ element, onClick, onDelete, showRelationships = false }) {
  const concept = EA_CONCEPTS[element.element_type];
  const { getRelatedElements } = useEA();

  const relatedCount = useMemo(() => {
    return getRelatedElements(element.id).length;
  }, [element.id, getRelatedElements]);

  if (!concept) return null;

  return (
    <div
      className="ea-element-card"
      style={{ '--card-color': concept.color }}
      onClick={() => onClick?.(element)}
    >
      <div className="element-card-header">
        <span className="element-icon">{concept.icon}</span>
        <span className="element-type">{concept.name}</span>
        {onDelete && (
          <button
            className="element-delete"
            onClick={e => { e.stopPropagation(); onDelete(element.id); }}
          >
            ×
          </button>
        )}
      </div>
      <h4 className="element-name">{element.name}</h4>
      {element.description && (
        <p className="element-description">{element.description}</p>
      )}
      <div className="element-footer">
        <span className="element-relations" title="Related elements">
          🔗 {relatedCount}
        </span>
        {element.properties?.maturityLevel && (
          <span className="element-maturity">{element.properties.maturityLevel}</span>
        )}
      </div>
    </div>
  );
}

// ============ ELEMENT DETAIL PANEL ============
function ElementDetailPanel({ element, onClose, onUpdate, onDelete }) {
  const { createRelationship, relationships, elements, getImpactAnalysis } = useEA();
  const [activeTab, setActiveTab] = useState('details');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(element?.properties || {});

  const concept = EA_CONCEPTS[element?.element_type];

  const elementRelationships = useMemo(() => {
    return relationships.filter(r => r.source_id === element?.id || r.target_id === element?.id);
  }, [relationships, element?.id]);

  const impactAnalysis = useMemo(() => {
    if (!element) return [];
    return getImpactAnalysis(element.id, 2);
  }, [element, getImpactAnalysis]);

  if (!element || !concept) return null;

  return (
    <div className="element-detail-panel">
      <div className="detail-header" style={{ background: concept.color }}>
        <span className="detail-icon">{concept.icon}</span>
        <div className="detail-header-text">
          <span className="detail-type">{concept.name}</span>
          <h3>{element.name}</h3>
        </div>
        <button className="detail-close" onClick={onClose}>×</button>
      </div>

      <div className="detail-tabs">
        <button
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={activeTab === 'relationships' ? 'active' : ''}
          onClick={() => setActiveTab('relationships')}
        >
          Relationships ({elementRelationships.length})
        </button>
        <button
          className={activeTab === 'impact' ? 'active' : ''}
          onClick={() => setActiveTab('impact')}
        >
          Impact Analysis
        </button>
      </div>

      <div className="detail-content">
        {activeTab === 'details' && (
          <div className="detail-fields">
            {concept.fields.map(field => (
              <div key={field.id} className="detail-field">
                <label>{field.label}</label>
                <span>{element.properties?.[field.id] || '-'}</span>
              </div>
            ))}

            <div className="detail-actions">
              <button className="btn btn-outline" onClick={() => setEditMode(true)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => onDelete(element.id)}>
                Delete
              </button>
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="detail-relationships">
            {elementRelationships.length === 0 ? (
              <div className="empty-relationships">
                <p>No relationships yet</p>
                <p className="hint">Link this element to others to build your architecture</p>
              </div>
            ) : (
              <div className="relationship-list">
                {elementRelationships.map(rel => {
                  const isSource = rel.source_id === element.id;
                  const otherId = isSource ? rel.target_id : rel.source_id;
                  const other = elements.find(e => e.id === otherId);
                  const relDef = EA_RELATIONSHIPS[rel.relationship_type];

                  return (
                    <div key={rel.id} className="relationship-item">
                      <span className="rel-direction">{isSource ? '→' : '←'}</span>
                      <span className="rel-type" style={{ color: relDef?.color }}>
                        {relDef?.name || rel.relationship_type}
                      </span>
                      <span className="rel-target">{other?.name || 'Unknown'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="detail-impact">
            <div className="impact-header">
              <h4>What would be affected if this changes?</h4>
              <p className="hint">Showing elements up to 2 levels away</p>
            </div>

            {impactAnalysis.length === 0 ? (
              <div className="empty-impact">
                <p>No connected elements found</p>
              </div>
            ) : (
              <div className="impact-list">
                {impactAnalysis.map(({ element: impEl, depth, relationship }) => {
                  const impConcept = EA_CONCEPTS[impEl.element_type];
                  return (
                    <div
                      key={impEl.id}
                      className="impact-item"
                      style={{ marginLeft: depth * 16 }}
                    >
                      <span className="impact-depth">L{depth}</span>
                      <span className="impact-icon">{impConcept?.icon}</span>
                      <span className="impact-name">{impEl.name}</span>
                      <span className="impact-type">{impConcept?.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ MAIN WORKSPACE ============
export default function GuidedEAWorkspace() {
  const {
    elements,
    relationships,
    loading,
    activeViewpoint,
    setActiveViewpoint,
    getElementsByViewpoint,
    deleteElement,
  } = useEA();

  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showNav, setShowNav] = useState(true);

  const currentViewpoint = EA_VIEWPOINTS[activeViewpoint];
  const viewpointElements = useMemo(() => {
    return getElementsByViewpoint(activeViewpoint);
  }, [activeViewpoint, getElementsByViewpoint]);

  const handleStartCreate = (type) => {
    setCreateType(type);
    setShowCreateWizard(true);
  };

  const handleCreateComplete = (newElement) => {
    setShowCreateWizard(false);
    setCreateType(null);
    setSelectedElement(newElement);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this element and all its relationships?')) {
      await deleteElement(id);
      if (selectedElement?.id === id) {
        setSelectedElement(null);
      }
    }
  };

  // Group elements by type for the current viewpoint
  const groupedElements = useMemo(() => {
    const groups = {};
    viewpointElements.forEach(el => {
      if (!groups[el.element_type]) {
        groups[el.element_type] = [];
      }
      groups[el.element_type].push(el);
    });
    return groups;
  }, [viewpointElements]);

  if (loading) {
    return (
      <div className="ea-workspace-loading">
        <div className="loading-spinner" />
        <p>Loading architecture...</p>
      </div>
    );
  }

  return (
    <div className="guided-ea-workspace">
      {/* Left Navigation */}
      {showNav && (
        <aside className="ea-sidebar">
          <ViewpointNavigator
            activeViewpoint={activeViewpoint}
            onViewpointChange={setActiveViewpoint}
          />

          <div className="sidebar-divider" />

          <div className="create-section">
            <h4>Add Elements</h4>
            <p className="create-hint">What do you want to capture?</p>
            <div className="create-buttons">
              {currentViewpoint?.primaryTypes
                .filter(t => t !== 'All')
                .map(type => {
                  const concept = EA_CONCEPTS[type];
                  return concept && (
                    <button
                      key={type}
                      className="create-btn"
                      onClick={() => handleStartCreate(type)}
                      style={{ '--btn-color': concept.color }}
                    >
                      <span className="create-icon">{concept.icon}</span>
                      <span>{concept.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="ea-main">
        <div className="ea-header">
          <button
            className="nav-toggle"
            onClick={() => setShowNav(!showNav)}
          >
            {showNav ? '◀' : '▶'}
          </button>
          <div className="viewpoint-badge" style={{ background: currentViewpoint?.color }}>
            <ViewpointIcon viewpoint={activeViewpoint} />
            <span>{currentViewpoint?.name}</span>
          </div>
          <h1>{currentViewpoint?.question}</h1>
          <span className="element-count">{viewpointElements.length} elements</span>
        </div>

        {viewpointElements.length === 0 ? (
          <div className="ea-empty-state">
            <div className="empty-icon">{currentViewpoint?.primaryTypes[0] !== 'All'
              ? EA_CONCEPTS[currentViewpoint?.primaryTypes[0]]?.icon
              : '📋'}</div>
            <h2>No elements yet</h2>
            <p>Start building your architecture by creating your first element.</p>
            <div className="empty-actions">
              {currentViewpoint?.primaryTypes
                .filter(t => t !== 'All')
                .slice(0, 2)
                .map(type => {
                  const concept = EA_CONCEPTS[type];
                  return concept && (
                    <button
                      key={type}
                      className="btn btn-primary"
                      onClick={() => handleStartCreate(type)}
                    >
                      Create {concept.name}
                    </button>
                  );
                })}
            </div>

            {/* Learning callout */}
            <div className="learning-callout">
              <h4>Not sure where to start?</h4>
              <p>{currentViewpoint?.description}</p>
            </div>
          </div>
        ) : (
          <div className="ea-elements-grid">
            {Object.entries(groupedElements).map(([type, typeElements]) => {
              const concept = EA_CONCEPTS[type];
              return (
                <div key={type} className="element-group">
                  <div className="group-header">
                    <span className="group-icon" style={{ background: concept?.color }}>
                      {concept?.icon}
                    </span>
                    <h3>{concept?.name}s</h3>
                    <span className="group-count">{typeElements.length}</span>
                    <button
                      className="group-add"
                      onClick={() => handleStartCreate(type)}
                    >
                      + Add
                    </button>
                  </div>
                  <div className="element-cards">
                    {typeElements.map(el => (
                      <ElementCard
                        key={el.id}
                        element={el}
                        onClick={setSelectedElement}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Panel */}
      {selectedElement && (
        <ElementDetailPanel
          element={selectedElement}
          onClose={() => setSelectedElement(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Create Wizard Modal */}
      {showCreateWizard && createType && (
        <GuidedCreationWizard
          type={createType}
          onComplete={handleCreateComplete}
          onCancel={() => { setShowCreateWizard(false); setCreateType(null); }}
        />
      )}
    </div>
  );
}
