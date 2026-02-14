// components/spaces/analysis/design/WireframeGallery.js
// Wireframe Gallery - Manage and link wireframe designs

import { useState, useMemo } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import LinkIcon from '@mui/icons-material/Link';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletIcon from '@mui/icons-material/Tablet';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Fidelity levels
const FIDELITY_LEVELS = {
  low: { label: 'Low-fi', description: 'Sketch/paper wireframe', color: '#94a3b8' },
  mid: { label: 'Mid-fi', description: 'Basic digital wireframe', color: '#64748b' },
  high: { label: 'High-fi', description: 'Detailed mockup', color: '#475569' }
};

// Device types
const DEVICE_TYPES = {
  desktop: { label: 'Desktop', icon: DesktopWindowsIcon },
  tablet: { label: 'Tablet', icon: TabletIcon },
  mobile: { label: 'Mobile', icon: PhoneAndroidIcon }
};

// ============ WIREFRAME CARD ============
function WireframeCard({ wireframe, onSelect, onEdit, onDelete }) {
  const DeviceIcon = DEVICE_TYPES[wireframe.device]?.icon || DesktopWindowsIcon;
  const fidelity = FIDELITY_LEVELS[wireframe.fidelity] || FIDELITY_LEVELS.mid;

  return (
    <div className="wireframe-card" onClick={() => onSelect(wireframe)}>
      <div className="wireframe-preview">
        {wireframe.imageUrl ? (
          <img src={wireframe.imageUrl} alt={wireframe.name} />
        ) : wireframe.figmaUrl ? (
          <div className="wireframe-figma">
            <span className="figma-icon">🎨</span>
            <span>Figma Design</span>
          </div>
        ) : (
          <div className="wireframe-placeholder">
            <ImageIcon style={{ fontSize: 48, opacity: 0.3 }} />
            <span>No preview</span>
          </div>
        )}
      </div>

      <div className="wireframe-content">
        <div className="wireframe-meta">
          <span className="wireframe-fidelity" style={{ backgroundColor: fidelity.color }}>
            {fidelity.label}
          </span>
          <span className="wireframe-device">
            <DeviceIcon fontSize="small" />
          </span>
        </div>

        <h4 className="wireframe-name">{wireframe.name}</h4>

        {wireframe.screen && (
          <p className="wireframe-screen">{wireframe.screen}</p>
        )}

        {wireframe.linkedRequirements?.length > 0 && (
          <div className="wireframe-links">
            <LinkIcon fontSize="small" />
            <span>{wireframe.linkedRequirements.length} linked requirements</span>
          </div>
        )}

        <div className="wireframe-actions">
          {wireframe.figmaUrl && (
            <a
              href={wireframe.figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open in Figma"
            >
              <OpenInNewIcon fontSize="small" />
            </a>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(wireframe); }} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(wireframe); }} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ WIREFRAME FORM MODAL ============
function WireframeFormModal({ wireframe, requirements, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: wireframe?.name || '',
    description: wireframe?.description || '',
    screen: wireframe?.screen || '',
    fidelity: wireframe?.fidelity || 'mid',
    device: wireframe?.device || 'desktop',
    imageUrl: wireframe?.imageUrl || '',
    figmaUrl: wireframe?.figmaUrl || '',
    annotations: wireframe?.annotations || [],
    linkedRequirements: wireframe?.linkedRequirements || [],
    status: wireframe?.status || 'Draft'
  });

  const [dragActive, setDragActive] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        // In a real app, upload to server. Here we use local URL
        const url = URL.createObjectURL(file);
        handleChange('imageUrl', url);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        handleChange('imageUrl', url);
      }
    }
  };

  const toggleRequirement = (reqId) => {
    setFormData(prev => {
      const linked = prev.linkedRequirements.includes(reqId)
        ? prev.linkedRequirements.filter(id => id !== reqId)
        : [...prev.linkedRequirements, reqId];
      return { ...prev, linkedRequirements: linked };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...wireframe,
      ...formData,
      artefactType: 'Wireframe'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wireframe-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{wireframe?.id ? 'Edit Wireframe' : 'Add Wireframe'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-columns">
            {/* Left Column - Image Upload */}
            <div className="form-column">
              <div className="form-section">
                <h4>Wireframe Image</h4>

                <div
                  className={`image-dropzone ${dragActive ? 'drag-active' : ''} ${formData.imageUrl ? 'has-image' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {formData.imageUrl ? (
                    <div className="preview-container">
                      <img src={formData.imageUrl} alt="Wireframe preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => handleChange('imageUrl', '')}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-content">
                      <CloudUploadIcon style={{ fontSize: 48, opacity: 0.5 }} />
                      <p>Drag & drop an image here</p>
                      <span>or</span>
                      <label className="file-select-btn">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          hidden
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Or paste Figma URL</label>
                  <input
                    type="url"
                    value={formData.figmaUrl}
                    onChange={(e) => handleChange('figmaUrl', e.target.value)}
                    placeholder="https://figma.com/file/..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="form-column">
              <div className="form-section">
                <h4>Details</h4>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Login Screen"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Screen / Page</label>
                  <input
                    type="text"
                    value={formData.screen}
                    onChange={(e) => handleChange('screen', e.target.value)}
                    placeholder="e.g., Authentication Flow"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of this wireframe..."
                    rows={2}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fidelity</label>
                    <div className="fidelity-options">
                      {Object.entries(FIDELITY_LEVELS).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          className={formData.fidelity === key ? 'active' : ''}
                          onClick={() => handleChange('fidelity', key)}
                          title={val.description}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Device</label>
                    <div className="device-options">
                      {Object.entries(DEVICE_TYPES).map(([key, val]) => {
                        const DevIcon = val.icon;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={formData.device === key ? 'active' : ''}
                            onClick={() => handleChange('device', key)}
                            title={val.label}
                          >
                            <DevIcon fontSize="small" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Superseded">Superseded</option>
                  </select>
                </div>
              </div>

              {requirements?.length > 0 && (
                <div className="form-section">
                  <h4>Linked Requirements</h4>
                  <div className="requirements-checklist">
                    {requirements.slice(0, 10).map(req => (
                      <label key={req.id} className="requirement-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.linkedRequirements.includes(req.id)}
                          onChange={() => toggleRequirement(req.id)}
                        />
                        <span className="requirement-name">{req.name}</span>
                      </label>
                    ))}
                    {requirements.length > 10 && (
                      <p className="requirements-more">+{requirements.length - 10} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {wireframe?.id ? 'Save Changes' : 'Add Wireframe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ MAIN WIREFRAME GALLERY ============
export default function WireframeGallery({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useAnalysis();

  const [viewMode, setViewMode] = useState('grid');
  const [filterFidelity, setFilterFidelity] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingWireframe, setEditingWireframe] = useState(null);

  const wireframes = useMemo(() => {
    return getArtefactsByType('Wireframe');
  }, [getArtefactsByType]);

  const requirements = useMemo(() => {
    return getArtefactsByType('SolutionRequirement');
  }, [getArtefactsByType]);

  // Filter wireframes
  const filteredWireframes = useMemo(() => {
    let result = wireframes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.name?.toLowerCase().includes(query) ||
        w.screen?.toLowerCase().includes(query)
      );
    }

    if (filterFidelity !== 'all') {
      result = result.filter(w => w.fidelity === filterFidelity);
    }

    if (filterDevice !== 'all') {
      result = result.filter(w => w.device === filterDevice);
    }

    return result;
  }, [wireframes, searchQuery, filterFidelity, filterDevice]);

  const handleEdit = (wireframe) => {
    setEditingWireframe(wireframe);
    setShowFormModal(true);
  };

  const handleDelete = async (wireframe) => {
    if (confirm(`Delete wireframe "${wireframe.name}"?`)) {
      await deleteArtefact(wireframe.id);
    }
  };

  const handleSave = async (data) => {
    if (data.id) {
      await updateArtefact(data.id, data);
    } else {
      await createArtefact('Wireframe', data);
    }
    setShowFormModal(false);
    setEditingWireframe(null);
  };

  const handleCreate = () => {
    setEditingWireframe(null);
    setShowFormModal(true);
  };

  return (
    <div className="wireframe-gallery">
      {/* Toolbar */}
      <div className="gallery-toolbar">
        <div className="toolbar-search">
          <input
            type="text"
            placeholder="Search wireframes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <FilterListIcon fontSize="small" />
          <select value={filterFidelity} onChange={(e) => setFilterFidelity(e.target.value)}>
            <option value="all">All Fidelity</option>
            {Object.entries(FIDELITY_LEVELS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          <select value={filterDevice} onChange={(e) => setFilterDevice(e.target.value)}>
            <option value="all">All Devices</option>
            {Object.entries(DEVICE_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <GridViewIcon fontSize="small" />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <ViewListIcon fontSize="small" />
            </button>
          </div>

          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Add Wireframe
          </button>
        </div>
      </div>

      {/* Gallery Content */}
      <div className={`gallery-content ${viewMode}`}>
        {filteredWireframes.length === 0 ? (
          <div className="gallery-empty">
            <ImageIcon style={{ fontSize: 64, opacity: 0.3 }} />
            <h3>No Wireframes Yet</h3>
            <p>Add wireframes to visualize your user interface designs.</p>
            <button className="btn-primary" onClick={handleCreate}>
              <AddIcon fontSize="small" />
              Add First Wireframe
            </button>
          </div>
        ) : (
          <div className="wireframe-grid">
            {filteredWireframes.map(wireframe => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                onSelect={onSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <WireframeFormModal
          wireframe={editingWireframe}
          requirements={requirements}
          onSave={handleSave}
          onClose={() => { setShowFormModal(false); setEditingWireframe(null); }}
        />
      )}
    </div>
  );
}

export { WireframeCard, WireframeFormModal, FIDELITY_LEVELS, DEVICE_TYPES };
