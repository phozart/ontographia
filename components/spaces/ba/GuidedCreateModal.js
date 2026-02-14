// components/ba/GuidedCreateModal.js
// Learning-first creation wizard for BA artefacts
// Step 1: Learn what this artefact is (and what it's NOT)
// Step 2: Fill in the details with guidance
// Step 3: Review and create

import { useState, useMemo, useEffect } from 'react';
import { useArtefacts, ARTEFACT_TYPES, RELATIONSHIP_TYPES } from '../../ArtefactContext';
import { useProjects } from '../../ProjectContext';
import { useBA, BA_CONCEPTS } from './BAContext';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// ============ WIZARD STEP INDICATOR ============
function WizardSteps({ steps, currentStep, onStepClick }) {
  return (
    <div className="wizard-steps">
      {steps.map((step, idx) => (
        <button
          key={step.id}
          className={`wizard-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
          onClick={() => idx <= currentStep && onStepClick(idx)}
          disabled={idx > currentStep}
        >
          <span className="step-num">{idx < currentStep ? '✓' : idx + 1}</span>
          <span className="step-title">{step.title}</span>
        </button>
      ))}
    </div>
  );
}

// ============ STEP 1: LEARNING ============
function LearningStep({ concept, typeDef }) {
  if (!concept) return null;

  return (
    <div className="wizard-step-content learning-step">
      <div className="learning-header">
        <h3>What is a {typeDef?.name}?</h3>
        <p className="concept-question">{concept.question}</p>
      </div>

      <p className="concept-description">{concept.definition}</p>

      {/* Examples */}
      {concept.examples && concept.examples.length > 0 && (
        <div className="learning-box examples-box">
          <h4>Good Examples</h4>
          <ul>
            {concept.examples.map((ex, i) => (
              <li key={i}>
                <CheckCircleIcon fontSize="small" className="example-icon good" />
                {ex}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Anti-patterns - What NOT to do */}
      {concept.antiPatterns && concept.antiPatterns.length > 0 && (
        <div className="learning-box antipattern-box">
          <h4>Common Mistakes to Avoid</h4>
          {concept.antiPatterns.map((ap, i) => (
            <div key={i} className="antipattern">
              <div className="antipattern-bad">
                <WarningAmberIcon fontSize="small" />
                <span>{ap.bad}</span>
              </div>
              <div className="antipattern-why">
                <LightbulbOutlinedIcon fontSize="small" />
                <span>{ap.why}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {concept.validationHints && (
        <div className="learning-box tips-box">
          <h4>Key Questions to Ask Yourself</h4>
          <ul>
            {concept.validationHints.map((hint, i) => (
              <li key={i}>{hint.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="learning-footer">
        <p className="ready-prompt">Ready to create your {typeDef?.name}?</p>
      </div>
    </div>
  );
}

// ============ STEP 2: FORM FIELDS ============
function FieldsStep({
  concept,
  typeDef,
  formData,
  setFormData,
  artefacts,
  activeProject,
  type,
}) {
  // Auto-generate requirement ID
  useEffect(() => {
    if (type.includes('Requirement') && !formData.requirementId) {
      const prefix = type === 'BusinessRequirement' ? 'BR' :
                     type === 'StakeholderRequirement' ? 'SR' : 'SOL';
      const projectCode = activeProject?.code || activeProject?.name?.substring(0, 3).toUpperCase() || 'PRJ';
      const count = artefacts.filter(a => a.artefactType === type).length + 1;
      const newId = `${projectCode}-${prefix}-${String(count).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, requirementId: newId }));
    }
  }, [type, artefacts, formData.requirementId, activeProject, setFormData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="wizard-step-content fields-step">
      {/* Starter Prompt */}
      {concept?.starterPrompt && (
        <div className="starter-prompt">
          <LightbulbOutlinedIcon />
          <span>{concept.starterPrompt}</span>
        </div>
      )}

      {/* Requirement ID - Auto-generated, shown for requirements */}
      {type.includes('Requirement') && (
        <div className="form-field id-field">
          <label>
            Requirement ID
            <span className="auto-generated">Auto-generated</span>
          </label>
          <input
            type="text"
            value={formData.requirementId || ''}
            onChange={(e) => handleChange('requirementId', e.target.value)}
            className="id-input"
          />
          <p className="field-hint">You can customize this ID if needed</p>
        </div>
      )}

      {/* Name/Statement - Primary field */}
      <div className="form-field primary-field">
        <label>
          {type.includes('Requirement') ? 'Requirement Statement' : 'Name'}
          <span className="required">*</span>
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={concept?.shortHelp || `Enter ${typeDef?.name?.toLowerCase()}...`}
          autoFocus
          className="input-large"
        />

        {/* Quick Examples */}
        {concept?.examples && (
          <div className="quick-examples">
            <span className="examples-label">Try:</span>
            {concept.examples.slice(0, 2).map((ex, i) => (
              <button
                key={i}
                type="button"
                className="example-btn"
                onClick={() => handleChange('name', ex)}
              >
                {ex.length > 35 ? ex.slice(0, 35) + '...' : ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category for Solution Requirements */}
      {type === 'SolutionRequirement' && (
        <div className="form-field category-field">
          <label>Category <span className="required">*</span></label>
          <div className="category-toggle">
            <button
              type="button"
              className={`category-btn ${formData.solutionCategory === 'Functional' ? 'active' : ''}`}
              onClick={() => handleChange('solutionCategory', 'Functional')}
            >
              <span className="cat-label">Functional</span>
              <span className="cat-hint">What the system must DO</span>
            </button>
            <button
              type="button"
              className={`category-btn ${formData.solutionCategory === 'Non-Functional' ? 'active' : ''}`}
              onClick={() => handleChange('solutionCategory', 'Non-Functional')}
            >
              <span className="cat-label">Non-Functional</span>
              <span className="cat-hint">Quality attributes (performance, security...)</span>
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="form-field">
        <label>Description / Context</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Provide additional context or details..."
          rows={3}
        />
      </div>

      {/* Rationale - Important for requirements */}
      {type.includes('Requirement') && (
        <div className="form-field">
          <label>
            Rationale
            <span className="field-tip">Why is this needed?</span>
          </label>
          <textarea
            value={formData.rationale || ''}
            onChange={(e) => handleChange('rationale', e.target.value)}
            placeholder="Explain the business justification for this requirement..."
            rows={2}
          />
        </div>
      )}

      {/* Acceptance Criteria */}
      {type.includes('Requirement') && (
        <div className="form-field acceptance-field">
          <label>
            Acceptance Criteria
            <span className="field-tip">How will we know this is met?</span>
          </label>
          <div className="acceptance-list">
            {(formData.acceptanceCriteria || []).map((criterion, i) => (
              <div key={i} className="criterion-item">
                <CheckCircleIcon fontSize="small" className="criterion-icon" />
                <span>{criterion}</span>
                <button
                  type="button"
                  className="criterion-remove"
                  onClick={() => handleChange('acceptanceCriteria',
                    formData.acceptanceCriteria.filter((_, idx) => idx !== i)
                  )}
                >
                  ×
                </button>
              </div>
            ))}
            <div className="criterion-input">
              <input
                type="text"
                value={formData.newCriterion || ''}
                onChange={(e) => handleChange('newCriterion', e.target.value)}
                placeholder="Add acceptance criterion..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && formData.newCriterion?.trim()) {
                    e.preventDefault();
                    handleChange('acceptanceCriteria', [
                      ...(formData.acceptanceCriteria || []),
                      formData.newCriterion.trim(),
                    ]);
                    handleChange('newCriterion', '');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (formData.newCriterion?.trim()) {
                    handleChange('acceptanceCriteria', [
                      ...(formData.acceptanceCriteria || []),
                      formData.newCriterion.trim(),
                    ]);
                    handleChange('newCriterion', '');
                  }
                }}
                disabled={!formData.newCriterion?.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priority and Status */}
      <div className="form-row">
        <div className="form-field">
          <label>Priority</label>
          <select
            value={formData.priority || 'Medium'}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div className="form-field">
          <label>Status</label>
          <select
            value={formData.status || 'Draft'}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="Draft">Draft</option>
            <option value="In Review">In Review</option>
          </select>
        </div>
      </div>

      {/* Link to Delivery - Only for requirements */}
      {type.includes('Requirement') && (
        <DeliveryLinkSection
          artefacts={artefacts}
          formData={formData}
          handleChange={handleChange}
        />
      )}

      {/* Link to Requirements - Only for delivery items */}
      {['Epic', 'Feature', 'UserStory'].includes(type) && (
        <RequirementLinkSection
          artefacts={artefacts}
          formData={{ ...formData, artefactType: type }}
          handleChange={handleChange}
        />
      )}
    </div>
  );
}

// ============ DELIVERY LINK SECTION ============
// Allow requirements to be linked to delivery items
function DeliveryLinkSection({ artefacts, formData, handleChange }) {
  const deliveryTypes = ['Epic', 'Feature', 'UserStory'];
  const deliveryItems = artefacts.filter(a => deliveryTypes.includes(a.artefactType));

  // Group by type
  const groupedDelivery = deliveryItems.reduce((acc, item) => {
    if (!acc[item.artefactType]) acc[item.artefactType] = [];
    acc[item.artefactType].push(item);
    return acc;
  }, {});

  const selectedDeliveryIds = formData.deliveryLinks || [];

  const toggleDeliveryLink = (id) => {
    const newLinks = selectedDeliveryIds.includes(id)
      ? selectedDeliveryIds.filter(linkId => linkId !== id)
      : [...selectedDeliveryIds, id];
    handleChange('deliveryLinks', newLinks);
  };

  if (deliveryItems.length === 0) {
    return (
      <div className="form-field delivery-section">
        <label>
          Link to Delivery
          <span className="field-tip">How will this be implemented?</span>
        </label>
        <p className="delivery-empty">
          No delivery items (Epics, Features, User Stories) exist yet.
          You can link this requirement to delivery items later.
        </p>
      </div>
    );
  }

  return (
    <div className="form-field delivery-section">
      <label>
        Link to Delivery
        <span className="field-tip">How will this be implemented?</span>
      </label>
      <p className="delivery-hint">
        Select delivery items that will implement this requirement (optional)
      </p>
      <div className="delivery-groups">
        {Object.entries(groupedDelivery).map(([type, items]) => {
          const typeDef = ARTEFACT_TYPES[type];
          return (
            <div key={type} className="delivery-group">
              <div className="delivery-group-header">
                <span className="delivery-type-dot" style={{ backgroundColor: typeDef?.color }} />
                <span>{typeDef?.name || type}s</span>
              </div>
              <div className="delivery-items">
                {items.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={`delivery-item-btn ${selectedDeliveryIds.includes(item.id) ? 'selected' : ''}`}
                    onClick={() => toggleDeliveryLink(item.id)}
                  >
                    <CheckCircleIcon
                      fontSize="small"
                      className={`link-check ${selectedDeliveryIds.includes(item.id) ? 'visible' : ''}`}
                    />
                    <span className="delivery-item-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {selectedDeliveryIds.length > 0 && (
        <p className="delivery-selected-count">
          {selectedDeliveryIds.length} delivery item{selectedDeliveryIds.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

// ============ REQUIREMENT LINK SECTION ============
// Allow delivery items to be linked to requirements they implement
function RequirementLinkSection({ artefacts, formData, handleChange }) {
  const requirementTypes = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'];
  const requirements = artefacts.filter(a => requirementTypes.includes(a.artefactType));

  // Group by type
  const groupedRequirements = requirements.reduce((acc, item) => {
    if (!acc[item.artefactType]) acc[item.artefactType] = [];
    acc[item.artefactType].push(item);
    return acc;
  }, {});

  const selectedRequirementIds = formData.requirementLinks || [];

  const toggleRequirementLink = (id) => {
    const newLinks = selectedRequirementIds.includes(id)
      ? selectedRequirementIds.filter(linkId => linkId !== id)
      : [...selectedRequirementIds, id];
    handleChange('requirementLinks', newLinks);
  };

  if (requirements.length === 0) {
    return (
      <div className="form-field requirement-link-section">
        <label>
          Implements Requirements
          <span className="field-tip">What requirements does this deliver?</span>
        </label>
        <p className="requirement-empty">
          No requirements exist yet. Create Business or Stakeholder Requirements first,
          then link delivery items to them.
        </p>
      </div>
    );
  }

  return (
    <div className="form-field requirement-link-section">
      <label>
        Implements Requirements
        <span className="field-tip">What requirements does this deliver?</span>
      </label>
      <p className="requirement-hint">
        Select the requirement(s) this {ARTEFACT_TYPES[formData.artefactType]?.name?.toLowerCase() || 'item'} will implement
      </p>
      <div className="requirement-groups">
        {Object.entries(groupedRequirements).map(([type, items]) => {
          const typeDef = ARTEFACT_TYPES[type];
          return (
            <div key={type} className="requirement-group">
              <div className="requirement-group-header">
                <span className="requirement-type-dot" style={{ backgroundColor: typeDef?.color }} />
                <span>{typeDef?.name}s</span>
                <span className="requirement-group-count">{items.length}</span>
              </div>
              <div className="requirement-items">
                {items.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={`requirement-item-btn ${selectedRequirementIds.includes(item.id) ? 'selected' : ''}`}
                    onClick={() => toggleRequirementLink(item.id)}
                  >
                    <CheckCircleIcon
                      fontSize="small"
                      className={`link-check ${selectedRequirementIds.includes(item.id) ? 'visible' : ''}`}
                    />
                    <div className="requirement-item-content">
                      <span className="requirement-item-name">{item.name}</span>
                      {item.requirementId && (
                        <span className="requirement-item-id">{item.requirementId}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {selectedRequirementIds.length > 0 && (
        <p className="requirement-selected-count">
          Implements {selectedRequirementIds.length} requirement{selectedRequirementIds.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ============ STEP 3: REVIEW ============
function ReviewStep({ formData, typeDef, concept, type, artefacts }) {
  const deliveryLinks = formData.deliveryLinks || [];
  const linkedDeliveryItems = artefacts?.filter(a => deliveryLinks.includes(a.id)) || [];

  const requirementLinks = formData.requirementLinks || [];
  const linkedRequirements = artefacts?.filter(a => requirementLinks.includes(a.id)) || [];

  return (
    <div className="wizard-step-content review-step">
      <h3>Review Your {typeDef?.name}</h3>

      <div className="review-card">
        {/* Header with type badge */}
        <div className="review-header">
          <span className="review-type-badge" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.icon}
          </span>
          <div className="review-type-info">
            <span className="review-type-name">{typeDef?.name}</span>
            {formData.requirementId && (
              <span className="review-id">{formData.requirementId}</span>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="review-content">
          <div className="review-field main">
            <label>{type.includes('Requirement') ? 'Statement' : 'Name'}</label>
            <p className="review-value">{formData.name || '-'}</p>
          </div>

          {type === 'SolutionRequirement' && (
            <div className="review-field">
              <label>Category</label>
              <span className={`review-category ${formData.solutionCategory?.toLowerCase().replace('-', '')}`}>
                {formData.solutionCategory || 'Not specified'}
              </span>
            </div>
          )}

          {formData.description && (
            <div className="review-field">
              <label>Description</label>
              <p className="review-value">{formData.description}</p>
            </div>
          )}

          {formData.rationale && (
            <div className="review-field">
              <label>Rationale</label>
              <p className="review-value">{formData.rationale}</p>
            </div>
          )}

          {formData.acceptanceCriteria?.length > 0 && (
            <div className="review-field">
              <label>Acceptance Criteria</label>
              <ul className="review-criteria">
                {formData.acceptanceCriteria.map((c, i) => (
                  <li key={i}><CheckCircleIcon fontSize="small" /> {typeof c === 'object' ? (c.text || JSON.stringify(c)) : c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="review-row">
            <div className="review-field small">
              <label>Priority</label>
              <span className={`review-priority ${formData.priority?.toLowerCase()}`}>
                {formData.priority || 'Medium'}
              </span>
            </div>
            <div className="review-field small">
              <label>Status</label>
              <span className="review-status">{formData.status || 'Draft'}</span>
            </div>
          </div>

          {/* Delivery Links - for requirements */}
          {linkedDeliveryItems.length > 0 && (
            <div className="review-field delivery-links-review">
              <label>Linked Delivery Items</label>
              <div className="delivery-links-list">
                {linkedDeliveryItems.map(item => {
                  const itemTypeDef = ARTEFACT_TYPES[item.artefactType];
                  return (
                    <span key={item.id} className="delivery-link-chip" style={{ borderColor: itemTypeDef?.color }}>
                      <span className="delivery-link-dot" style={{ backgroundColor: itemTypeDef?.color }} />
                      {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Requirement Links - for delivery items */}
          {linkedRequirements.length > 0 && (
            <div className="review-field requirement-links-review">
              <label>Implements Requirements</label>
              <div className="requirement-links-list">
                {linkedRequirements.map(item => {
                  const itemTypeDef = ARTEFACT_TYPES[item.artefactType];
                  return (
                    <span key={item.id} className="requirement-link-chip" style={{ borderColor: itemTypeDef?.color }}>
                      <span className="requirement-link-dot" style={{ backgroundColor: itemTypeDef?.color }} />
                      <span className="requirement-link-name">{item.name}</span>
                      {item.requirementId && (
                        <span className="requirement-link-id">{item.requirementId}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps Hint */}
      {concept?.nextSteps && (
        <div className="next-steps-box">
          <h4>After creating this {typeDef?.name?.toLowerCase()}, consider:</h4>
          <ul>
            {concept.nextSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============ TYPE SELECTION STEP ============
function TypeSelectionStep({ onSelectType }) {
  // Group artefact types by section
  const typeGroups = {
    requirements: {
      label: 'Requirements',
      types: ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'],
    },
    delivery: {
      label: 'Delivery',
      types: ['Epic', 'Feature', 'Story'],
    },
    stakeholders: {
      label: 'Stakeholders & Rules',
      types: ['Stakeholder', 'BusinessRule'],
    },
  };

  return (
    <div className="wizard-step-content type-selection-step">
      <h3>What would you like to create?</h3>
      <p className="step-description">Select the type of artefact you want to add to your project.</p>

      {Object.entries(typeGroups).map(([groupId, group]) => (
        <div key={groupId} className="type-group">
          <h4>{group.label}</h4>
          <div className="type-options">
            {group.types.map(typeId => {
              const typeDef = ARTEFACT_TYPES[typeId];
              if (!typeDef) return null;
              return (
                <button
                  key={typeId}
                  className="type-option"
                  onClick={() => onSelectType(typeId)}
                  style={{ '--type-color': typeDef.color }}
                >
                  <span className="type-icon" style={{ backgroundColor: typeDef.color }}>
                    {typeDef.icon}
                  </span>
                  <div className="type-info">
                    <span className="type-name">{typeDef.name}</span>
                    <span className="type-desc">{typeDef.description || ''}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ MAIN WIZARD ============
export default function GuidedCreateModal({
  type: initialType,
  onClose,
  onCreate,
  preselectedParentId = null,
}) {
  const { artefacts } = useArtefacts();
  const { activeProject } = useProjects();
  const { getConcept } = useBA();

  // Allow type to be selected if not provided
  const [selectedType, setSelectedType] = useState(initialType);

  const typeDef = ARTEFACT_TYPES[selectedType];
  const concept = getConcept(selectedType);

  // Wizard state - start at type selection if no type provided
  const [step, setStep] = useState(initialType ? 0 : -1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rationale: '',
    priority: 'Medium',
    status: 'Draft',
    solutionCategory: selectedType === 'SolutionRequirement' ? 'Functional' : undefined,
    acceptanceCriteria: [],
    newCriterion: '',
  });

  // Update form data when type changes
  useEffect(() => {
    if (selectedType === 'SolutionRequirement') {
      setFormData(prev => ({ ...prev, solutionCategory: 'Functional' }));
    }
  }, [selectedType]);

  const steps = selectedType ? [
    { id: 'learn', title: 'Understand' },
    { id: 'define', title: 'Define' },
    { id: 'review', title: 'Review' },
  ] : [];

  // Handle type selection
  const handleSelectType = (typeId) => {
    setSelectedType(typeId);
    setStep(0); // Move to learning step
  };

  // Validation
  const canProceed = useMemo(() => {
    if (step === -1) return false; // Type selection - handled by clicking
    if (step === 0) return true; // Can always proceed from learning
    if (step === 1) return formData.name?.trim().length > 0;
    if (step === 2) return formData.name?.trim().length > 0;
    return false;
  }, [step, formData.name]);

  // Handle create
  const handleCreate = () => {
    if (!formData.name?.trim() || !selectedType) return;

    const data = {
      ...formData,
      artefactType: selectedType,
      acceptanceCriteria: formData.acceptanceCriteria?.filter(c => c.trim()) || [],
      parentId: preselectedParentId, // Pass parent for relationship creation
    };

    // Remove temp field
    delete data.newCriterion;

    onCreate(data);
  };

  // Type selection view
  if (step === -1) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="guided-wizard" onClick={(e) => e.stopPropagation()}>
          <div className="wizard-header" style={{ '--type-color': '#6366f1' }}>
            <span className="wizard-icon" style={{ backgroundColor: '#6366f1' }}>+</span>
            <div className="wizard-header-text">
              <h2>Create New Artefact</h2>
              <p className="wizard-question">Choose what you want to create</p>
            </div>
            <button className="wizard-close" onClick={onClose}>×</button>
          </div>
          <div className="wizard-body">
            <TypeSelectionStep onSelectType={handleSelectType} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="guided-wizard" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header" style={{ '--type-color': typeDef?.color }}>
          <span className="wizard-icon" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.icon}
          </span>
          <div className="wizard-header-text">
            <h2>Create {typeDef?.name}</h2>
            <p className="wizard-question">{concept?.question}</p>
          </div>
          <button className="wizard-close" onClick={onClose}>×</button>
        </div>

        {/* Step Indicator */}
        <WizardSteps
          steps={steps}
          currentStep={step}
          onStepClick={setStep}
        />

        {/* Step Content */}
        <div className="wizard-body">
          {step === 0 && (
            <LearningStep concept={concept} typeDef={typeDef} />
          )}
          {step === 1 && (
            <FieldsStep
              concept={concept}
              typeDef={typeDef}
              formData={formData}
              setFormData={setFormData}
              artefacts={artefacts}
              activeProject={activeProject}
              type={selectedType}
            />
          )}
          {step === 2 && (
            <ReviewStep
              formData={formData}
              typeDef={typeDef}
              concept={concept}
              type={selectedType}
              artefacts={artefacts}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="wizard-footer">
          {step > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(step - 1)}
            >
              <ArrowBackIcon fontSize="small" />
              Back
            </button>
          )}

          <div className="wizard-footer-spacer" />

          {step < steps.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              style={{ backgroundColor: typeDef?.color }}
            >
              {step === 0 ? "I understand, let's create" : 'Next'}
              <ArrowForwardIcon fontSize="small" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={!canProceed}
              style={{ backgroundColor: typeDef?.color }}
            >
              Create {typeDef?.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
