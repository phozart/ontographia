// components/ba/DocumentList.js
// Document list and management component

import { useState, useEffect, useMemo } from 'react';
import { useProjects } from '../../ProjectContext';
import { ARTEFACT_TYPES } from '../../ArtefactContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Document type definitions
const DOCUMENT_TYPES = {
  stakeholder_requirements: {
    id: 'stakeholder_requirements',
    name: 'Stakeholder Requirements',
    icon: '📋',
    color: '#f97316',
  },
  user_story_spec: {
    id: 'user_story_spec',
    name: 'User Story Specification',
    icon: '📖',
    color: '#8b5cf6',
  },
  business_requirements: {
    id: 'business_requirements',
    name: 'Business Requirements',
    icon: '📊',
    color: '#3b82f6',
  },
  capability_map: {
    id: 'capability_map',
    name: 'Capability Map',
    icon: '🗺️',
    color: '#22c55e',
  },
  solution_design: {
    id: 'solution_design',
    name: 'Solution Design',
    icon: '🏗️',
    color: '#6366f1',
  },
  general: {
    id: 'general',
    name: 'General Document',
    icon: '📄',
    color: '#64748b',
  },
};

const DOCUMENT_STATUS = {
  Draft: { color: '#94a3b8' },
  InReview: { color: '#fbbf24' },
  Approved: { color: '#22c55e' },
  Archived: { color: '#6b7280' },
};

export default function DocumentList({
  onCreateDocument,
  onOpenDocument,
  onSelectArtefact,
}) {
  const { activeProject } = useProjects();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load documents
  useEffect(() => {
    if (activeProject?.id) {
      loadDocuments();
    }
  }, [activeProject?.id]);

  const loadDocuments = async () => {
    if (!activeProject?.id) return;

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ projectId: activeProject.id });
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const res = await fetch(`/api/documents?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        throw new Error('Failed to load documents');
      }
    } catch (err) {
      setError(err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title?.toLowerCase().includes(term) ||
          d.document_type?.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
      if (sortBy === 'created') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return filtered;
  }, [documents, searchTerm, sortBy]);

  // Delete document
  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== docId));
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="document-list">
      {/* Header */}
      <div className="document-list-header">
        <div className="document-list-title">
          <DescriptionIcon />
          <h3>Documents</h3>
          <span className="count">{documents.length}</span>
        </div>
        <button className="create-document-btn" onClick={() => setShowCreateModal(true)}>
          <AddIcon fontSize="small" />
          <span>New Document</span>
        </button>
      </div>

      {/* Filters */}
      <div className="document-list-filters">
        <div className="search-box">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            // Reload with new filter
          }}
          className="filter-select"
        >
          <option value="">All Types</option>
          {Object.values(DOCUMENT_TYPES).map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="updated">Recently Updated</option>
          <option value="created">Recently Created</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Document List */}
      <div className="document-list-content">
        {loading ? (
          <div className="loading-state">Loading documents...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <ArticleIcon style={{ fontSize: 48, opacity: 0.3 }} />
            <p>No documents yet</p>
            <p className="hint">Create a document to get started</p>
            <button
              className="empty-create-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <AddIcon fontSize="small" />
              Create Document
            </button>
          </div>
        ) : (
          <div className="document-grid">
            {filteredDocuments.map((doc) => {
              const typeDef = DOCUMENT_TYPES[doc.document_type] || DOCUMENT_TYPES.general;
              const statusColor = DOCUMENT_STATUS[doc.status]?.color || '#94a3b8';

              return (
                <div key={doc.id} className="document-card">
                  <div
                    className="document-card-header"
                    style={{ backgroundColor: typeDef.color }}
                  >
                    <span className="document-icon">{typeDef.icon}</span>
                    <span className="document-type">{typeDef.name}</span>
                  </div>

                  <div className="document-card-body">
                    <h4 className="document-title">{doc.title || 'Untitled'}</h4>
                    {doc.artefact_name && (
                      <div className="document-artefact">
                        <span>Linked to:</span>
                        <span className="artefact-link">{doc.artefact_name}</span>
                      </div>
                    )}
                    <div className="document-meta">
                      <span
                        className="document-status"
                        style={{ color: statusColor }}
                      >
                        {doc.status}
                      </span>
                      <span className="document-date">
                        Updated {formatDate(doc.updated_at)}
                      </span>
                    </div>
                  </div>

                  <div className="document-card-actions">
                    <button
                      className="action-btn view"
                      onClick={() => onOpenDocument?.(doc, false)}
                      title="View"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => onOpenDocument?.(doc, true)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(doc.id)}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Document Modal */}
      {showCreateModal && (
        <CreateDocumentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(doc) => {
            setShowCreateModal(false);
            onCreateDocument?.(doc);
            loadDocuments();
          }}
          projectId={activeProject?.id}
        />
      )}
    </div>
  );
}

// ============ CREATE DOCUMENT MODAL ============
function CreateDocumentModal({ onClose, onCreate, projectId }) {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('general');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [documentType]);

  const loadTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (documentType) params.append('type', documentType);
      const res = await fetch(`/api/documents/templates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Please enter a document title');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: title.trim(),
          documentType,
          templateId: templateId || null,
        }),
      });

      if (res.ok) {
        const doc = await res.json();
        onCreate(doc);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create document');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-document-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Document</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Document Type</label>
            <div className="document-type-grid">
              {Object.values(DOCUMENT_TYPES).map((t) => (
                <button
                  key={t.id}
                  className={`type-option ${documentType === t.id ? 'selected' : ''}`}
                  onClick={() => setDocumentType(t.id)}
                  style={{
                    borderColor: documentType === t.id ? t.color : 'transparent',
                    backgroundColor: documentType === t.id ? `${t.color}10` : 'transparent',
                  }}
                >
                  <span className="type-icon">{t.icon}</span>
                  <span className="type-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {templates.length > 0 && (
            <div className="form-group">
              <label>Template (Optional)</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">Start from scratch</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="create-btn"
            onClick={handleCreate}
            disabled={loading || !title.trim()}
          >
            {loading ? 'Creating...' : 'Create Document'}
          </button>
        </div>
      </div>
    </div>
  );
}

export { DOCUMENT_TYPES, DOCUMENT_STATUS };
