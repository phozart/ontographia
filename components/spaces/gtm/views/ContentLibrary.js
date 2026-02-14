// components/spaces/gtm/views/ContentLibrary.js
// Unified view of all GTM content (messages, materials, etc.)

import { useState } from 'react';
import { useGTM, MATERIAL_TYPES } from '../GTMContext';

import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MessageIcon from '@mui/icons-material/Message';
import DescriptionIcon from '@mui/icons-material/Description';
import ShieldIcon from '@mui/icons-material/Shield';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

export default function ContentLibrary({ onSelect }) {
  const { getArtefactsByType } = useGTM();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');

  const keyMessages = getArtefactsByType('KeyMessage');
  const materials = getArtefactsByType('Material');
  const objections = getArtefactsByType('Objection');
  const proofPoints = getArtefactsByType('ProofPoint');

  // Combine all content
  const allContent = [
    ...keyMessages.map(m => ({ ...m, contentType: 'message' })),
    ...materials.map(m => ({ ...m, contentType: 'material' })),
    ...objections.map(o => ({ ...o, contentType: 'objection' })),
    ...proofPoints.map(p => ({ ...p, contentType: 'proofpoint' }))
  ];

  // Get unique audiences
  const audiences = [...new Set([
    ...keyMessages.map(m => m.audience),
    ...materials.map(m => m.audience)
  ].filter(Boolean))];

  // Apply filters
  const filteredContent = allContent.filter(item => {
    // Type filter
    if (filterType !== 'all' && item.contentType !== filterType) return false;

    // Audience filter
    if (filterAudience !== 'all' && item.audience !== filterAudience) return false;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchFields = [
        item.name,
        item.message,
        item.description,
        item.objection,
        item.response,
        item.claim,
        item.audience,
        ...(item.tags || [])
      ].filter(Boolean);

      return searchFields.some(field =>
        field.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Group by content type
  const contentByType = filteredContent.reduce((acc, item) => {
    if (!acc[item.contentType]) acc[item.contentType] = [];
    acc[item.contentType].push(item);
    return acc;
  }, {});

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'message': return <MessageIcon />;
      case 'material': return <DescriptionIcon />;
      case 'objection': return <ShieldIcon />;
      case 'proofpoint': return <LightbulbIcon />;
      default: return <LibraryBooksIcon />;
    }
  };

  const getContentLabel = (type) => {
    switch (type) {
      case 'message': return 'Key Messages';
      case 'material': return 'Materials';
      case 'objection': return 'Objection Handlers';
      case 'proofpoint': return 'Proof Points';
      default: return type;
    }
  };

  // Stats
  const stats = {
    messages: keyMessages.length,
    materials: materials.length,
    objections: objections.length,
    proofpoints: proofPoints.length
  };

  return (
    <div className="gtm-content-library">
      <div className="gtm-content-header">
        <div>
          <h2>Content Library</h2>
          <p>All your GTM messaging and materials in one place</p>
        </div>
      </div>

      {/* Stats */}
      <div className="gtm-content-stats">
        <div className="gtm-stat" onClick={() => setFilterType('message')}>
          <MessageIcon />
          <span className="gtm-stat-value">{stats.messages}</span>
          <span className="gtm-stat-label">Messages</span>
        </div>
        <div className="gtm-stat" onClick={() => setFilterType('material')}>
          <DescriptionIcon />
          <span className="gtm-stat-value">{stats.materials}</span>
          <span className="gtm-stat-label">Materials</span>
        </div>
        <div className="gtm-stat" onClick={() => setFilterType('objection')}>
          <ShieldIcon />
          <span className="gtm-stat-value">{stats.objections}</span>
          <span className="gtm-stat-label">Objections</span>
        </div>
        <div className="gtm-stat" onClick={() => setFilterType('proofpoint')}>
          <LightbulbIcon />
          <span className="gtm-stat-value">{stats.proofpoints}</span>
          <span className="gtm-stat-label">Proof Points</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="gtm-content-controls">
        <div className="gtm-content-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all content..."
          />
        </div>

        <div className="gtm-content-filters">
          <FilterListIcon fontSize="small" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="message">Key Messages</option>
            <option value="material">Materials</option>
            <option value="objection">Objections</option>
            <option value="proofpoint">Proof Points</option>
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
      </div>

      {allContent.length === 0 ? (
        <div className="gtm-empty-state">
          <LibraryBooksIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Content Yet</h3>
          <p>Create messages, materials, and proof points to build your content library</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="gtm-no-results">
          <p>No content matches your search</p>
          <button className="btn-text" onClick={() => {
            setSearchQuery('');
            setFilterType('all');
            setFilterAudience('all');
          }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="gtm-content-sections">
          {Object.entries(contentByType).map(([type, items]) => (
            <div key={type} className="gtm-content-section">
              <div className="gtm-section-header">
                {getContentIcon(type)}
                <h3>{getContentLabel(type)}</h3>
                <span className="gtm-section-count">{items.length}</span>
              </div>

              <div className="gtm-content-grid">
                {items.map(item => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onSelect={onSelect}
                    onCopy={copyToClipboard}
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

// Content Card Component
function ContentCard({ item, onSelect, onCopy }) {
  const getCopyText = () => {
    switch (item.contentType) {
      case 'message': return item.message;
      case 'objection': return `Objection: "${item.objection}"\n\nResponse: ${item.response}`;
      case 'proofpoint': return item.claim;
      default: return item.name;
    }
  };

  const getPreviewText = () => {
    switch (item.contentType) {
      case 'message': return item.message;
      case 'objection': return item.objection;
      case 'proofpoint': return item.claim;
      case 'material': return item.description;
      default: return item.description || item.name;
    }
  };

  return (
    <div className={`gtm-content-card type-${item.contentType}`} onClick={() => onSelect?.(item)}>
      <div className="gtm-content-card-header">
        {item.contentType === 'message' && (
          <span className="gtm-content-audience">{item.audience}</span>
        )}
        {item.contentType === 'material' && (
          <span className="gtm-content-type-badge">
            {MATERIAL_TYPES[item.material_type]?.name || 'Material'}
          </span>
        )}
        {item.contentType === 'objection' && (
          <span className={`gtm-content-severity ${item.severity || 'medium'}`}>
            {item.severity || 'Medium'}
          </span>
        )}

        <div className="gtm-content-actions" onClick={e => e.stopPropagation()}>
          <button onClick={() => onCopy(getCopyText())} title="Copy">
            <ContentCopyIcon fontSize="small" />
          </button>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" title="Open">
              <OpenInNewIcon fontSize="small" />
            </a>
          )}
        </div>
      </div>

      <div className="gtm-content-card-body">
        {item.contentType === 'material' && (
          <h4 className="gtm-content-name">{item.name}</h4>
        )}
        <p className="gtm-content-preview">
          {item.contentType === 'objection' && <span className="gtm-quote">"</span>}
          {getPreviewText()?.substring(0, 150)}
          {(getPreviewText()?.length || 0) > 150 ? '...' : ''}
          {item.contentType === 'objection' && <span className="gtm-quote">"</span>}
        </p>

        {item.contentType === 'objection' && item.response && (
          <div className="gtm-objection-response">
            <span className="gtm-response-label">Response:</span>
            <p>{item.response.substring(0, 100)}...</p>
          </div>
        )}
      </div>

      {item.tags?.length > 0 && (
        <div className="gtm-content-tags">
          {item.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="gtm-content-tag">{tag}</span>
          ))}
        </div>
      )}

      {item.contentType === 'proofpoint' && item.category && (
        <div className="gtm-content-meta">
          <span className="gtm-content-category">{item.category}</span>
        </div>
      )}
    </div>
  );
}
