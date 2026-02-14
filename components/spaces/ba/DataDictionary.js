// components/ba/DataDictionary.js
// BABOK Data Dictionary - Centralized data element definitions
// Searchable dictionary with data types, constraints, and requirement links

import { useState, useMemo, useCallback } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../../ArtefactContext';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// MUI Icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import StorageIcon from '@mui/icons-material/Storage';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import NumbersIcon from '@mui/icons-material/Numbers';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CodeIcon from '@mui/icons-material/Code';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';

// ============ DATA TYPES ============
const DATA_TYPES = {
  string: { id: 'string', name: 'String', icon: TextFieldsIcon, color: '#3b82f6' },
  number: { id: 'number', name: 'Number', icon: NumbersIcon, color: '#22c55e' },
  integer: { id: 'integer', name: 'Integer', icon: NumbersIcon, color: '#10b981' },
  decimal: { id: 'decimal', name: 'Decimal', icon: NumbersIcon, color: '#14b8a6' },
  boolean: { id: 'boolean', name: 'Boolean', icon: ToggleOnIcon, color: '#f59e0b' },
  date: { id: 'date', name: 'Date', icon: CalendarTodayIcon, color: '#8b5cf6' },
  datetime: { id: 'datetime', name: 'DateTime', icon: CalendarTodayIcon, color: '#a855f7' },
  enum: { id: 'enum', name: 'Enumeration', icon: ListAltIcon, color: '#ec4899' },
  object: { id: 'object', name: 'Object', icon: CodeIcon, color: '#6366f1' },
  array: { id: 'array', name: 'Array', icon: ListAltIcon, color: '#0ea5e9' },
};

// ============ CATEGORIES ============
const CATEGORIES = {
  entity: { id: 'entity', name: 'Entity', color: '#3b82f6' },
  attribute: { id: 'attribute', name: 'Attribute', color: '#22c55e' },
  identifier: { id: 'identifier', name: 'Identifier', color: '#f59e0b' },
  reference: { id: 'reference', name: 'Reference', color: '#8b5cf6' },
  calculated: { id: 'calculated', name: 'Calculated', color: '#ec4899' },
  system: { id: 'system', name: 'System', color: '#6b7280' },
};

// ============ DATA ELEMENT CARD ============
function DataElementCard({ element, onEdit, onDelete, onSelect, isSelected, requirements }) {
  const dataType = DATA_TYPES[element.dataType] || DATA_TYPES.string;
  const category = CATEGORIES[element.category] || CATEGORIES.attribute;
  const DataTypeIcon = dataType.icon;

  const linkedReqs = requirements.filter(r =>
    element.linkedRequirements?.includes(r.id)
  );

  return (
    <div
      className={`data-element-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(element)}
    >
      <div className="card-header">
        <div className="element-type">
          <DataTypeIcon fontSize="small" style={{ color: dataType.color }} />
          <span style={{ color: dataType.color }}>{dataType.name}</span>
        </div>
        <span className="category-badge" style={{ backgroundColor: category.color }}>
          {category.name}
        </span>
      </div>

      <h4 className="element-name">{element.name}</h4>

      {element.description && (
        <p className="element-description">{element.description}</p>
      )}

      <div className="element-meta">
        {element.format && (
          <span className="meta-item">
            <CodeIcon fontSize="small" />
            {element.format}
          </span>
        )}
        {element.source && (
          <span className="meta-item">
            <StorageIcon fontSize="small" />
            {element.source}
          </span>
        )}
        {linkedReqs.length > 0 && (
          <span className="meta-item links">
            <LinkIcon fontSize="small" />
            {linkedReqs.length} req{linkedReqs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="card-actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit(element); }} title="Edit">
          <EditIcon fontSize="small" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(element); }} title="Delete" className="delete">
          <DeleteIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

// ============ DATA ELEMENT TABLE ============
function DataElementTable({ elements, onEdit, onDelete, onSelect, selectedId, requirements }) {
  return (
    <div className="data-element-table-container">
      <table className="data-element-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Category</th>
            <th>Format</th>
            <th>Source</th>
            <th>Links</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {elements.map(element => {
            const dataType = DATA_TYPES[element.dataType] || DATA_TYPES.string;
            const category = CATEGORIES[element.category] || CATEGORIES.attribute;
            const DataTypeIcon = dataType.icon;
            const linkedCount = element.linkedRequirements?.length || 0;

            return (
              <tr
                key={element.id}
                className={selectedId === element.id ? 'selected' : ''}
                onClick={() => onSelect(element)}
              >
                <td className="name-cell">
                  <strong>{element.name}</strong>
                  {element.description && (
                    <span className="description-preview">{element.description.slice(0, 50)}...</span>
                  )}
                </td>
                <td>
                  <span className="type-badge" style={{ color: dataType.color }}>
                    <DataTypeIcon fontSize="small" />
                    {dataType.name}
                  </span>
                </td>
                <td>
                  <span className="category-badge" style={{ backgroundColor: category.color }}>
                    {category.name}
                  </span>
                </td>
                <td>{element.format || '-'}</td>
                <td>{element.source || '-'}</td>
                <td>
                  {linkedCount > 0 ? (
                    <span className="link-count">{linkedCount}</span>
                  ) : '-'}
                </td>
                <td className="actions-cell">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(element); }}>
                    <EditIcon fontSize="small" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(element); }} className="delete">
                    <DeleteIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============ DATA ELEMENT FORM MODAL ============
function DataElementFormModal({ element, requirements, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: element?.name || '',
    dataType: element?.dataType || 'string',
    category: element?.category || 'attribute',
    description: element?.description || '',
    format: element?.format || '',
    constraints: element?.constraints || '',
    defaultValue: element?.defaultValue || '',
    source: element?.source || '',
    example: element?.example || '',
    linkedRequirements: element?.linkedRequirements || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...element,
      ...formData,
      id: element?.id || `de-${Date.now()}`,
    });
  };

  const toggleRequirement = (reqId) => {
    setFormData(prev => ({
      ...prev,
      linkedRequirements: prev.linkedRequirements.includes(reqId)
        ? prev.linkedRequirements.filter(id => id !== reqId)
        : [...prev.linkedRequirements, reqId],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="data-element-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{element?.id ? 'Edit Data Element' : 'Add Data Element'}</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-body">
            <div className="form-row">
              <div className="form-group">
                <label>Element Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., customer_id, order_date"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Data Type *</label>
              <div className="type-selector">
                {Object.entries(DATA_TYPES).map(([key, type]) => {
                  const TypeIcon = type.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`type-option ${formData.dataType === key ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, dataType: key })}
                      style={{ borderColor: formData.dataType === key ? type.color : 'transparent' }}
                    >
                      <TypeIcon style={{ color: type.color }} />
                      <span>{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this data element represents..."
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Format / Pattern</label>
                <input
                  type="text"
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  placeholder="e.g., YYYY-MM-DD, ^[A-Z]{2}\\d{4}$"
                />
              </div>
              <div className="form-group">
                <label>Source System</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g., CRM, ERP, Legacy DB"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Constraints</label>
                <input
                  type="text"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="e.g., NOT NULL, UNIQUE, 1-100"
                />
              </div>
              <div className="form-group">
                <label>Default Value</label>
                <input
                  type="text"
                  value={formData.defaultValue}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  placeholder="Default value if any"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Example Value</label>
              <input
                type="text"
                value={formData.example}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                placeholder="e.g., CUST-001, 2024-12-13"
              />
            </div>

            {requirements.length > 0 && (
              <div className="form-group">
                <label>
                  <LinkIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Link to Requirements
                </label>

                {/* Display linked requirements as chips */}
                {formData.linkedRequirements?.length > 0 && (
                  <div className="linked-requirements-chips">
                    {formData.linkedRequirements.map(reqId => {
                      const req = requirements.find(r => r.id === reqId);
                      if (!req) return null;
                      const typeDef = ARTEFACT_TYPES[req.artefactType];
                      return (
                        <div key={reqId} className="linked-req-chip">
                          <span className="req-type-badge" style={{ backgroundColor: typeDef?.color }}>
                            {typeDef?.icon || req.artefactType?.slice(0, 2)}
                          </span>
                          <span>{req.businessId || ''} {req.name}</span>
                          <button type="button" onClick={() => toggleRequirement(reqId)}>×</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Autocomplete for searching requirements */}
                <Autocomplete
                  options={requirements.filter(r => !formData.linkedRequirements?.includes(r.id))}
                  getOptionLabel={(option) => `${option.businessId || ''} ${option.name}`.trim()}
                  onChange={(event, value) => {
                    if (value) {
                      setFormData(prev => ({
                        ...prev,
                        linkedRequirements: [...prev.linkedRequirements, value.id]
                      }));
                    }
                  }}
                  value={null}
                  renderOption={(props, option) => {
                    const typeDef = ARTEFACT_TYPES[option.artefactType];
                    return (
                      <li {...props} key={option.id}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 22,
                            height: 22,
                            backgroundColor: typeDef?.color || '#6b7280',
                            borderRadius: 4,
                            color: 'white',
                            fontSize: 10,
                            marginRight: 10,
                            flexShrink: 0
                          }}
                        >
                          {typeDef?.icon || option.artefactType?.slice(0, 2)}
                        </span>
                        <span style={{ fontWeight: 500, marginRight: 8, color: 'var(--accent)' }}>
                          {option.businessId || ''}
                        </span>
                        <span>{option.name}</span>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search requirements..."
                      size="small"
                      sx={{
                        marginTop: '8px',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'var(--bg)',
                          '& fieldset': { borderColor: 'var(--border)' },
                          '&:hover fieldset': { borderColor: 'var(--accent)' },
                          '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
                        },
                        '& .MuiInputBase-input': { color: 'var(--text)', fontSize: 13 },
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-listbox': {
                      backgroundColor: 'var(--panel)',
                      '& .MuiAutocomplete-option': {
                        color: 'var(--text)',
                        '&:hover': { backgroundColor: 'var(--accent-soft)' },
                        '&[aria-selected="true"]': { backgroundColor: 'var(--accent-soft)' },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {element?.id ? 'Save Changes' : 'Add Element'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ DETAIL PANEL ============
function DataElementDetailPanel({ element, requirements, onEdit, onClose }) {
  if (!element) return null;

  const dataType = DATA_TYPES[element.dataType] || DATA_TYPES.string;
  const category = CATEGORIES[element.category] || CATEGORIES.attribute;
  const DataTypeIcon = dataType.icon;

  const linkedReqs = requirements.filter(r =>
    element.linkedRequirements?.includes(r.id)
  );

  return (
    <div className="data-element-detail-panel">
      <div className="panel-header">
        <h3>Element Details</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      <div className="panel-content">
        <div className="element-header-info">
          <DataTypeIcon style={{ fontSize: 32, color: dataType.color }} />
          <div>
            <h2>{element.name}</h2>
            <div className="badges">
              <span className="type-badge" style={{ color: dataType.color }}>
                {dataType.name}
              </span>
              <span className="category-badge" style={{ backgroundColor: category.color }}>
                {category.name}
              </span>
            </div>
          </div>
        </div>

        {element.description && (
          <div className="detail-section">
            <h4>Description</h4>
            <p>{element.description}</p>
          </div>
        )}

        <div className="detail-grid">
          {element.format && (
            <div className="detail-item">
              <span className="label">Format</span>
              <code>{element.format}</code>
            </div>
          )}
          {element.constraints && (
            <div className="detail-item">
              <span className="label">Constraints</span>
              <span>{element.constraints}</span>
            </div>
          )}
          {element.defaultValue && (
            <div className="detail-item">
              <span className="label">Default</span>
              <code>{element.defaultValue}</code>
            </div>
          )}
          {element.source && (
            <div className="detail-item">
              <span className="label">Source</span>
              <span>{element.source}</span>
            </div>
          )}
          {element.example && (
            <div className="detail-item">
              <span className="label">Example</span>
              <code>{element.example}</code>
            </div>
          )}
        </div>

        {linkedReqs.length > 0 && (
          <div className="detail-section">
            <h4>
              <LinkIcon fontSize="small" />
              Linked Requirements ({linkedReqs.length})
            </h4>
            <div className="linked-reqs-list">
              {linkedReqs.map(req => {
                const typeDef = ARTEFACT_TYPES[req.artefactType];
                return (
                  <div key={req.id} className="linked-req">
                    <span className="req-icon" style={{ backgroundColor: typeDef?.color }}>
                      {typeDef?.icon || req.artefactType?.slice(0, 2)}
                    </span>
                    <div>
                      <span className="req-id">{req.businessId || req.requirementId || req.id.slice(0, 8)}</span>
                      <span className="req-name">{req.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="panel-actions">
          <button onClick={() => onEdit(element)} className="btn-primary">
            <EditIcon fontSize="small" />
            Edit Element
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN DATA DICTIONARY ============
export default function DataDictionary({ projectId }) {
  const { artefacts } = useArtefacts();

  // State
  const [elements, setElements] = useState([
    // Sample data
    { id: 'de-1', name: 'customer_id', dataType: 'string', category: 'identifier', description: 'Unique identifier for customers', format: 'CUST-XXXXXX', source: 'CRM', example: 'CUST-000123', linkedRequirements: [] },
    { id: 'de-2', name: 'order_total', dataType: 'decimal', category: 'calculated', description: 'Total order amount including tax', format: '0.00', constraints: '>= 0', source: 'ERP', example: '1234.56', linkedRequirements: [] },
    { id: 'de-3', name: 'order_date', dataType: 'date', category: 'attribute', description: 'Date when order was placed', format: 'YYYY-MM-DD', source: 'Order System', example: '2024-12-13', linkedRequirements: [] },
    { id: 'de-4', name: 'is_active', dataType: 'boolean', category: 'attribute', description: 'Whether the customer account is active', defaultValue: 'true', source: 'CRM', linkedRequirements: [] },
    { id: 'de-5', name: 'order_status', dataType: 'enum', category: 'attribute', description: 'Current status of the order', format: 'Pending|Processing|Shipped|Delivered|Cancelled', source: 'Order System', example: 'Processing', linkedRequirements: [] },
  ]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedElement, setSelectedElement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingElement, setEditingElement] = useState(null);

  // Get requirements for linking
  const requirements = useMemo(() => {
    return artefacts.filter(a =>
      ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'].includes(a.artefactType)
    );
  }, [artefacts]);

  // Filter elements
  const filteredElements = useMemo(() => {
    return elements.filter(el => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!el.name.toLowerCase().includes(q) &&
            !el.description?.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filterType !== 'all' && el.dataType !== filterType) return false;
      if (filterCategory !== 'all' && el.category !== filterCategory) return false;
      return true;
    });
  }, [elements, searchQuery, filterType, filterCategory]);

  // Statistics
  const stats = useMemo(() => {
    const byType = {};
    const byCategory = {};

    elements.forEach(el => {
      byType[el.dataType] = (byType[el.dataType] || 0) + 1;
      byCategory[el.category] = (byCategory[el.category] || 0) + 1;
    });

    return {
      total: elements.length,
      byType,
      byCategory,
      withLinks: elements.filter(el => el.linkedRequirements?.length > 0).length,
    };
  }, [elements]);

  // Handlers
  const handleAddElement = () => {
    setEditingElement(null);
    setShowModal(true);
  };

  const handleEditElement = (element) => {
    setEditingElement(element);
    setShowModal(true);
  };

  const handleSaveElement = (elementData) => {
    if (editingElement?.id) {
      setElements(prev => prev.map(el => el.id === editingElement.id ? elementData : el));
    } else {
      setElements(prev => [...prev, elementData]);
    }
    setShowModal(false);
    setEditingElement(null);
  };

  const handleDeleteElement = (element) => {
    if (confirm(`Delete "${element.name}"? This cannot be undone.`)) {
      setElements(prev => prev.filter(el => el.id !== element.id));
      if (selectedElement?.id === element.id) {
        setSelectedElement(null);
      }
    }
  };

  const handleExportCSV = () => {
    let csv = 'Name,Data Type,Category,Description,Format,Constraints,Default,Source,Example\n';

    elements.forEach(el => {
      csv += `"${el.name}","${el.dataType}","${el.category}","${(el.description || '').replace(/"/g, '""')}","${el.format || ''}","${el.constraints || ''}","${el.defaultValue || ''}","${el.source || ''}","${el.example || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-dictionary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="data-dictionary-view">
      {/* Header */}
      <div className="dictionary-header">
        <div className="header-title">
          <MenuBookIcon style={{ fontSize: 28, color: '#6366f1' }} />
          <div>
            <h2>Data Dictionary</h2>
            <p>Centralized definitions for all data elements</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Elements</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.withLinks}</span>
            <span className="stat-label">Linked</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="dictionary-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <FilterListIcon fontSize="small" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {Object.entries(DATA_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="view-toggle">
            <button
              className={viewMode === 'cards' ? 'active' : ''}
              onClick={() => setViewMode('cards')}
            >
              <CategoryIcon fontSize="small" />
            </button>
            <button
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              <ListAltIcon fontSize="small" />
            </button>
          </div>

          <button className="export-btn" onClick={handleExportCSV}>
            <DownloadIcon fontSize="small" />
            Export
          </button>

          <button className="add-btn" onClick={handleAddElement}>
            <AddIcon fontSize="small" />
            Add Element
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dictionary-content">
        <div className={`elements-container ${selectedElement ? 'with-panel' : ''}`}>
          {filteredElements.length === 0 ? (
            <div className="empty-state">
              <MenuBookIcon style={{ fontSize: 48, opacity: 0.3 }} />
              <h3>No Data Elements Found</h3>
              <p>
                {elements.length === 0
                  ? 'Create your first data element to build your dictionary.'
                  : 'No elements match your current filters.'}
              </p>
              {elements.length === 0 && (
                <button onClick={handleAddElement} className="add-btn-large">
                  <AddIcon />
                  Add First Element
                </button>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="elements-grid">
              {filteredElements.map(element => (
                <DataElementCard
                  key={element.id}
                  element={element}
                  onEdit={handleEditElement}
                  onDelete={handleDeleteElement}
                  onSelect={setSelectedElement}
                  isSelected={selectedElement?.id === element.id}
                  requirements={requirements}
                />
              ))}
            </div>
          ) : (
            <DataElementTable
              elements={filteredElements}
              onEdit={handleEditElement}
              onDelete={handleDeleteElement}
              onSelect={setSelectedElement}
              selectedId={selectedElement?.id}
              requirements={requirements}
            />
          )}
        </div>

        {/* Detail Panel */}
        {selectedElement && (
          <DataElementDetailPanel
            element={selectedElement}
            requirements={requirements}
            onEdit={handleEditElement}
            onClose={() => setSelectedElement(null)}
          />
        )}
      </div>

      {/* Type Legend */}
      <div className="dictionary-legend">
        <h5>Data Types</h5>
        <div className="legend-items">
          {Object.entries(DATA_TYPES).map(([key, type]) => {
            const TypeIcon = type.icon;
            return (
              <div key={key} className="legend-item">
                <TypeIcon fontSize="small" style={{ color: type.color }} />
                <span>{type.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <DataElementFormModal
          element={editingElement}
          requirements={requirements}
          onSave={handleSaveElement}
          onClose={() => { setShowModal(false); setEditingElement(null); }}
        />
      )}
    </div>
  );
}
