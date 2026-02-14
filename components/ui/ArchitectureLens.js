// components/ui/ArchitectureLens.js
// Enterprise Architecture lens overlay — shows EA context (capabilities,
// applications, technologies, processes) for the currently selected entity.

import { useState, useEffect, useCallback } from 'react';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayersIcon from '@mui/icons-material/Layers';
import styles from './ArchitectureLens.module.css';

const EA_TYPE_LABELS = {
  Capability: 'Capabilities',
  Application: 'Applications',
  Technology: 'Technologies',
  BusinessProcess: 'Processes',
  EAElement: 'EA Elements',
};

/**
 * Toggle button for the architecture lens.
 */
export function ArchitectureLensToggle({ entityId, onClick, isOpen }) {
  const [hasContext, setHasContext] = useState(false);

  useEffect(() => {
    if (!entityId) { setHasContext(false); return; }

    let cancelled = false;
    fetch(`/api/graph/architecture-context?entityId=${encodeURIComponent(entityId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data) setHasContext(data.totalEAConnections > 0);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [entityId]);

  if (!entityId) return null;

  return (
    <button
      className={`${styles.toggleButton} ${isOpen ? styles.active : ''}`}
      onClick={onClick}
      title="Show architecture context"
    >
      <ArchitectureIcon style={{ fontSize: 16 }} />
      EA Lens
      {hasContext && <span className={styles.dot} />}
    </button>
  );
}

/**
 * Architecture Lens panel — right-side overlay showing EA context.
 */
export default function ArchitectureLens({ entityId, onClose, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);

    fetch(`/api/graph/architecture-context?entityId=${encodeURIComponent(entityId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(result => {
        setData(result);
        if (result?.eaContext) {
          const expanded = {};
          Object.keys(result.eaContext).forEach(k => { expanded[k] = true; });
          setExpandedGroups(expanded);
        }
      })
      .catch(err => {
        console.error('[ArchitectureLens] fetch error:', err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [entityId]);

  const toggleGroup = useCallback((key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleItemClick = useCallback((item) => {
    if (onNavigate) onNavigate(item);
  }, [onNavigate]);

  const eaContext = data?.eaContext || {};
  const totalConnections = data?.totalEAConnections || 0;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          <ArchitectureIcon style={{ fontSize: 14 }} />
          Architecture Lens ({totalConnections})
        </span>
        <button className={styles.closeButton} onClick={onClose} title="Close">
          <CloseIcon style={{ fontSize: 16 }} />
        </button>
      </div>

      <div className={styles.content}>
        {loading && (
          <div className={styles.loading}>Loading EA context...</div>
        )}

        {!loading && totalConnections === 0 && (
          <div className={styles.empty}>
            <LayersIcon className={styles.emptyIcon} style={{ fontSize: 32 }} />
            <span className={styles.emptyText}>
              No enterprise architecture context found.<br />
              Link this entity to capabilities, applications, or technologies in the graph.
            </span>
          </div>
        )}

        {!loading && Object.entries(eaContext).map(([typeKey, items]) => (
          <div key={typeKey} className={styles.group}>
            <div className={styles.groupHeader} onClick={() => toggleGroup(typeKey)}>
              <ChevronRightIcon
                className={`${styles.groupChevron} ${expandedGroups[typeKey] ? styles.expanded : ''}`}
                style={{ fontSize: 16 }}
              />
              <span className={styles.groupName}>
                {EA_TYPE_LABELS[typeKey] || typeKey}
              </span>
              <span className={styles.groupCount}>{items.length}</span>
            </div>

            {expandedGroups[typeKey] && items.map((item, idx) => (
              <div
                key={item.id || idx}
                className={styles.item}
                onClick={() => handleItemClick(item)}
              >
                <div
                  className={styles.itemDot}
                  style={{ background: item.typeColor || '#47453F' }}
                />
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  {item.relationshipType && (
                    <div className={styles.itemRel}>
                      {item.direction === 'incoming' ? '\u2190' : '\u2192'} {item.relationshipType}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
