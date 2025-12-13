// components/ba/ArtefactView.js
// Full-width artefact-centric view - the artefact IS the page
// Inline editing, children, documents, diagrams, traceability all visible
// Renders fields dynamically based on artefact type definitions

import { useState, useMemo, useCallback } from 'react';
import {
  useArtefacts,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
  PRIORITY,
  RELATIONSHIP_TYPES,
  ATTACHMENT_TYPES,
} from '../ArtefactContext';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ListIcon from '@mui/icons-material/List';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Export utilities
import { exportToRichHtml, exportToJiraTicket, exportToMarkdown } from '../../lib/exportUtils';

// ============ FIELD RENDERERS ============

// Text field
function TextField({ field, value, onChange, isEditing }) {
  if (!isEditing) {
    return <span className="field-value">{value || '-'}</span>;
  }
  return (
    <input
      type="text"
      className="field-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || ''}
    />
  );
}

// Textarea field
function TextareaField({ field, value, onChange, isEditing }) {
  if (!isEditing) {
    return (
      <div className="field-value textarea-value">
        {value || <span className="empty-value">Not specified</span>}
      </div>
    );
  }
  return (
    <textarea
      className="field-textarea"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || ''}
      rows={3}
    />
  );
}

// Select field
function SelectField({ field, value, onChange, isEditing }) {
  if (!isEditing) {
    return <span className="field-value">{value || '-'}</span>;
  }
  return (
    <select
      className="field-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select...</option>
      {field.options?.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

// List field (array of strings)
function ListField({ field, value, onChange, isEditing }) {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    onChange([...items, '']);
  };

  const updateItem = (index, newValue) => {
    const updated = [...items];
    updated[index] = newValue;
    onChange(updated);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  if (!isEditing) {
    if (items.length === 0) {
      return <span className="field-value empty-value">None specified</span>;
    }
    return (
      <ul className="field-list-display">
        {items.filter(Boolean).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="field-list-edit">
      {items.map((item, i) => (
        <div key={i} className="list-item-row">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={field.placeholder || 'Enter item...'}
          />
          <button type="button" className="remove-item-btn" onClick={() => removeItem(i)}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
      ))}
      <button type="button" className="add-item-btn" onClick={addItem}>
        <AddIcon fontSize="small" />
        <span>Add Item</span>
      </button>
    </div>
  );
}

// Checklist field (array of { text, checked })
function ChecklistField({ field, value, onChange, isEditing }) {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    onChange([...items, { text: '', checked: false }]);
  };

  const updateItem = (index, updates) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const toggleCheck = (index) => {
    updateItem(index, { checked: !items[index].checked });
  };

  if (!isEditing) {
    if (items.length === 0) {
      return <span className="field-value empty-value">No items</span>;
    }
    return (
      <ul className="field-checklist-display">
        {items.map((item, i) => (
          <li key={i} className={item.checked ? 'checked' : ''}>
            <span className="check-icon">{item.checked ? '✓' : '○'}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="field-checklist-edit">
      {items.map((item, i) => (
        <div key={i} className="checklist-item-row">
          <button
            type="button"
            className={`check-toggle ${item.checked ? 'checked' : ''}`}
            onClick={() => toggleCheck(i)}
          >
            {item.checked ? '✓' : '○'}
          </button>
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateItem(i, { text: e.target.value })}
            placeholder={field.placeholder || 'Acceptance criterion...'}
          />
          <button type="button" className="remove-item-btn" onClick={() => removeItem(i)}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
      ))}
      <button type="button" className="add-item-btn" onClick={addItem}>
        <AddIcon fontSize="small" />
        <span>Add Criterion</span>
      </button>
    </div>
  );
}

// User Story field (special format)
function UserStoryField({ field, value, onChange, isEditing }) {
  const parseStory = (v) => {
    if (!v) return { asA: '', iWant: '', soThat: '' };
    const match = v.match(/As a[n]?\s+(.+?),?\s+I want\s+(.+?),?\s+so that\s+(.+)/i);
    if (match) {
      return { asA: match[1], iWant: match[2], soThat: match[3] };
    }
    return { asA: '', iWant: '', soThat: '', raw: v };
  };

  const formatStory = (parts) => {
    if (parts.raw) return parts.raw;
    if (!parts.asA && !parts.iWant && !parts.soThat) return '';
    return `As a ${parts.asA}, I want ${parts.iWant}, so that ${parts.soThat}`;
  };

  const [parts, setParts] = useState(() => parseStory(value));

  const handlePartChange = (key, val) => {
    const newParts = { ...parts, [key]: val };
    setParts(newParts);
    onChange(formatStory(newParts));
  };

  if (!isEditing) {
    if (!value) {
      return <span className="field-value empty-value">No user story defined</span>;
    }
    return (
      <div className="user-story-display">
        <span className="story-text">{value}</span>
      </div>
    );
  }

  return (
    <div className="user-story-edit">
      <div className="story-part">
        <label>As a</label>
        <input
          type="text"
          value={parts.asA || ''}
          onChange={(e) => handlePartChange('asA', e.target.value)}
          placeholder="user type/role"
        />
      </div>
      <div className="story-part">
        <label>I want</label>
        <input
          type="text"
          value={parts.iWant || ''}
          onChange={(e) => handlePartChange('iWant', e.target.value)}
          placeholder="goal/functionality"
        />
      </div>
      <div className="story-part">
        <label>So that</label>
        <input
          type="text"
          value={parts.soThat || ''}
          onChange={(e) => handlePartChange('soThat', e.target.value)}
          placeholder="benefit/reason"
        />
      </div>
    </div>
  );
}

// Multiselect (tags-style)
function MultiselectField({ field, value, onChange, isEditing }) {
  const items = Array.isArray(value) ? value : [];
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      onChange([...items, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (item) => {
    onChange(items.filter((i) => i !== item));
  };

  if (!isEditing) {
    if (items.length === 0) {
      return <span className="field-value empty-value">None specified</span>;
    }
    return (
      <div className="field-tags-display">
        {items.map((item, i) => (
          <span key={i} className="field-tag">{item}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="field-multiselect-edit">
      <div className="selected-tags">
        {items.map((item, i) => (
          <span key={i} className="field-tag editable">
            {item}
            <button type="button" onClick={() => removeItem(item)}>×</button>
          </span>
        ))}
      </div>
      <div className="tag-input-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          placeholder={field.placeholder || 'Add stakeholder...'}
        />
        <button type="button" className="add-tag-btn" onClick={addItem}>
          <AddIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

// User field (simple text for now)
function UserField({ field, value, onChange, isEditing }) {
  if (!isEditing) {
    return (
      <span className="field-value user-value">
        <PersonIcon fontSize="small" />
        {value || <span className="empty-value">Not assigned</span>}
      </span>
    );
  }
  return (
    <input
      type="text"
      className="field-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || 'Enter user name/email...'}
    />
  );
}

// Number field
function NumberField({ field, value, onChange, isEditing }) {
  if (!isEditing) {
    return <span className="field-value">{value ?? '-'}</span>;
  }
  return (
    <input
      type="number"
      className="field-input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      placeholder={field.placeholder || ''}
    />
  );
}

// Date field
function DateField({ field, value, onChange, isEditing }) {
  if (!isEditing) {
    return (
      <span className="field-value">
        {value ? new Date(value).toLocaleDateString() : '-'}
      </span>
    );
  }
  return (
    <input
      type="date"
      className="field-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// Tags field
function TagsField({ field, value, onChange, isEditing }) {
  return <MultiselectField field={field} value={value} onChange={onChange} isEditing={isEditing} />;
}

// Field renderer dispatcher
function renderField(field, value, onChange, isEditing) {
  const props = { field, value, onChange, isEditing };

  switch (field.type) {
    case 'text':
      return <TextField {...props} />;
    case 'textarea':
      return <TextareaField {...props} />;
    case 'select':
      return <SelectField {...props} />;
    case 'list':
    case 'numberedList':
      return <ListField {...props} />;
    case 'checklist':
      return <ChecklistField {...props} />;
    case 'userstory':
      return <UserStoryField {...props} />;
    case 'multiselect':
      return <MultiselectField {...props} />;
    case 'user':
      return <UserField {...props} />;
    case 'number':
      return <NumberField {...props} />;
    case 'date':
      return <DateField {...props} />;
    case 'tags':
      return <TagsField {...props} />;
    case 'artefactLink':
      // TODO: implement artefact link picker
      return <TextField {...props} />;
    case 'table':
      // TODO: implement table editor
      return <TextareaField {...props} />;
    default:
      return <TextField {...props} />;
  }
}

// ============ FIELDS SECTION ============
function FieldsSection({ artefact, editData, setEditData, isEditing }) {
  const [collapsed, setCollapsed] = useState(false);
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const fields = typeDef?.fields || {};

  // Get custom fields (stored in artefact.customFields)
  const customFields = artefact.customFields || {};

  // Get field value from either editData or artefact
  const getFieldValue = (fieldId) => {
    if (isEditing) {
      // Check editData.customFields first, then editData directly
      return editData.customFields?.[fieldId] ?? editData[fieldId] ?? customFields[fieldId] ?? artefact[fieldId];
    }
    return customFields[fieldId] ?? artefact[fieldId];
  };

  // Set field value in editData
  const setFieldValue = (fieldId, value) => {
    // Standard fields (name, description) go directly in editData
    if (['name', 'description', 'title'].includes(fieldId)) {
      setEditData({ ...editData, [fieldId]: value });
    } else {
      // Custom fields go in customFields
      setEditData({
        ...editData,
        customFields: {
          ...editData.customFields,
          [fieldId]: value,
        },
      });
    }
  };

  // Skip title and description as they're handled in the header
  const displayFields = Object.values(fields).filter(
    (f) => !['title', 'description'].includes(f.id)
  );

  if (displayFields.length === 0) {
    return null;
  }

  // Group fields by category
  const groupedFields = {
    business: displayFields.filter((f) =>
      ['businessValue', 'businessGoal', 'businessOwner', 'requestor', 'capabilityImpacted'].includes(f.id)
    ),
    scope: displayFields.filter((f) =>
      ['inScope', 'outOfScope', 'stakeholders'].includes(f.id)
    ),
    assessment: displayFields.filter((f) =>
      ['urgency', 'impact', 'priority', 'risks', 'impactOfNotDoing', 'alternativeOptions'].includes(f.id)
    ),
    story: displayFields.filter((f) =>
      ['userStory', 'acceptanceCriteria', 'definitionOfDone', 'owner'].includes(f.id)
    ),
    other: displayFields.filter((f) =>
      !['businessValue', 'businessGoal', 'businessOwner', 'requestor', 'capabilityImpacted',
        'inScope', 'outOfScope', 'stakeholders', 'urgency', 'impact', 'priority', 'risks',
        'impactOfNotDoing', 'alternativeOptions', 'userStory', 'acceptanceCriteria',
        'definitionOfDone', 'owner'].includes(f.id)
    ),
  };

  const renderFieldGroup = (title, fields) => {
    if (fields.length === 0) return null;
    return (
      <div className="field-group">
        <h4 className="field-group-title">{title}</h4>
        <div className="field-grid">
          {fields.map((field) => (
            <div
              key={field.id}
              className={`field-row ${field.type === 'textarea' || field.type === 'list' || field.type === 'checklist' ? 'full-width' : ''}`}
            >
              <label className="field-label">
                {field.name}
                {field.required && <span className="required">*</span>}
              </label>
              <div className="field-content">
                {renderField(
                  field,
                  getFieldValue(field.id),
                  (val) => setFieldValue(field.id, val),
                  isEditing
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="artefact-section fields-section">
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="section-title">
          <ListIcon fontSize="small" />
          <h3>Details</h3>
        </div>
        <div className="section-actions">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </div>
      </div>

      {!collapsed && (
        <div className="section-content">
          {renderFieldGroup('Business Context', groupedFields.business)}
          {renderFieldGroup('Scope & Stakeholders', groupedFields.scope)}
          {renderFieldGroup('Assessment', groupedFields.assessment)}
          {renderFieldGroup('User Story', groupedFields.story)}
          {renderFieldGroup('Other Details', groupedFields.other)}
        </div>
      )}
    </div>
  );
}

// ============ ATTACHMENTS SECTION ============
function AttachmentsSection({ artefact, onOpenDiagram, onCreateDiagram }) {
  const { diagrams = [] } = useArtefacts();
  const [collapsed, setCollapsed] = useState(false);

  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const allowedAttachments = typeDef?.allowedAttachments || [];

  const artefactDiagrams = useMemo(() => {
    return diagrams.filter(d => d.artefactId === artefact.id);
  }, [diagrams, artefact.id]);

  // Group allowed attachments by category
  const attachmentsByCategory = useMemo(() => {
    const groups = { diagram: [], design: [], spec: [], external: [] };
    allowedAttachments.forEach((attId) => {
      const att = ATTACHMENT_TYPES[attId];
      if (att) {
        groups[att.category] = groups[att.category] || [];
        groups[att.category].push(att);
      }
    });
    return groups;
  }, [allowedAttachments]);

  return (
    <div className="artefact-section attachments-section">
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="section-title">
          <LinkIcon fontSize="small" />
          <h3>Attachments & Diagrams</h3>
          <span className="section-count">{artefactDiagrams.length}</span>
        </div>
        <div className="section-actions">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </div>
      </div>

      {!collapsed && (
        <div className="section-content">
          {/* Quick create by category */}
          {Object.entries(attachmentsByCategory).map(([category, items]) => {
            if (items.length === 0) return null;
            const categoryNames = {
              diagram: 'Diagrams',
              design: 'Designs',
              spec: 'Specifications',
              external: 'Links',
            };
            return (
              <div key={category} className="attachment-category">
                <h4>{categoryNames[category]}</h4>
                <div className="quick-create-row">
                  {items.map((att) => (
                    <button
                      key={att.id}
                      className="quick-create-btn"
                      onClick={() => onCreateDiagram(att.id, `${artefact.name} - ${att.name}`)}
                    >
                      <span>{att.icon}</span>
                      <span>{att.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Existing attachments */}
          {artefactDiagrams.length > 0 && (
            <div className="attachments-list">
              <h4>Attached Files</h4>
              <div className="diagrams-list-inline">
                {artefactDiagrams.map((diag) => {
                  const attType = ATTACHMENT_TYPES[diag.type];
                  return (
                    <button
                      key={diag.id}
                      className="diagram-item"
                      onClick={() => onOpenDiagram(diag)}
                    >
                      <span className="diag-icon">{attType?.icon || '📄'}</span>
                      <span className="diag-name">{diag.name}</span>
                      <span className="diag-type">{attType?.name || diag.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {artefactDiagrams.length === 0 && allowedAttachments.length === 0 && (
            <p className="empty-hint">No attachments available for this artefact type.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============ CHILDREN SECTION ============
function ChildrenSection({ artefact, onSelectArtefact, onCreateChild }) {
  const { artefacts, relationships } = useArtefacts();
  const [collapsed, setCollapsed] = useState(false);

  // Find children (artefacts that have a relationship FROM this artefact)
  const children = useMemo(() => {
    const childRels = relationships.filter(
      r => r.from === artefact.id &&
      ['decomposesTo', 'refines', 'drives'].includes(r.type)
    );
    return childRels.map(rel => {
      const child = artefacts.find(a => a.id === rel.to);
      return child ? { ...child, relationshipType: rel.type } : null;
    }).filter(Boolean);
  }, [artefact.id, relationships, artefacts]);

  // Determine what child types can be created based on artefact type
  const allowedChildTypes = useMemo(() => {
    const typeMap = {
      'Capability': ['Capability', 'Epic'],
      'Epic': ['Feature'],
      'Feature': ['UserStory'],
      'UserStory': ['Ticket', 'SolutionRequirement'],
      'BusinessNeed': ['BusinessRequirement'],
      'BusinessRequirement': ['StakeholderRequirement', 'SolutionRequirement'],
      'BusinessProcess': ['BusinessProcess'],
    };
    return typeMap[artefact.artefactType] || [];
  }, [artefact.artefactType]);

  return (
    <div className="artefact-section">
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="section-title">
          <AccountTreeIcon fontSize="small" />
          <h3>Children</h3>
          <span className="section-count">{children.length}</span>
        </div>
        <div className="section-actions">
          {allowedChildTypes.length > 0 && (
            <div className="add-child-dropdown">
              {allowedChildTypes.map(type => (
                <button
                  key={type}
                  className="add-child-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateChild(type);
                  }}
                  title={`Add ${ARTEFACT_TYPES[type]?.name}`}
                >
                  <AddIcon fontSize="small" />
                  <span>{ARTEFACT_TYPES[type]?.name}</span>
                </button>
              ))}
            </div>
          )}
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </div>
      </div>

      {!collapsed && (
        <div className="section-content">
          {children.length === 0 ? (
            <div className="empty-state">
              <p>No children yet.</p>
              {allowedChildTypes.length > 0 && (
                <p className="hint">
                  Break down this {ARTEFACT_TYPES[artefact.artefactType]?.name} into smaller pieces.
                </p>
              )}
            </div>
          ) : (
            <div className="children-grid">
              {children.map(child => {
                const typeDef = ARTEFACT_TYPES[child.artefactType];
                const statusDef = ARTEFACT_STATUS[child.status];
                return (
                  <button
                    key={child.id}
                    className="child-card"
                    onClick={() => onSelectArtefact(child)}
                  >
                    <div className="child-card-header">
                      <span
                        className="child-type-badge"
                        style={{ backgroundColor: typeDef?.color }}
                      >
                        {typeDef?.icon}
                      </span>
                      <span
                        className="child-status"
                        style={{ backgroundColor: statusDef?.color }}
                      >
                        {statusDef?.name}
                      </span>
                    </div>
                    <h4 className="child-name">{child.name}</h4>
                    {child.description && (
                      <p className="child-description">{child.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ DOCUMENTS SECTION ============
function DocumentsSection({ artefact, onOpenDocument, onCreateDocument }) {
  const { documents = [] } = useArtefacts();
  const [collapsed, setCollapsed] = useState(false);

  const artefactDocs = useMemo(() => {
    return documents.filter(d => d.artefactId === artefact.id);
  }, [documents, artefact.id]);

  const templates = [
    { id: 'specification', name: 'Specification', icon: '📋' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'acceptance', name: 'Acceptance Criteria', icon: '✅' },
  ];

  return (
    <div className="artefact-section">
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="section-title">
          <DescriptionIcon fontSize="small" />
          <h3>Documents</h3>
          <span className="section-count">{artefactDocs.length}</span>
        </div>
        <div className="section-actions">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </div>
      </div>

      {!collapsed && (
        <div className="section-content">
          {/* Quick create buttons */}
          <div className="quick-create-row">
            {templates.map(t => (
              <button
                key={t.id}
                className="quick-create-btn"
                onClick={() => onCreateDocument(t.id, `${artefact.name} - ${t.name}`)}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
            <button
              className="quick-create-btn custom"
              onClick={() => onCreateDocument('custom', '')}
            >
              <AddIcon fontSize="small" />
              <span>Custom</span>
            </button>
          </div>

          {/* Document list */}
          {artefactDocs.length > 0 && (
            <div className="documents-list-inline">
              {artefactDocs.map(doc => (
                <button
                  key={doc.id}
                  className="document-item"
                  onClick={() => onOpenDocument(doc)}
                >
                  <DescriptionIcon fontSize="small" />
                  <span className="doc-name">{doc.name}</span>
                  <span className="doc-date">
                    {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}

          {artefactDocs.length === 0 && (
            <p className="empty-hint">
              Add documents to capture detailed specifications, notes, or acceptance criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============ DIAGRAMS SECTION ============
function DiagramsSection({ artefact, onOpenDiagram, onCreateDiagram }) {
  const { diagrams = [] } = useArtefacts();
  const [collapsed, setCollapsed] = useState(false);

  const artefactDiagrams = useMemo(() => {
    return diagrams.filter(d => d.artefactId === artefact.id);
  }, [diagrams, artefact.id]);

  const diagramTypes = [
    { id: 'flowchart', name: 'Flow', icon: '📊' },
    { id: 'process', name: 'Process', icon: '🔄' },
    { id: 'architecture', name: 'Architecture', icon: '🏗️' },
  ];

  return (
    <div className="artefact-section">
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="section-title">
          <AccountTreeIcon fontSize="small" />
          <h3>Diagrams</h3>
          <span className="section-count">{artefactDiagrams.length}</span>
        </div>
        <div className="section-actions">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </div>
      </div>

      {!collapsed && (
        <div className="section-content">
          {/* Quick create buttons */}
          <div className="quick-create-row">
            {diagramTypes.map(t => (
              <button
                key={t.id}
                className="quick-create-btn"
                onClick={() => onCreateDiagram(t.id, `${artefact.name} - ${t.name}`)}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Diagram list */}
          {artefactDiagrams.length > 0 && (
            <div className="diagrams-list-inline">
              {artefactDiagrams.map(diag => (
                <button
                  key={diag.id}
                  className="diagram-item"
                  onClick={() => onOpenDiagram(diag)}
                >
                  <span className="diag-icon">📊</span>
                  <span className="diag-name">{diag.name}</span>
                  <span className="diag-type">{diag.type}</span>
                </button>
              ))}
            </div>
          )}

          {artefactDiagrams.length === 0 && (
            <p className="empty-hint">
              Add diagrams to visualize flows, processes, or architecture.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============ TRACEABILITY SECTION ============
function TraceabilitySection({ artefact, onSelectArtefact }) {
  const { artefacts, relationships } = useArtefacts();
  const [collapsed, setCollapsed] = useState(false);

  // Upstream: artefacts that point TO this one
  const upstream = useMemo(() => {
    return relationships
      .filter(r => r.to === artefact.id)
      .map(r => {
        const source = artefacts.find(a => a.id === r.from);
        return source ? { artefact: source, type: r.type } : null;
      })
      .filter(Boolean);
  }, [artefact.id, relationships, artefacts]);

  // Downstream: artefacts this one points TO
  const downstream = useMemo(() => {
    return relationships
      .filter(r => r.from === artefact.id)
      .map(r => {
        const target = artefacts.find(a => a.id === r.to);
        return target ? { artefact: target, type: r.type } : null;
      })
      .filter(Boolean);
  }, [artefact.id, relationships, artefacts]);

  return (
    <div className="artefact-section traceability">
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="section-title">
          <h3>Traceability</h3>
          <span className="section-count">{upstream.length + downstream.length} links</span>
        </div>
        <div className="section-actions">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </div>
      </div>

      {!collapsed && (
        <div className="section-content traceability-content">
          {/* Upstream */}
          <div className="trace-column">
            <h4>← Traces From ({upstream.length})</h4>
            {upstream.length === 0 ? (
              <p className="empty-hint">No upstream links</p>
            ) : (
              <div className="trace-list">
                {upstream.map(({ artefact: a, type }) => {
                  const typeDef = ARTEFACT_TYPES[a.artefactType];
                  return (
                    <button
                      key={a.id}
                      className="trace-item"
                      onClick={() => onSelectArtefact(a)}
                    >
                      <span
                        className="trace-badge"
                        style={{ backgroundColor: typeDef?.color }}
                      >
                        {typeDef?.icon}
                      </span>
                      <span className="trace-name">{a.name}</span>
                      <span className="trace-rel">{RELATIONSHIP_TYPES[type]?.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Downstream */}
          <div className="trace-column">
            <h4>Traces To → ({downstream.length})</h4>
            {downstream.length === 0 ? (
              <p className="empty-hint">No downstream links</p>
            ) : (
              <div className="trace-list">
                {downstream.map(({ artefact: a, type }) => {
                  const typeDef = ARTEFACT_TYPES[a.artefactType];
                  return (
                    <button
                      key={a.id}
                      className="trace-item"
                      onClick={() => onSelectArtefact(a)}
                    >
                      <span
                        className="trace-badge"
                        style={{ backgroundColor: typeDef?.color }}
                      >
                        {typeDef?.icon}
                      </span>
                      <span className="trace-name">{a.name}</span>
                      <span className="trace-rel">{RELATIONSHIP_TYPES[type]?.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN ARTEFACT VIEW ============
export default function ArtefactView({
  artefact,
  onBack,
  onSelectArtefact,
  onOpenDocument,
  onCreateDocument,
  onOpenDiagram,
  onCreateDiagram,
  onCreateChild,
  onCopyLink,
}) {
  const { updateArtefact, deleteArtefact } = useArtefacts();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];

  const handleStartEdit = () => {
    setEditData({
      name: artefact.name,
      description: artefact.description || '',
      status: artefact.status,
      priority: artefact.priority,
      customFields: { ...(artefact.customFields || {}) },
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateArtefact(artefact.id, editData);
    setIsEditing(false);
    setEditData({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${artefact.name}"? This cannot be undone.`)) {
      await deleteArtefact(artefact.id);
      onBack();
    }
  };

  // Export handlers
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format) => {
    setShowExportMenu(false);

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'html':
        content = exportToRichHtml(artefact, {
          includeChildren: true,
          children: [],
          relationships: [],
          documents: [],
        });
        filename = `${artefact.name.replace(/[^a-z0-9]/gi, '_')}.html`;
        mimeType = 'text/html';
        break;

      case 'jira':
        content = JSON.stringify(exportToJiraTicket(artefact, { projectKey: 'PROJ' }), null, 2);
        filename = `${artefact.name.replace(/[^a-z0-9]/gi, '_')}_jira.json`;
        mimeType = 'application/json';
        break;

      case 'markdown':
        content = exportToMarkdown(artefact, {
          includeChildren: true,
          children: [],
          relationships: [],
          documents: [],
        });
        filename = `${artefact.name.replace(/[^a-z0-9]/gi, '_')}.md`;
        mimeType = 'text/markdown';
        break;

      default:
        return;
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async (format) => {
    setShowExportMenu(false);

    if (format === 'richHtml') {
      // Copy rich HTML that preserves formatting when pasted into Confluence/Word
      const htmlContent = exportToRichHtml(artefact, {});
      const plainText = artefact.name + '\n\n' + (artefact.description || '');

      try {
        // Use ClipboardItem API to copy both HTML and plain text
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([clipboardItem]);
        alert('Rich content copied! Paste into Confluence or Word to preserve formatting.');
      } catch (err) {
        // Fallback to plain text copy
        navigator.clipboard.writeText(htmlContent).then(() => {
          alert('HTML copied to clipboard (paste as plain text)');
        });
      }
    } else if (format === 'markdown') {
      const content = exportToMarkdown(artefact, {});
      navigator.clipboard.writeText(content).then(() => {
        alert('Markdown copied to clipboard!');
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    }
  };

  return (
    <div className="artefact-view">
      {/* Header */}
      <div className="artefact-view-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowBackIcon fontSize="small" />
          <span>Back to List</span>
        </button>

        <div className="header-main">
          <div className="header-type">
            <span
              className="type-badge-large"
              style={{ backgroundColor: typeDef?.color }}
            >
              {typeDef?.icon}
            </span>
            <span className="type-name">{typeDef?.name}</span>
          </div>

          {isEditing ? (
            <input
              type="text"
              className="title-input"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              autoFocus
            />
          ) : (
            <h1 className="artefact-title">{artefact.name}</h1>
          )}

          <div className="header-meta">
            {isEditing ? (
              <>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="status-select"
                >
                  {Object.values(ARTEFACT_STATUS).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="priority-select"
                >
                  {Object.values(PRIORITY).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <span
                  className="status-badge"
                  style={{ backgroundColor: statusDef?.color }}
                >
                  {statusDef?.name}
                </span>
                <span
                  className="priority-badge"
                  style={{ color: PRIORITY[artefact.priority]?.color }}
                >
                  {PRIORITY[artefact.priority]?.name} Priority
                </span>
              </>
            )}
          </div>
        </div>

        <div className="header-actions">
          {isEditing ? (
            <>
              <button className="btn-primary" onClick={handleSave}>
                <SaveIcon fontSize="small" />
                <span>Save</span>
              </button>
              <button className="btn-secondary" onClick={handleCancel}>
                <CloseIcon fontSize="small" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={handleStartEdit}>
                <EditIcon fontSize="small" />
                <span>Edit</span>
              </button>
              {onCopyLink && (
                <button
                  className="btn-secondary"
                  onClick={onCopyLink}
                  title="Copy shareable link"
                >
                  <ContentCopyIcon fontSize="small" />
                  <span>Copy Link</span>
                </button>
              )}
              <div className="export-dropdown">
                <button
                  className="btn-secondary"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <FileDownloadIcon fontSize="small" />
                  <span>Export</span>
                </button>
                {showExportMenu && (
                  <div className="export-menu">
                    <div className="export-menu-header">Download</div>
                    <button onClick={() => handleExport('html')}>
                      HTML File
                    </button>
                    <button onClick={() => handleExport('jira')}>
                      Jira Ticket (JSON)
                    </button>
                    <button onClick={() => handleExport('markdown')}>
                      Markdown
                    </button>
                    <div className="export-menu-divider" />
                    <div className="export-menu-header">Copy to Clipboard</div>
                    <button onClick={() => handleCopyToClipboard('richHtml')}>
                      Copy for Confluence/Word
                    </button>
                    <button onClick={() => handleCopyToClipboard('markdown')}>
                      Copy as Markdown
                    </button>
                  </div>
                )}
              </div>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={artefact.status === 'Approved'}
                title={artefact.status === 'Approved' ? 'Cannot delete approved artefacts' : ''}
              >
                <DeleteIcon fontSize="small" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="artefact-view-content">
        {/* Description */}
        <div className="artefact-section description-section">
          <h3>Description</h3>
          {isEditing ? (
            <textarea
              className="description-input"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Add a description..."
              rows={4}
            />
          ) : (
            <p className="description-text">
              {artefact.description || 'No description provided.'}
            </p>
          )}
        </div>

        {/* Dynamic Fields based on artefact type */}
        <FieldsSection
          artefact={artefact}
          editData={editData}
          setEditData={setEditData}
          isEditing={isEditing}
        />

        {/* Children */}
        <ChildrenSection
          artefact={artefact}
          onSelectArtefact={onSelectArtefact}
          onCreateChild={onCreateChild}
        />

        {/* Attachments & Diagrams (dynamic based on artefact type) */}
        <AttachmentsSection
          artefact={artefact}
          onOpenDiagram={onOpenDiagram}
          onCreateDiagram={onCreateDiagram}
        />

        {/* Documents */}
        <DocumentsSection
          artefact={artefact}
          onOpenDocument={onOpenDocument}
          onCreateDocument={onCreateDocument}
        />

        {/* Traceability */}
        <TraceabilitySection
          artefact={artefact}
          onSelectArtefact={onSelectArtefact}
        />

        {/* Metadata footer */}
        <div className="artefact-metadata">
          <span>Created: {new Date(artefact.createdAt).toLocaleString()}</span>
          <span>Updated: {new Date(artefact.updatedAt).toLocaleString()}</span>
          <span>Version: {artefact.version}</span>
          <span className="artefact-id">ID: {artefact.id}</span>
        </div>
      </div>
    </div>
  );
}
