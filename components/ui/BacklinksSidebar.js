// components/ui/BacklinksSidebar.js
// Contextual backlinks sidebar — shows what is connected to the current entity
// from other studios and the knowledge graph.

import { useState, useEffect, useCallback } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import styles from './BacklinksSidebar.module.css';

/**
 * Toggle button to show/hide the backlinks sidebar.
 * Place this in the workspace toolbar / actions area.
 */
export function BacklinksButton({ entityId, onClick, isOpen }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!entityId) {
      setCount(null);
      return;
    }

    let cancelled = false;
    fetch(`/api/graph/backlinks?entityId=${encodeURIComponent(entityId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data) setCount(data.totalConnections);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [entityId]);

  if (!entityId) return null;

  return (
    <button
      className={`${styles.toggleButton} ${isOpen ? styles.active : ''}`}
      onClick={onClick}
      title="Show connected entities"
    >
      <LinkIcon style={{ fontSize: 16 }} />
      Backlinks
      {count !== null && count > 0 && (
        <span className={styles.badge}>{count}</span>
      )}
    </button>
  );
}

/**
 * BacklinksSidebar - The sidebar panel showing connected entities.
 *
 * @param {string} entityId - The graph node ID to look up (e.g. "artefact_123")
 * @param {Function} onClose - Called when sidebar close button is clicked
 * @param {Function} [onNavigate] - Called when a backlink item is clicked, receives the item
 */
export default function BacklinksSidebar({ entityId, onClose, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (!entityId) return;

    setLoading(true);
    fetch(`/api/graph/backlinks?entityId=${encodeURIComponent(entityId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(result => {
        setData(result);
        // Expand all groups by default
        if (result?.groups) {
          const expanded = {};
          Object.keys(result.groups).forEach(k => { expanded[k] = true; });
          setExpandedGroups(expanded);
        }
      })
      .catch(err => {
        console.error('[BacklinksSidebar] fetch error:', err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [entityId]);

  const toggleGroup = useCallback((groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  }, []);

  const handleItemClick = useCallback((item) => {
    if (onNavigate) onNavigate(item);
  }, [onNavigate]);

  const groups = data?.groups || {};
  const totalConnections = data?.totalConnections || 0;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          Connections ({totalConnections})
        </span>
        <button className={styles.closeButton} onClick={onClose} title="Close">
          <CloseIcon style={{ fontSize: 16 }} />
        </button>
      </div>

      <div className={styles.content}>
        {loading && (
          <div className={styles.loading}>Loading connections...</div>
        )}

        {!loading && totalConnections === 0 && (
          <div className={styles.empty}>
            <LinkOffIcon className={styles.emptyIcon} style={{ fontSize: 32 }} />
            <span className={styles.emptyText}>
              No connections found.<br />
              This entity is not yet linked to other items in the graph.
            </span>
          </div>
        )}

        {!loading && Object.entries(groups).map(([groupKey, items]) => (
          <div key={groupKey} className={styles.group}>
            <div
              className={styles.groupHeader}
              onClick={() => toggleGroup(groupKey)}
            >
              <ChevronRightIcon
                className={`${styles.groupChevron} ${expandedGroups[groupKey] ? styles.expanded : ''}`}
                style={{ fontSize: 16 }}
              />
              <span className={styles.groupName}>{groupKey}</span>
              <span className={styles.groupCount}>{items.length}</span>
            </div>

            {expandedGroups[groupKey] && items.map((item, idx) => (
              <div
                key={item.id || idx}
                className={styles.linkItem}
                onClick={() => handleItemClick(item)}
              >
                <div
                  className={styles.linkDot}
                  style={{ background: item.typeColor || '#9C9A94' }}
                />
                <div className={styles.linkInfo}>
                  <div className={styles.linkName}>{item.name}</div>
                  <div className={styles.linkMeta}>
                    {item.relationshipType && (
                      <span className={styles.linkType}>
                        {item.direction === 'incoming' ? '\u2190' : '\u2192'} {item.relationshipType}
                      </span>
                    )}
                    {item.status && (
                      <span className={styles.linkStatus}>{item.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
