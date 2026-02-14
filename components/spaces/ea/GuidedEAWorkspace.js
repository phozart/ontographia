// components/ea/GuidedEAWorkspace.js
// Learning-first EA workspace with guided creation and viewpoint navigation
// Enhanced with 5-step wizard, comprehensive ArchiMate 3.2 support, and EA views

import { useState, useMemo, useCallback } from 'react';
import styles from './ea.module.css';

// MUI Icons for top bar
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import {
  useEA,
  EA_CONCEPTS,
  EA_RELATIONSHIPS,
  EA_VIEWPOINTS,
  EA_LEARNING,
  validateElement,
  // New comprehensive type system
  EA_LAYERS,
  EA_ELEMENT_TYPES,
  EA_ELEMENT_TYPE_MAP,
  EA_RELATIONSHIP_TYPES,
  TOGAF_ADM_PHASES,
  ARCHIMATE_VIEWPOINTS,
  getElementTypeDefinition,
  getAllElementTypes,
  getElementTypesByLayer,
  getElementGuidance
} from './EAContext';

// Import EA Views
import {
  CapabilityHeatmap,
  ApplicationPortfolio,
  IntegrationMap,
  TechnologyStack,
  ValueStreamMap,
  GapAnalysis,
  Roadmap,
  TraceabilityMatrix,
  LayeredView,
  OrganizationCapabilityView,
  // ADR components
  ADRList,
  ADRDetail,
  ADRForm,
  // Cross-Space components
  CrossSpaceView,
  // EA-PDS Integration
  EAProjectsView,
  EA_VIEWS,
  EA_VIEW_CATEGORIES
} from './views';

// Import Help components
import HelpPanel from './HelpPanel';
import { FloatingHelpButton, DidYouKnow } from './GuidanceTooltips';

// Import EA Navigator
import EANavigator, { VIEWPOINTS } from './EANavigator';

// Import Guidance Panel
import EAGuidancePanel from './EAGuidancePanel';

// Import shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '@/components/ui';
import { ViewHeader } from '@/components/ui';
import { Button } from '@/components/ui';

// Import Wizard
import EAImportWizard from './EAImportWizard';

// Layer icons mapping
const LAYER_ICONS = {
  motivation: '💡',
  strategy: '🎯',
  business: '👔',
  application: '💻',
  technology: '🖥️',
  physical: '🏭',
  implementation: '🚀'
};

// Icons (using emoji for simplicity - replace with MUI icons if preferred)
const ViewpointIcon = ({ viewpoint }) => {
  const icons = {
    capability: '🎯',
    process: '⚙️',
    application: '💻',
    information: '📊',
    impact: '💥',
    // ArchiMate viewpoints
    capabilityMap: '🎯',
    valueStream: '📈',
    organizationalMap: '👥',
    processFlow: '⚙️',
    applicationLandscape: '💻',
    integrationMap: '🔌',
    technologyStack: '🖥️',
    deploymentView: '☁️',
    roadmapView: '🗺️',
    motivationView: '💡'
  };
  return <span className="viewpoint-icon">{icons[viewpoint] || '📋'}</span>;
};

// ============ GUIDED CREATION WIZARD (5-Step Enhanced) ============
function GuidedCreationWizard({ type, onComplete, onCancel, useArchiMateType = false }) {
  const { createElement, elements, relationships, getSuggestedConnections } = useEA();

  // Support both legacy EA_CONCEPTS and new ArchiMate types
  const typeDef = useMemo(() => {
    if (useArchiMateType) {
      return EA_ELEMENT_TYPE_MAP[type];
    }
    // Check ArchiMate first, then legacy
    return EA_ELEMENT_TYPE_MAP[type] || EA_CONCEPTS[type];
  }, [type, useArchiMateType]);

  const isArchiMateType = !!EA_ELEMENT_TYPE_MAP[type];

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [showTips, setShowTips] = useState(true);
  const [selectedRelationships, setSelectedRelationships] = useState([]);
  const [createdElement, setCreatedElement] = useState(null);

  if (!typeDef) return null;

  // Get guidance from either source
  const guidance = isArchiMateType ? typeDef.guidance : {
    whenToUse: typeDef.tips || [],
    antiPatterns: typeDef.antiPatterns || [],
    examples: { good: typeDef.examples || [], bad: [] }
  };

  // Get fields from either source
  const fields = isArchiMateType
    ? Object.entries(typeDef.fields || {}).map(([id, def]) => ({
        id,
        label: def.helpText ? `${id.charAt(0).toUpperCase() + id.slice(1)}` : id,
        type: def.type === 'textarea' ? 'textarea' : (def.type === 'select' ? 'select' : 'text'),
        required: def.required,
        options: def.options,
        helpText: def.helpText
      }))
    : typeDef.fields || [];

  // 5-step wizard
  const steps = [
    { id: 'context', title: 'Context', icon: '🎯' },
    { id: 'learn', title: 'Learn', icon: '📚' },
    { id: 'define', title: 'Define', icon: '✏️' },
    { id: 'connect', title: 'Connect', icon: '🔗' },
    { id: 'review', title: 'Review', icon: '✓' },
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
      setCreatedElement(result);
      // Optionally create relationships
      // Note: relationship creation would happen here if user selected any
      onComplete(result);
    }
  };

  const validation = useMemo(() => {
    if (!formData.name) return { warnings: [], suggestions: [] };
    return validateElement({ ...formData, element_type: type }, elements, relationships);
  }, [formData, type, elements, relationships]);

  // Get suggested elements to connect
  const suggestedConnections = useMemo(() => {
    if (step !== 3) return [];
    // Get elements that could be related based on type
    return elements.filter(e => {
      if (isArchiMateType) {
        const eType = EA_ELEMENT_TYPE_MAP[e.element_type];
        const thisType = EA_ELEMENT_TYPE_MAP[type];
        if (!eType || !thisType) return false;
        // Suggest cross-layer connections
        return eType.layer !== thisType.layer;
      }
      return e.element_type !== type;
    }).slice(0, 6);
  }, [step, elements, type, isArchiMateType]);

  // Get color based on type source
  const typeColor = isArchiMateType ? typeDef.color : typeDef.color;
  const typeIcon = isArchiMateType ? LAYER_ICONS[typeDef.layer] || '📋' : typeDef.icon;
  const typeName = typeDef.name;

  return (
    <div className="guided-wizard-overlay">
      <div className="guided-wizard guided-wizard--five-step">
        <div className="wizard-header">
          <span className="wizard-icon" style={{ background: typeColor }}>{typeIcon}</span>
          <div className="wizard-header-text">
            <h2>Create {typeName}</h2>
            {isArchiMateType && (
              <span className="wizard-layer-badge" style={{ background: typeColor }}>
                {typeDef.layer.toUpperCase()} LAYER
              </span>
            )}
            <p className="wizard-question">
              {isArchiMateType ? typeDef.description : typeDef.question}
            </p>
          </div>
          <button className="wizard-close" onClick={onCancel}>×</button>
        </div>

        {/* Progress Steps - 5 steps */}
        <div className="wizard-steps wizard-steps--five">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              className={`wizard-step ${idx === step ? 'active' : ''} ${idx < step ? 'completed' : ''}`}
              onClick={() => idx <= step && setStep(idx)}
              disabled={idx > step}
            >
              <span className="step-icon">{s.icon}</span>
              <span className="step-title">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="wizard-body">
          {/* Step 0: Context Selection */}
          {step === 0 && (
            <div className="wizard-step-content">
              <div className="context-section">
                <h3>What are you trying to document?</h3>
                <p className="context-intro">
                  You've selected to create a <strong>{typeName}</strong>.
                  Let's make sure this is the right choice.
                </p>

                {isArchiMateType && (
                  <div className="context-info-box">
                    <div className="context-layer">
                      <span className="layer-icon">{LAYER_ICONS[typeDef.layer]}</span>
                      <div>
                        <strong>{EA_LAYERS[typeDef.layer]?.name} Layer</strong>
                        <p>{EA_LAYERS[typeDef.layer]?.description}</p>
                      </div>
                    </div>

                    {typeDef.category && (
                      <div className="context-category">
                        <span>Category:</span>
                        <strong>{typeDef.category}</strong>
                      </div>
                    )}

                    {guidance.togafPhase && (
                      <div className="context-togaf">
                        <span>TOGAF Phase:</span>
                        <strong>{guidance.togafPhase}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="context-question-box">
                  <h4>Is this the right element type?</h4>
                  {guidance.whenToUse && guidance.whenToUse.length > 0 && (
                    <div className="when-to-use">
                      <span className="label">✓ Use {typeName} when:</span>
                      <ul>
                        {(guidance.whenToUse || []).slice(0, 4).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {guidance.whenNotToUse && guidance.whenNotToUse.length > 0 && (
                    <div className="when-not-to-use">
                      <span className="label">✗ Don't use {typeName} when:</span>
                      <ul>
                        {guidance.whenNotToUse.slice(0, 3).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Learning */}
          {step === 1 && (
            <div className="wizard-step-content">
              <div className="learning-section">
                <h3>Understanding {typeName}</h3>
                <p className="concept-description">
                  {typeDef.description}
                </p>

                {/* Examples - Good vs Bad */}
                <div className="examples-comparison">
                  <div className="examples-box examples-good">
                    <h4>✓ Good Examples</h4>
                    <ul>
                      {(isArchiMateType ? guidance.examples?.good : typeDef.examples || [])
                        ?.slice(0, 4).map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                    </ul>
                  </div>

                  {isArchiMateType && guidance.examples?.bad?.length > 0 && (
                    <div className="examples-box examples-bad">
                      <h4>✗ Avoid These</h4>
                      <ul>
                        {guidance.examples.bad.slice(0, 4).map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Best Practices */}
                {guidance.bestPractices && guidance.bestPractices.length > 0 && (
                  <div className="tips-box">
                    <h4>💡 Best Practices</h4>
                    <ul>
                      {guidance.bestPractices.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Anti-patterns */}
                {guidance.antiPatterns && guidance.antiPatterns.length > 0 && (
                  <div className="antipattern-box">
                    <h4>⚠️ Common Mistakes to Avoid</h4>
                    {guidance.antiPatterns.map((ap, i) => (
                      <div key={i} className="antipattern">
                        <span className="antipattern-bad">❌ {ap.pattern}</span>
                        <span className="antipattern-fix">✓ {ap.fix}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Did You Know */}
                {isArchiMateType && (
                  <div className="did-you-know">
                    <h4>📖 Did You Know?</h4>
                    <p>
                      The <strong>{typeName}</strong> is part of the ArchiMate 3.2 specification's
                      {' '}<em>{typeDef.layer}</em> layer. Elements in this layer
                      {typeDef.layer === 'business' && ' describe how the organization operates.'}
                      {typeDef.layer === 'application' && ' describe the software systems that support the business.'}
                      {typeDef.layer === 'technology' && ' describe the infrastructure that hosts applications.'}
                      {typeDef.layer === 'motivation' && ' capture the reasons behind architecture decisions.'}
                      {typeDef.layer === 'strategy' && ' define strategic direction and capabilities.'}
                      {typeDef.layer === 'implementation' && ' plan the transition from current to target state.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Define (Form with field-level help) */}
          {step === 2 && (
            <div className="wizard-step-content wizard-step-form">
              <div className="form-section">
                <h3>Define Your {typeName}</h3>

                {fields.map(field => (
                  <div key={field.id} className="form-field">
                    <label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>

                    {field.helpText && (
                      <span className="field-help">{field.helpText}</span>
                    )}

                    {field.type === 'text' && (
                      <input
                        type="text"
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.helpText || `Enter ${field.label.toLowerCase()}...`}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.helpText || `Enter ${field.label.toLowerCase()}...`}
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
                        {(field.options || []).map(opt => (
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

              {/* Side tips panel */}
              {showTips && (
                <div className="side-tips">
                  <div className="side-tips-header">
                    <span>💡 Quick Tips</span>
                    <button onClick={() => setShowTips(false)}>×</button>
                  </div>
                  <ul>
                    {(isArchiMateType
                      ? guidance.bestPractices?.slice(0, 3)
                      : typeDef.tips?.slice(0, 3)
                    )?.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Connect (Relationship Suggestions) */}
          {step === 3 && (
            <div className="wizard-step-content">
              <div className="connect-section">
                <h3>Connect Your {typeName}</h3>
                <p className="connect-intro">
                  Architecture elements are more valuable when connected. Consider linking
                  this {typeName} to related elements.
                </p>

                {suggestedConnections.length > 0 ? (
                  <>
                    <div className="connect-suggestions">
                      <h4>Suggested Connections</h4>
                      <div className="connection-grid">
                        {suggestedConnections.map(el => {
                          const elType = EA_ELEMENT_TYPE_MAP[el.element_type] || EA_CONCEPTS[el.element_type];
                          const isSelected = selectedRelationships.some(r => r.targetId === el.id);

                          return (
                            <div
                              key={el.id}
                              className={`connection-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedRelationships(prev =>
                                    prev.filter(r => r.targetId !== el.id)
                                  );
                                } else {
                                  setSelectedRelationships(prev => [
                                    ...prev,
                                    { targetId: el.id, type: 'serving' }
                                  ]);
                                }
                              }}
                            >
                              <span className="connection-icon">
                                {elType?.icon || LAYER_ICONS[elType?.layer] || '📋'}
                              </span>
                              <div className="connection-info">
                                <span className="connection-name">{el.name}</span>
                                <span className="connection-type">{elType?.name}</span>
                              </div>
                              {isSelected && <span className="connection-check">✓</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedRelationships.length > 0 && (
                      <div className="selected-relationships">
                        <h4>Selected Connections ({selectedRelationships.length})</h4>
                        <p className="hint">
                          These relationships will be created after the element is saved.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-connections">
                    <p>No existing elements found to connect to.</p>
                    <p className="hint">You can add relationships later from the element detail view.</p>
                  </div>
                )}

                <div className="skip-connect">
                  <p>
                    <strong>Tip:</strong> You can skip this step and add relationships later.
                    Relationships help with impact analysis and understanding dependencies.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Learn */}
          {step === 4 && (
            <div className="wizard-step-content">
              <div className="review-section">
                <h3>Review Your {typeName}</h3>

                <div className="review-card" style={{ borderColor: typeColor }}>
                  <div className="review-card-header" style={{ background: typeColor }}>
                    <span className="review-icon">{typeIcon}</span>
                    <div>
                      <span className="review-type">{typeName}</span>
                      {isArchiMateType && (
                        <span className="review-layer">{typeDef.layer} layer</span>
                      )}
                    </div>
                  </div>
                  <div className="review-card-body">
                    {fields.map(field => (
                      formData[field.id] && (
                        <div key={field.id} className="review-field">
                          <span className="review-label">{field.label}</span>
                          <span className="review-value">{formData[field.id]}</span>
                        </div>
                      )
                    ))}

                    {selectedRelationships.length > 0 && (
                      <div className="review-relationships">
                        <span className="review-label">Connections</span>
                        <span className="review-value">
                          {selectedRelationships.length} relationship(s) to be created
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {validation.suggestions.length > 0 && (
                  <div className="suggestions-box">
                    <h4>💡 Suggestions</h4>
                    {validation.suggestions.map((s, i) => (
                      <div key={i} className="suggestion-item">
                        <span>→</span>
                        <span>{s.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next Steps Guidance */}
                <div className="next-steps-box">
                  <h4>📋 What's Next?</h4>
                  <p>After creating this element, consider:</p>
                  <ul>
                    <li>Adding more relationships to build your architecture graph</li>
                    <li>Viewing this element in different viewpoints</li>
                    {isArchiMateType && typeDef.layer === 'business' && (
                      <li>Mapping supporting applications to this business element</li>
                    )}
                    {isArchiMateType && typeDef.layer === 'application' && (
                      <li>Documenting the technology platform that hosts this application</li>
                    )}
                    <li>Running impact analysis to understand dependencies</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="wizard-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <div className="wizard-nav">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}
            {step < steps.length - 1 && (
              <button
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={step === 2 && !formData.name}
              >
                Next →
              </button>
            )}
            {step === steps.length - 1 && (
              <button
                className="btn btn-primary btn-create"
                onClick={handleCreate}
                disabled={!formData.name}
              >
                ✓ Create {typeName}
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

// Linked module colors and labels
const LINKED_MODULE_INFO = {
  capabilities: { color: '#6366f1', label: 'Capabilities', icon: '🎯' },
  services: { color: '#3b82f6', label: 'Services', icon: '⚙️' },
  projects: { color: '#10b981', label: 'Projects', icon: '📁' }
};

// ============ ELEMENT CARD ============
function ElementCard({ element, onClick, onDelete, showRelationships = false }) {
  // Support both legacy EA_CONCEPTS and new ArchiMate types
  const typeDef = EA_ELEMENT_TYPE_MAP[element.element_type] || EA_CONCEPTS[element.element_type];
  const isArchiMateType = !!EA_ELEMENT_TYPE_MAP[element.element_type];
  const { getRelatedElements } = useEA();

  const relatedCount = useMemo(() => {
    return getRelatedElements(element.id).length;
  }, [element.id, getRelatedElements]);

  // Check if element is linked (imported from another module)
  const isLinked = element.properties?.linkedArtefactId;
  const linkedModule = element.properties?.linkedModule;
  const linkedInfo = linkedModule ? LINKED_MODULE_INFO[linkedModule] : null;

  if (!typeDef) return null;

  const typeColor = typeDef.color;
  const typeIcon = isArchiMateType ? LAYER_ICONS[typeDef.layer] || '📋' : typeDef.icon;
  const typeName = typeDef.name;

  return (
    <div
      className={`${styles.elementCard} ${isLinked ? styles.linkedElement : ''}`}
      style={{ '--card-color': typeColor }}
      onClick={() => onClick?.(element)}
    >
      <div className={styles.elementCardHeader}>
        <span className={styles.elementIcon}>{typeIcon}</span>
        <span className={styles.elementType}>{typeName}</span>
        {isArchiMateType && (
          <span className={styles.elementLayerBadge} style={{ background: typeColor }}>
            {typeDef.layer}
          </span>
        )}
        {isLinked && linkedInfo && (
          <span
            className={styles.linkedBadge}
            style={{ backgroundColor: `${linkedInfo.color}15`, color: linkedInfo.color }}
            title={`Linked from ${linkedInfo.label}`}
          >
            {linkedInfo.icon} {linkedInfo.label}
          </span>
        )}
        {onDelete && (
          <button
            className={styles.elementDelete}
            onClick={e => { e.stopPropagation(); onDelete(element.id); }}
          >
            ×
          </button>
        )}
      </div>
      <h4 className={styles.elementName}>{element.name}</h4>
      {element.description && (
        <p className={styles.elementDescription}>{element.description}</p>
      )}
      <div className={styles.elementFooter}>
        <span className={styles.elementRelations} title="Related elements">
          🔗 {relatedCount}
        </span>
        {element.properties?.maturityLevel && (
          <span className={styles.elementMaturity}>{element.properties.maturityLevel}</span>
        )}
        {element.properties?.maturity && (
          <span className={styles.elementMaturity}>{element.properties.maturity}</span>
        )}
        {isLinked && (
          <span className={styles.linkedIndicator} title="Linked element - synced with source">
            ↔
          </span>
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

  // Support both legacy EA_CONCEPTS and new ArchiMate types
  const typeDef = EA_ELEMENT_TYPE_MAP[element?.element_type] || EA_CONCEPTS[element?.element_type];
  const isArchiMateType = !!EA_ELEMENT_TYPE_MAP[element?.element_type];
  const guidance = isArchiMateType ? typeDef?.guidance : null;

  const elementRelationships = useMemo(() => {
    return relationships.filter(r => r.source_id === element?.id || r.target_id === element?.id);
  }, [relationships, element?.id]);

  const impactAnalysis = useMemo(() => {
    if (!element) return [];
    return getImpactAnalysis(element.id, 2);
  }, [element, getImpactAnalysis]);

  if (!element || !typeDef) return null;

  const typeColor = typeDef.color;
  const typeIcon = isArchiMateType ? LAYER_ICONS[typeDef.layer] || '📋' : typeDef.icon;
  const typeName = typeDef.name;

  // Get fields from either source
  const fields = isArchiMateType
    ? Object.entries(typeDef.fields || {}).map(([id, def]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1'),
        type: def.type || 'text',
        helpText: def.helpText
      }))
    : typeDef.fields || [];

  return (
    <div className="element-detail-panel">
      <div className="detail-header" style={{ background: typeColor }}>
        <span className="detail-icon">{typeIcon}</span>
        <div className="detail-header-text">
          <span className="detail-type">{typeName}</span>
          {isArchiMateType && (
            <span className="detail-layer">{typeDef.layer} layer</span>
          )}
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
        {guidance && (
          <button
            className={activeTab === 'guidance' ? 'active' : ''}
            onClick={() => setActiveTab('guidance')}
          >
            Guidance
          </button>
        )}
      </div>

      <div className="detail-content">
        {activeTab === 'details' && (
          <div className="detail-fields">
            {fields.map(field => (
              <div key={field.id} className="detail-field">
                <label>{field.label}</label>
                <span>{element.properties?.[field.id] || element[field.id] || '-'}</span>
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
                  const impTypeDef = EA_ELEMENT_TYPE_MAP[impEl.element_type] || EA_CONCEPTS[impEl.element_type];
                  const impIsArchiMate = !!EA_ELEMENT_TYPE_MAP[impEl.element_type];
                  return (
                    <div
                      key={impEl.id}
                      className="impact-item"
                      style={{ marginLeft: depth * 16 }}
                    >
                      <span className="impact-depth">L{depth}</span>
                      <span className="impact-icon">
                        {impIsArchiMate ? LAYER_ICONS[impTypeDef?.layer] : impTypeDef?.icon}
                      </span>
                      <span className="impact-name">{impEl.name}</span>
                      <span className="impact-type">{impTypeDef?.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'guidance' && guidance && (
          <div className="detail-guidance">
            <h4>Guidance for {typeName}</h4>

            {guidance.whenToUse && (
              <div className="guidance-section">
                <h5>✓ When to Use</h5>
                <ul>
                  {guidance.whenToUse.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.whenNotToUse && (
              <div className="guidance-section">
                <h5>✗ When NOT to Use</h5>
                <ul>
                  {guidance.whenNotToUse.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.bestPractices && (
              <div className="guidance-section">
                <h5>💡 Best Practices</h5>
                <ul>
                  {guidance.bestPractices.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.antiPatterns && guidance.antiPatterns.length > 0 && (
              <div className="guidance-section">
                <h5>⚠️ Common Mistakes</h5>
                {guidance.antiPatterns.map((ap, i) => (
                  <div key={i} className="antipattern-item">
                    <span className="bad">❌ {ap.pattern}</span>
                    <span className="fix">✓ {ap.fix}</span>
                  </div>
                ))}
              </div>
            )}

            {guidance.togafPhase && (
              <div className="guidance-section">
                <h5>📋 TOGAF Phase</h5>
                <p>{guidance.togafPhase}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ ARCHIMATE LAYER BROWSER ============
function ArchiMateLayerBrowser({ onSelectType, selectedLayer, onLayerChange }) {
  const [expandedLayer, setExpandedLayer] = useState(selectedLayer || 'business');

  const layerOrder = ['motivation', 'strategy', 'business', 'application', 'technology', 'physical', 'implementation'];

  return (
    <div className={styles.archiBrowser}>
      <h4>ArchiMate Elements</h4>
      <p className={styles.browserHint}>Browse all 56 element types by layer</p>

      <div className={styles.layerList}>
        {layerOrder.map(layerId => {
          const layer = EA_LAYERS[layerId];
          const layerTypes = EA_ELEMENT_TYPES.filter(t => t.layer === layerId);
          const isExpanded = expandedLayer === layerId;

          return (
            <div key={layerId} className={styles.layerSection}>
              <button
                className={`${styles.layerHeader} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => setExpandedLayer(isExpanded ? null : layerId)}
                style={{ '--layer-color': layer.color }}
              >
                <span className={styles.layerHeaderIcon}>{LAYER_ICONS[layerId]}</span>
                <span className={styles.layerName}>{layer.name}</span>
                <span className={styles.layerCount}>{layerTypes.length}</span>
                <span className={styles.layerExpand}>{isExpanded ? '▼' : '▶'}</span>
              </button>

              {isExpanded && (
                <div className={styles.layerTypes}>
                  {layerTypes.map(type => (
                    <button
                      key={type.id}
                      className={styles.typeBtn}
                      onClick={() => onSelectType(type.id)}
                      title={type.description}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ VIEW COMPONENTS MAP ============
const VIEW_COMPONENTS = {
  'layered-view': LayeredView,
  'organization-capability': OrganizationCapabilityView,
  'capability-heatmap': CapabilityHeatmap,
  'application-portfolio': ApplicationPortfolio,
  'integration-map': IntegrationMap,
  'technology-stack': TechnologyStack,
  'value-stream-map': ValueStreamMap,
  'gap-analysis': GapAnalysis,
  'roadmap': Roadmap,
  'traceability-matrix': TraceabilityMatrix,
  'adrs': ADRList,
  'cross-space': CrossSpaceView,
  'pds-projects': EAProjectsView,
};

// ============ VIEW NAVIGATION ============
function ViewNavigator({ activeView, onViewChange, onBackToElements }) {
  return (
    <div className="view-navigator">
      <div className="view-nav-header">
        <button className="back-to-elements" onClick={onBackToElements}>
          ← Elements
        </button>
        <h3>Architecture Views</h3>
      </div>

      <div className="view-categories">
        {Object.entries(EA_VIEW_CATEGORIES).map(([category, views]) => (
          views.length > 0 && (
            <div key={category} className="view-category">
              <h4>{category}</h4>
              <div className="view-list">
                {views.map(view => (
                  <button
                    key={view.id}
                    className={`view-btn ${activeView === view.id ? 'active' : ''}`}
                    onClick={() => onViewChange(view.id)}
                  >
                    <span className="view-icon">{view.icon}</span>
                    <div className="view-info">
                      <span className="view-name">{view.name}</span>
                      <span className="view-desc">{view.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// ============ VIEW TOOLBAR ============
function ViewToolbar({ activeView, onViewChange, showViewNav, onToggleViewNav }) {
  const currentView = EA_VIEWS.find(v => v.id === activeView);

  return (
    <div className="view-toolbar">
      <button
        className="view-nav-toggle"
        onClick={onToggleViewNav}
        title={showViewNav ? 'Hide view navigation' : 'Show view navigation'}
      >
        {showViewNav ? '◀' : '▶'} Views
      </button>

      {currentView && (
        <div className="current-view-info">
          <span className="view-icon">{currentView.icon}</span>
          <span className="view-name">{currentView.name}</span>
        </div>
      )}

      <div className="view-quick-switch">
        {EA_VIEWS.slice(0, 4).map(view => (
          <button
            key={view.id}
            className={`quick-view-btn ${activeView === view.id ? 'active' : ''}`}
            onClick={() => onViewChange(view.id)}
            title={view.name}
          >
            {view.icon}
          </button>
        ))}
        <span className="more-views">+{EA_VIEWS.length - 4}</span>
      </div>
    </div>
  );
}

// Section labels for breadcrumbs
const SECTION_LABELS = {
  overview: 'Overview',
  viewpoint: 'Viewpoints',
  layer: 'Layers',
  view: 'Views',
  help: 'Help',
};

// ============ MAIN WORKSPACE ============
export default function GuidedEAWorkspace() {
  const {
    elements,
    relationships,
    loading,
    error,
    activeViewpoint,
    setActiveViewpoint,
    getElementsByViewpoint,
    deleteElement,
  } = useEA();

  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  // Navigation state
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'viewpoint', 'layer', 'view', 'help'
  const [activeViewpointId, setActiveViewpointId] = useState(null);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [activeViewId, setActiveViewId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [helpContext, setHelpContext] = useState(null);

  // Guidance panel state
  const [showGuidance, setShowGuidance] = useState(true);

  // Import wizard state
  const [showImportWizard, setShowImportWizard] = useState(false);

  // ADR (Architecture Decision Records) state
  const [selectedADR, setSelectedADR] = useState(null);
  const [showADRForm, setShowADRForm] = useState(false);
  const [editingADR, setEditingADR] = useState(null);

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

  // Navigation handler
  const handleNavigate = useCallback((section, id) => {
    setActiveSection(section);
    setSelectedElement(null);
    // Clear ADR selection when navigating away from ADRs view
    if (section !== 'view' || id !== 'adrs') {
      setSelectedADR(null);
    }

    switch (section) {
      case 'overview':
        setActiveViewpointId(null);
        setActiveLayerId(null);
        setActiveViewId(null);
        break;
      case 'viewpoint':
        setActiveViewpointId(id);
        setActiveLayerId(null);
        setActiveViewId(null);
        break;
      case 'layer':
        setActiveViewpointId(null);
        setActiveLayerId(id);
        setActiveViewId(null);
        break;
      case 'view':
        setActiveViewpointId(null);
        setActiveLayerId(null);
        setActiveViewId(id);
        break;
      case 'help':
        setShowHelp(true);
        break;
    }
  }, []);

  // Group all elements by type
  const groupedElements = useMemo(() => {
    const groups = {};
    elements.forEach(el => {
      if (!groups[el.element_type]) {
        groups[el.element_type] = [];
      }
      groups[el.element_type].push(el);
    });
    return groups;
  }, [elements]);

  // Filter elements based on active viewpoint or layer
  const filteredElements = useMemo(() => {
    if (activeViewpointId) {
      const viewpoint = VIEWPOINTS.find(v => v.id === activeViewpointId);
      if (viewpoint) {
        return elements.filter(e => viewpoint.types.includes(e.element_type));
      }
    }
    if (activeLayerId) {
      return elements.filter(e => {
        const typeDef = EA_ELEMENT_TYPE_MAP[e.element_type];
        return typeDef?.layer === activeLayerId;
      });
    }
    return elements;
  }, [elements, activeViewpointId, activeLayerId]);

  // ADR event handlers
  const handleCreateADR = useCallback(() => {
    setEditingADR(null);
    setShowADRForm(true);
  }, []);

  const handleSelectADR = useCallback((adr) => {
    setSelectedADR(adr);
  }, []);

  const handleEditADR = useCallback((adr) => {
    setEditingADR(adr);
    setShowADRForm(true);
  }, []);

  const handleADRFormSave = useCallback((savedADR) => {
    setShowADRForm(false);
    setEditingADR(null);
    // If we were on a detail view, update it
    if (selectedADR && savedADR.id === selectedADR.id) {
      setSelectedADR(savedADR);
    }
  }, [selectedADR]);

  const handleADRFormCancel = useCallback(() => {
    setShowADRForm(false);
    setEditingADR(null);
  }, []);

  const handleADRDelete = useCallback(() => {
    setSelectedADR(null);
  }, []);

  const handleADRBack = useCallback(() => {
    setSelectedADR(null);
  }, []);

  const handleNavigateToADR = useCallback((adr) => {
    setSelectedADR(adr);
  }, []);

  // Render the active view component
  const renderActiveView = () => {
    if (!activeViewId) return null;

    // Special handling for ADR views
    if (activeViewId === 'adrs') {
      // If viewing a specific ADR detail
      if (selectedADR) {
        return (
          <ADRDetail
            adrId={selectedADR.id}
            onBack={handleADRBack}
            onEdit={handleEditADR}
            onDelete={handleADRDelete}
            onNavigateToADR={handleNavigateToADR}
          />
        );
      }

      // Show ADR list with callbacks
      return (
        <ADRList
          onCreateADR={handleCreateADR}
          onSelectADR={handleSelectADR}
        />
      );
    }

    const ViewComponent = VIEW_COMPONENTS[activeViewId];
    if (!ViewComponent) return <div>View not found: {activeViewId}</div>;
    return <ViewComponent />;
  };

  // Get current context label for breadcrumbs
  const getCurrentContextLabel = useCallback(() => {
    if (activeSection === 'viewpoint' && activeViewpointId) {
      const viewpoint = VIEWPOINTS.find(v => v.id === activeViewpointId);
      return viewpoint?.label || activeViewpointId;
    }
    if (activeSection === 'layer' && activeLayerId) {
      const layer = EA_LAYERS[activeLayerId];
      return layer?.name || activeLayerId;
    }
    if (activeSection === 'view' && activeViewId) {
      const view = EA_VIEWS.find(v => v.id === activeViewId);
      return view?.name || activeViewId;
    }
    return null;
  }, [activeSection, activeViewpointId, activeLayerId, activeViewId]);

  // Build breadcrumbs
  const breadcrumbsContent = activeSection !== 'overview' ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Overview"
        onClick={() => handleNavigate('overview')}
      />
      <BreadcrumbSeparator />
      <Breadcrumb label={SECTION_LABELS[activeSection]} />
      {getCurrentContextLabel() && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={getCurrentContextLabel()} active />
        </>
      )}
    </Breadcrumbs>
  ) : null;

  // Render main content
  const renderMainContent = () => (
    <div className={styles.mainContent}>
      {/* Loading overlay */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>Loading architecture...</p>
        </div>
      )}

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className={styles.overview}>
          <ViewHeader
            icon={AccountTreeIcon}
            iconColor="#6366f1"
            title="Enterprise Architecture"
            count={elements.length}
            description="Model your business, applications, and technology architecture"
            createLabel="Add Element"
            onCreate={() => handleStartCreate('businessCapability')}
            actions={
              <Button variant="secondary" onClick={() => setShowImportWizard(true)}>
                <ImportExportIcon fontSize="small" />
                <span>Import</span>
              </Button>
            }
          />

          <div className={styles.overviewContent}>
            {elements.length === 0 ? (
              /* Getting Started Guide for new users */
              <div className={styles.gettingStarted}>
                <h2>Getting Started with ArchiMate</h2>
                <p className={styles.introText}>
                  ArchiMate is a modeling language for enterprise architecture. It helps you describe,
                  analyze, and visualize how your organization works across three main layers.
                </p>

                <div className={styles.layerGuide}>
                  <div className={styles.layerGuideItem} onClick={() => handleStartCreate('businessCapability')}>
                    <div className={styles.layerGuideIcon} style={{ background: '#f59e0b' }}>👔</div>
                    <div className={styles.layerGuideContent}>
                      <h3>1. Business Layer</h3>
                      <p>Start here! Define what your organization does.</p>
                      <ul>
                        <li><strong>Business Capabilities</strong> - What can your organization do?</li>
                        <li><strong>Business Processes</strong> - How does work get done?</li>
                        <li><strong>Business Actors</strong> - Who performs the work?</li>
                      </ul>
                      <button className={styles.layerGuideBtn}>+ Add Business Element</button>
                    </div>
                  </div>

                  <div className={styles.layerGuideArrow}>↓</div>

                  <div className={styles.layerGuideItem} onClick={() => handleStartCreate('applicationComponent')}>
                    <div className={styles.layerGuideIcon} style={{ background: '#3b82f6' }}>💻</div>
                    <div className={styles.layerGuideContent}>
                      <h3>2. Application Layer</h3>
                      <p>Document the systems that support your business.</p>
                      <ul>
                        <li><strong>Application Components</strong> - What software systems exist?</li>
                        <li><strong>Application Services</strong> - What do these systems provide?</li>
                        <li><strong>Data Objects</strong> - What information is managed?</li>
                      </ul>
                      <button className={styles.layerGuideBtn}>+ Add Application Element</button>
                    </div>
                  </div>

                  <div className={styles.layerGuideArrow}>↓</div>

                  <div className={styles.layerGuideItem} onClick={() => handleStartCreate('technologyService')}>
                    <div className={styles.layerGuideIcon} style={{ background: '#10b981' }}>🖥️</div>
                    <div className={styles.layerGuideContent}>
                      <h3>3. Technology Layer</h3>
                      <p>Map the infrastructure that hosts your applications.</p>
                      <ul>
                        <li><strong>Technology Services</strong> - What infrastructure services exist?</li>
                        <li><strong>Nodes</strong> - What servers/devices run your systems?</li>
                        <li><strong>Networks</strong> - How are systems connected?</li>
                      </ul>
                      <button className={styles.layerGuideBtn}>+ Add Technology Element</button>
                    </div>
                  </div>
                </div>

                <div className={styles.tipBox}>
                  <h4>Pro Tip</h4>
                  <p>Start by documenting your most important business capability, then add the applications
                     that support it, and finally the technology that runs those applications. This top-down
                     approach helps you understand the full stack.</p>
                </div>
              </div>
            ) : (
              /* Dashboard for users with existing elements */
              <div className={styles.dashboard}>
                <div className={styles.dashboardStats}>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{elements.length}</span>
                    <span className={styles.statLabel}>Total Elements</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{relationships.length}</span>
                    <span className={styles.statLabel}>Relationships</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{Object.keys(groupedElements).length}</span>
                    <span className={styles.statLabel}>Element Types</span>
                  </div>
                </div>

                <div className={styles.tipBox} style={{ marginBottom: 24 }}>
                  <h4>Quick Tip</h4>
                  <p>Use the left navigation to browse by viewpoint (what questions you want to answer) or by architecture layer. Click on any viewpoint or layer to see and manage those elements.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Viewpoint Section - Shows filtered elements by viewpoint */}
      {activeSection === 'viewpoint' && activeViewpointId && (
        <div className={styles.section}>
          {(() => {
            const viewpoint = VIEWPOINTS.find(v => v.id === activeViewpointId);
            if (!viewpoint) return null;

            return (
              <>
                <ViewHeader
                  icon={viewpoint.icon}
                  iconColor={viewpoint.color}
                  title={viewpoint.label}
                  count={filteredElements.length}
                  description={viewpoint.description}
                  createLabel={`Add ${viewpoint.label.replace(/s$/, '')}`}
                  onCreate={() => handleStartCreate(viewpoint.types[0])}
                />

                <div className={styles.sectionContent}>
                  {filteredElements.length === 0 ? (
                    <div className={styles.emptyState} style={{ padding: 40 }}>
                      <h2>No {viewpoint.label} Yet</h2>
                      <p>Start by adding your first {viewpoint.label.toLowerCase()}.</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStartCreate(viewpoint.types[0])}
                      >
                        + Add {viewpoint.label.replace(/s$/, '')}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.elementCards}>
                      {filteredElements.map(el => (
                        <ElementCard
                          key={el.id}
                          element={el}
                          onClick={setSelectedElement}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Layer Section - Shows filtered elements by layer */}
      {activeSection === 'layer' && activeLayerId && (
        <div className={styles.section}>
          {(() => {
            const layer = EA_LAYERS[activeLayerId];
            if (!layer) return null;

            // Get available types for this layer
            const layerTypes = EA_ELEMENT_TYPES.filter(t => t.layer === activeLayerId);

            // Layer colors
            const layerColors = {
              motivation: '#a855f7',
              strategy: '#f59e0b',
              business: '#f97316',
              application: '#3b82f6',
              technology: '#10b981',
              physical: '#6b7280',
              implementation: '#ec4899'
            };
            const layerColor = layerColors[activeLayerId] || '#6366f1';

            // Create a simple icon component for the layer
            const LayerIconComponent = () => (
              <span style={{ fontSize: 16 }}>{LAYER_ICONS[activeLayerId]}</span>
            );

            return (
              <>
                <ViewHeader
                  icon={LayerIconComponent}
                  iconColor={layerColor}
                  title={layer.name}
                  count={filteredElements.length}
                  description={layer.description}
                  createLabel="Add Element"
                  onCreate={() => handleStartCreate(layerTypes[0]?.id || 'businessCapability')}
                />

                <div className={styles.sectionContent}>
                  {/* Quick add buttons for layer types */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {layerTypes.slice(0, 4).map(type => (
                      <button
                        key={type.id}
                        className={styles.layerGuideBtn}
                        onClick={() => handleStartCreate(type.id)}
                      >
                        + {type.name}
                      </button>
                    ))}
                  </div>

                  {filteredElements.length === 0 ? (
                    <div className={styles.emptyState} style={{ padding: 40 }}>
                      <h2>No {layer.name} Elements Yet</h2>
                      <p>Start by adding elements to the {layer.name.toLowerCase()}.</p>
                    </div>
                  ) : (
                    <div className={styles.elementCards}>
                      {filteredElements.map(el => (
                        <ElementCard
                          key={el.id}
                          element={el}
                          onClick={setSelectedElement}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* View Section - Shows architecture visualizations */}
      {activeSection === 'view' && activeViewId && (
        <div className={styles.viewContent}>
          {renderActiveView()}
        </div>
      )}

      {/* Element Detail Panel */}
      {selectedElement && (
        <ElementDetailPanel
          element={selectedElement}
          onClose={() => setSelectedElement(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Guidance Panel */}
      <EAGuidancePanel
        activeSection={activeSection}
        activeLayerId={activeLayerId}
        collapsed={!showGuidance}
        onToggleCollapse={() => setShowGuidance(!showGuidance)}
        onNavigate={(target) => {
          if (target === 'business' || target === 'application' || target === 'technology' ||
              target === 'motivation' || target === 'strategy' || target === 'implementation') {
            setActiveSection('layer');
            setActiveLayerId(target);
          } else if (target === 'relationships' || target === 'layers') {
            setShowHelp(true);
            setHelpContext(target);
          } else {
            handleStartCreate(target);
          }
        }}
      />

      {/* Floating Help Button */}
      <FloatingHelpButton onClick={() => setShowHelp(true)} />
    </div>
  );

  // Render modals
  const modalsContent = (
    <>
      {/* Create Wizard Modal */}
      {showCreateWizard && createType && (
        <GuidedCreationWizard
          type={createType}
          onComplete={handleCreateComplete}
          onCancel={() => { setShowCreateWizard(false); setCreateType(null); }}
        />
      )}

      {/* Help Panel */}
      <HelpPanel
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        context={helpContext}
      />

      {/* Import Wizard */}
      <EAImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
      />

      {/* ADR Form Modal */}
      {showADRForm && (
        <ADRForm
          adr={editingADR}
          onSave={handleADRFormSave}
          onCancel={handleADRFormCancel}
        />
      )}
    </>
  );

  return (
    <WorkspaceLayout
      navigator={
        <EANavigator
          activeSection={activeSection}
          activeViewpoint={activeViewpointId}
          activeLayer={activeLayerId}
          activeView={activeViewId}
          onNavigate={(section, id) => {
            if (section === 'import') {
              setShowImportWizard(true);
            } else {
              handleNavigate(section, id);
            }
          }}
          onCreateElement={() => handleStartCreate('businessCapability')}
        />
      }
      breadcrumbs={breadcrumbsContent}
      error={error}
      modals={modalsContent}
    >
      {renderMainContent()}
    </WorkspaceLayout>
  );
}
