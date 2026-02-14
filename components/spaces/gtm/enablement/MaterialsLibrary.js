// components/spaces/gtm/enablement/MaterialsLibrary.js
// Library of sales and marketing materials

import { useState } from 'react';
import { useGTM, MATERIAL_TYPES } from '../GTMContext';
import MaterialCard from './MaterialCard';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FolderIcon from '@mui/icons-material/Folder';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

export default function MaterialsLibrary({ onSelect, onCreate, onEdit }) {
  const { getArtefactsByType, deleteArtefact } = useGTM();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');

  const materials = getArtefactsByType('Material');

  // Get unique audiences
  const audiences = [...new Set(materials.map(m => m.audience).filter(Boolean))];

  // Apply filters
  const filteredMaterials = materials.filter(m => {
    if (filterType !== 'all' && m.material_type !== filterType) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (filterAudience !== 'all' && m.audience !== filterAudience) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return m.name?.toLowerCase().includes(query) ||
             m.description?.toLowerCase().includes(query) ||
             m.tags?.some(t => t.toLowerCase().includes(query));
    }
    return true;
  });

  // Group by type
  const materialsByType = filteredMaterials.reduce((acc, m) => {
    const type = m.material_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(m);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (confirm('Delete this material?')) {
      await deleteArtefact(id);
    }
  };

  // Stats
  const stats = {
    total: materials.length,
    approved: materials.filter(m => m.status === 'approved').length,
    draft: materials.filter(m => m.status === 'draft' || !m.status).length,
    review: materials.filter(m => m.status === 'review').length
  };

  return (
    <div className="gtm-materials-library">
      <div className="gtm-materials-header">
        <div>
          <h2>Materials Library</h2>
          <p>Sales and marketing collateral for your GTM</p>
        </div>
        <button className="btn-primary" onClick={onCreate}>
          <AddIcon fontSize="small" />
          Add Material
        </button>
      </div>

      {/* Stats */}
      <div className="gtm-materials-stats">
        <div className="gtm-stat">
          <span className="gtm-stat-value">{stats.total}</span>
          <span className="gtm-stat-label">Total</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value success">{stats.approved}</span>
          <span className="gtm-stat-label">Approved</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value warning">{stats.review}</span>
          <span className="gtm-stat-label">In Review</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value">{stats.draft}</span>
          <span className="gtm-stat-label">Draft</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="gtm-materials-controls">
        <div className="gtm-materials-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials..."
          />
        </div>

        <div className="gtm-materials-filters">
          <FilterListIcon fontSize="small" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.entries(MATERIAL_TYPES).map(([key, type]) => (
              <option key={key} value={key}>{type.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="outdated">Outdated</option>
          </select>

          {audiences.length > 0 && (
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
            >
              <option value="all">All Audiences</option>
              {audiences.map(aud => (
                <option key={aud} value={aud}>{aud}</option>
              ))}
            </select>
          )}
        </div>

        <div className="gtm-view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            <ViewModuleIcon fontSize="small" />
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <ViewListIcon fontSize="small" />
          </button>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="gtm-empty-state">
          <FolderIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Materials Yet</h3>
          <p>Build your library of sales and marketing collateral</p>
          <button className="btn-primary" onClick={onCreate}>
            <AddIcon fontSize="small" />
            Add First Material
          </button>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="gtm-no-results">
          <p>No materials match your filters</p>
          <button className="btn-text" onClick={() => {
            setSearchQuery('');
            setFilterType('all');
            setFilterStatus('all');
            setFilterAudience('all');
          }}>
            Clear filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="gtm-materials-grid">
          {filteredMaterials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={onSelect}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="gtm-materials-grouped">
          {Object.entries(materialsByType).map(([type, mats]) => (
            <div key={type} className="gtm-materials-group">
              <div className="gtm-materials-group-header">
                <h3>{MATERIAL_TYPES[type]?.name || 'Other'}</h3>
                <span className="gtm-group-count">{mats.length}</span>
              </div>
              <div className="gtm-materials-list">
                {mats.map(material => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onClick={onSelect}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
