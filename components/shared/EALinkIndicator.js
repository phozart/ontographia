// components/shared/EALinkIndicator.js
// Shared component for showing EA link status on artefacts
// Used across PDS, BA, and other spaces that integrate with EA

import { useState, useCallback } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// EA Layer colors
const EA_LAYER_COLORS = {
  Strategy: '#f59e0b',
  Motivation: '#a855f7',
  Business: '#f97316',
  Application: '#3b82f6',
  Technology: '#10b981',
  Implementation: '#0ea5e9',
  strategy: '#f59e0b',
  motivation: '#a855f7',
  business: '#f97316',
  application: '#3b82f6',
  technology: '#10b981',
  implementation: '#0ea5e9',
};

/**
 * EALinkIndicator - Shows when an artefact is linked to EA
 *
 * @param {Object} props
 * @param {Object} props.artefact - The artefact object
 * @param {string} props.eaElementId - ID of linked EA element
 * @param {string} props.eaElementName - Name of linked EA element
 * @param {string} props.eaElementType - Type of linked EA element
 * @param {string} props.eaLayer - Layer of linked EA element
 * @param {string} props.syncStatus - 'synced', 'pending', 'error'
 * @param {function} props.onNavigateToEA - Callback to navigate to EA element
 * @param {function} props.onUnlink - Callback to unlink
 * @param {boolean} props.compact - Show compact view
 * @param {boolean} props.showUnlink - Show unlink button
 */
export default function EALinkIndicator({
  artefact,
  eaElementId,
  eaElementName,
  eaElementType,
  eaLayer,
  syncStatus = 'synced',
  onNavigateToEA,
  onUnlink,
  compact = false,
  showUnlink = false,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const isLinked = !!eaElementId;
  const layerColor = EA_LAYER_COLORS[eaLayer] || '#6b7280';

  const handleNavigate = useCallback((e) => {
    e.stopPropagation();
    if (onNavigateToEA && eaElementId) {
      onNavigateToEA(eaElementId);
    }
  }, [onNavigateToEA, eaElementId]);

  const handleUnlink = useCallback((e) => {
    e.stopPropagation();
    if (onUnlink) {
      onUnlink();
    }
  }, [onUnlink]);

  // Compact view - just an icon
  if (compact) {
    if (!isLinked) return null;

    return (
      <span
        className="ea-link-indicator-compact"
        title={`Linked to EA: ${eaElementName || 'Unknown'} (${eaLayer || 'Unknown layer'})`}
        style={{ color: layerColor }}
      >
        <LinkIcon fontSize="small" />
        <style jsx>{`
          .ea-link-indicator-compact {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
          }
          .ea-link-indicator-compact:hover {
            opacity: 0.8;
          }
        `}</style>
      </span>
    );
  }

  // Full view
  if (!isLinked) {
    return (
      <div className="ea-link-indicator not-linked">
        <LinkOffIcon fontSize="small" style={{ color: '#94a3b8' }} />
        <span className="indicator-text">Not linked to EA</span>
        <style jsx>{`
          .ea-link-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
          }
          .ea-link-indicator.not-linked {
            background: var(--bg-tertiary, #f1f5f9);
            color: var(--text-secondary, #64748b);
          }
          .indicator-text {
            white-space: nowrap;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="ea-link-indicator linked"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="indicator-badge" style={{ borderColor: layerColor }}>
        <AccountTreeIcon fontSize="small" style={{ color: layerColor }} />
        <div className="indicator-content">
          <span className="element-name">{eaElementName || 'EA Element'}</span>
          <span className="element-meta">
            {eaLayer && <span className="layer-badge" style={{ backgroundColor: `${layerColor}20`, color: layerColor }}>{eaLayer}</span>}
            {eaElementType && <span className="type-label">{eaElementType}</span>}
          </span>
        </div>
        {syncStatus === 'pending' && (
          <span className="sync-indicator pending" title="Changes pending sync">...</span>
        )}
        {syncStatus === 'error' && (
          <span className="sync-indicator error" title="Sync error">!</span>
        )}
      </div>

      <div className="indicator-actions">
        {onNavigateToEA && (
          <button
            className="action-btn navigate"
            onClick={handleNavigate}
            title="View in EA"
          >
            <OpenInNewIcon fontSize="small" />
          </button>
        )}
        {showUnlink && onUnlink && isHovered && (
          <button
            className="action-btn unlink"
            onClick={handleUnlink}
            title="Unlink from EA"
          >
            <LinkOffIcon fontSize="small" />
          </button>
        )}
      </div>

      <style jsx>{`
        .ea-link-indicator.linked {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          font-size: 13px;
        }

        .indicator-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
          padding-left: 4px;
          border-left: 3px solid;
        }

        .indicator-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .element-name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .element-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
        }

        .layer-badge {
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .type-label {
          color: var(--text-secondary, #64748b);
        }

        .sync-indicator {
          font-size: 14px;
          font-weight: bold;
        }

        .sync-indicator.pending {
          color: #f59e0b;
        }

        .sync-indicator.error {
          color: #ef4444;
        }

        .indicator-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-secondary, #64748b);
          transition: all 0.15s ease;
        }

        .action-btn:hover {
          background: var(--bg-hover, #e2e8f0);
        }

        .action-btn.navigate:hover {
          color: #3b82f6;
        }

        .action-btn.unlink:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

/**
 * EALinkBadge - Small badge for list views
 */
export function EALinkBadge({ isLinked, eaLayer, onClick }) {
  if (!isLinked) return null;

  const layerColor = EA_LAYER_COLORS[eaLayer] || '#6b7280';

  return (
    <span
      className="ea-link-badge"
      onClick={onClick}
      style={{ backgroundColor: `${layerColor}15`, color: layerColor, borderColor: layerColor }}
    >
      <LinkIcon style={{ fontSize: 12 }} />
      <span>EA</span>
      <style jsx>{`
        .ea-link-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          border: 1px solid;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .ea-link-badge:hover {
          opacity: 0.8;
        }
      `}</style>
    </span>
  );
}
