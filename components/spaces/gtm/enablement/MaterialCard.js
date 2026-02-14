// components/spaces/gtm/enablement/MaterialCard.js
// Card display for a sales/marketing material

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import ArticleIcon from '@mui/icons-material/Article';

import { MATERIAL_TYPES } from '../GTMContext';

export default function MaterialCard({ material, onEdit, onDelete, onClick }) {
  const materialType = MATERIAL_TYPES[material.material_type];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'presentation': return <SlideshowIcon />;
      case 'datasheet': return <DescriptionIcon />;
      case 'case_study': return <ArticleIcon />;
      case 'video': return <VideoLibraryIcon />;
      case 'demo': return <CodeIcon />;
      case 'graphic': return <ImageIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'review': return 'status-review';
      case 'outdated': return 'status-outdated';
      default: return 'status-draft';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="gtm-material-card" onClick={() => onClick?.(material)}>
      <div className="gtm-material-card-header">
        <div className="gtm-material-type-icon">
          {getTypeIcon(material.material_type)}
        </div>
        <span className={`gtm-material-status ${getStatusClass(material.status)}`}>
          {material.status || 'Draft'}
        </span>
        <div className="gtm-material-card-actions" onClick={e => e.stopPropagation()}>
          {material.url && (
            <a href={material.url} target="_blank" rel="noopener noreferrer" title="Open">
              <OpenInNewIcon fontSize="small" />
            </a>
          )}
          {material.download_url && (
            <a href={material.download_url} download title="Download">
              <DownloadIcon fontSize="small" />
            </a>
          )}
          <button onClick={() => onEdit?.(material)} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={() => onDelete?.(material.id)} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="gtm-material-card-body">
        <span className="gtm-material-type-label">
          {materialType?.name || 'Material'}
        </span>
        <h3 className="gtm-material-name">{material.name}</h3>
        {material.description && (
          <p className="gtm-material-desc">{material.description}</p>
        )}
      </div>

      <div className="gtm-material-card-meta">
        {material.audience && (
          <span className="gtm-material-audience">For: {material.audience}</span>
        )}
        {material.version && (
          <span className="gtm-material-version">v{material.version}</span>
        )}
      </div>

      {material.tags?.length > 0 && (
        <div className="gtm-material-tags">
          {material.tags.map((tag, i) => (
            <span key={i} className="gtm-material-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="gtm-material-card-footer">
        {material.owner && (
          <span className="gtm-material-owner">Owner: {material.owner}</span>
        )}
        {material.updated_at && (
          <span className="gtm-material-date">
            Updated: {formatDate(material.updated_at)}
          </span>
        )}
      </div>
    </div>
  );
}
