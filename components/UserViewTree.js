import React from 'react';

function AttributeBadges({ item }) {
  if (!item?.attributes || !Object.keys(item.attributes).length) return null;
  return (
    <div className="attr-row">
      {Object.entries(item.attributes).map(([k, v]) => (
        <span key={k} className="attr-badge">
          <span className="attr-key">{k}</span>
          <span className="attr-val">{String(v)}</span>
        </span>
      ))}
    </div>
  );
}

export default function UserViewTree({
  list,
  direction,
  childrenMap,
  parentMap,
  expanded,
  setExpanded,
  expandedTypes,
  setExpandedTypes,
  openEditModal,
  setSelectedNodeId,
  setNodeQuery,
  setCrumbs,
  nodeTypesById,
}) {
  function groupByType(nodes) {
    const groups = new Map();
    nodes.forEach(n => {
      const typeMeta =
        (n.typeId && nodeTypesById?.get(n.typeId)) ||
        (n.typeName && nodeTypesById?.get(n.typeName)) ||
        null;
      const key =
        typeMeta?.label ||
        typeMeta?.name ||
        n.typeLabel ||
        n.typeName ||
        'Unspecified';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(n);
    });
    return Array.from(groups.entries()).map(([typeName, items]) => ({ typeName, items }));
  }

  const renderNodes = (nodes, visited) => {
    if (!nodes || !nodes.length) return <p className="muted">No linked nodes.</p>;
    const grouped = groupByType(nodes);
    const linkMap = direction === 'out' ? childrenMap : parentMap;
    return (
      <div className="type-group-list">
        {grouped.map(group => {
          const isOpen = !!expandedTypes[group.typeName];
          return (
            <div key={group.typeName} className="type-group">
              <button
                type="button"
                className="type-group__label"
                onClick={() => setExpandedTypes(prev => ({ ...prev, [group.typeName]: !prev[group.typeName] }))}
                aria-expanded={isOpen}
                style={{ display: 'flex', justifyContent: 'space-between', width: '100%', cursor: 'pointer' }}
              >
                <span>{group.typeName}</span>
                <span>{isOpen ? '-' : '+'}</span>
              </button>
              {isOpen && (
                <div className="user-grid">
                  {group.items.map(n => {
                    if (visited.has(n.id)) return null;
                    const children = linkMap.get(n.id) || [];
                    const displayName = n.label || n.name;
                    const typeMeta =
                      (n.typeId && nodeTypesById?.get(n.typeId)) ||
                      (n.typeName && nodeTypesById?.get(n.typeName)) ||
                      null;
                    const displayType =
                      typeMeta?.label ||
                      typeMeta?.name ||
                      n.typeLabel ||
                      n.typeName ||
                      n.typeId;
                    const borderColor = n.color || n.typeColor || 'var(--border)';
                    return (
                      <div
                        key={n.id}
                        className="card user-tree-card node-card"
                        style={{ borderColor, borderLeftColor: borderColor }}
                        onClick={() => {
                          setSelectedNodeId(n.id);
                          setNodeQuery(displayName || '');
                          setExpanded(prev => ({ ...prev, [n.id]: true }));
                          setCrumbs(prev => [...prev.filter(c => c.id !== n.id), { id: n.id, name: displayName || '', type: displayType }]);
                        }}
                      >
                        <div className="message-card">
                          <div className="message-title-row">
                            <div className="message-name">{displayName}</div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                              <button
                                className="chip-toggle"
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  openEditModal(n.id);
                                }}
                                aria-label="Edit node"
                              >
                                ✏
                              </button>
                              <button
                                className="chip-toggle"
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setExpanded(prev => ({ ...prev, [n.id]: !prev[n.id] }));
                                }}
                                aria-label={expanded[n.id] ? 'Collapse node' : 'Expand node'}
                              >
                                {expanded[n.id] ? '▲' : '▼'}
                              </button>
                            </div>
                          </div>
                        </div>
                        {expanded[n.id] && (
                          <div className="message-body">
                            {n.description && <p className="tree-desc">{n.description}</p>}
                            <AttributeBadges item={n} />
                            {children.length > 0 && (
                              <div className="message-events">
                                <h4>Linked nodes</h4>
                                {renderNodes(children, new Set([...visited, n.id]))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return renderNodes(list, new Set());
}
