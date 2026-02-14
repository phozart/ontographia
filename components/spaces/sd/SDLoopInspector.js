// components/sd/SDLoopInspector.js
// EPIC 2.4 - Loop Inspector Panel
import { useState, useCallback, useMemo } from 'react';
import LoopIcon from '@mui/icons-material/Loop';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';

// Loop detection utility
export function detectFeedbackLoops(elements, connections) {
  if (connections.length === 0 || elements.length === 0) return [];

  const loops = [];
  const adjacency = new Map();

  // Build adjacency list
  connections.forEach(conn => {
    if (!adjacency.has(conn.source)) {
      adjacency.set(conn.source, []);
    }
    adjacency.get(conn.source).push({
      target: conn.target,
      connection: conn,
    });
  });

  // DFS to find all cycles
  const visited = new Set();
  const recursionStack = new Set();
  const path = [];
  const pathConnections = [];

  function dfs(nodeId, startId) {
    if (recursionStack.has(nodeId)) {
      // Found a cycle
      const cycleStartIdx = path.indexOf(nodeId);
      if (cycleStartIdx !== -1) {
        const cyclePath = path.slice(cycleStartIdx);
        const cycleConnections = pathConnections.slice(cycleStartIdx);

        // Calculate loop polarity
        let negativeCount = 0;
        cycleConnections.forEach(conn => {
          if (conn.type === 'negative' || conn.polaritySymbol === '-') {
            negativeCount++;
          }
        });

        const isBalancing = negativeCount % 2 === 1;
        const loopId = `loop_${cyclePath.join('_')}`;

        // Avoid duplicates
        if (!loops.find(l => l.id === loopId)) {
          loops.push({
            id: loopId,
            nodeIds: [...cyclePath, nodeId], // Complete the loop
            connectionIds: cycleConnections.map(c => c.id),
            type: isBalancing ? 'B' : 'R',
            label: isBalancing ? 'Balancing Loop' : 'Reinforcing Loop',
            size: cyclePath.length,
            narrative: '',
          });
        }
      }
      return;
    }

    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const { target, connection } of neighbors) {
      pathConnections.push(connection);
      dfs(target, startId);
      pathConnections.pop();
    }

    path.pop();
    recursionStack.delete(nodeId);
  }

  // Start DFS from each node
  elements.forEach(el => {
    visited.clear();
    recursionStack.clear();
    path.length = 0;
    pathConnections.length = 0;
    dfs(el.id, el.id);
  });

  // Assign names to loops
  return loops.map((loop, idx) => ({
    ...loop,
    name: `${loop.type}${idx + 1}`,
  }));
}

export default function SDLoopInspector({
  elements = [],
  connections = [],
  loops = [],
  onLoopClick,
  onLoopHover,
  onLoopNarrativeChange,
  cyRef,
  isOpen = false,
  onClose,
}) {
  const [sortBy, setSortBy] = useState('type'); // 'type', 'size', 'name'
  const [editingLoop, setEditingLoop] = useState(null);
  const [editNarrative, setEditNarrative] = useState('');

  // Get element labels by ID
  const elementMap = useMemo(() => {
    const map = new Map();
    elements.forEach(el => map.set(el.id, el));
    return map;
  }, [elements]);

  // Sort loops
  const sortedLoops = useMemo(() => {
    const sorted = [...loops];
    switch (sortBy) {
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'size':
        sorted.sort((a, b) => b.size - a.size);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [loops, sortBy]);

  // Focus canvas on loop
  const focusOnLoop = useCallback((loop) => {
    const cy = cyRef?.current;
    if (!cy) return;

    // Get all nodes in the loop
    const loopNodes = cy.nodes().filter(node => loop.nodeIds.includes(node.id()));

    if (loopNodes.length > 0) {
      cy.fit(loopNodes, 80);
    }

    onLoopClick?.(loop);
  }, [cyRef, onLoopClick]);

  // Start editing narrative
  const startEditNarrative = useCallback((loop) => {
    setEditingLoop(loop.id);
    setEditNarrative(loop.narrative || '');
  }, []);

  // Save narrative
  const saveNarrative = useCallback(() => {
    if (editingLoop) {
      onLoopNarrativeChange?.(editingLoop, editNarrative);
      setEditingLoop(null);
      setEditNarrative('');
    }
  }, [editingLoop, editNarrative, onLoopNarrativeChange]);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingLoop(null);
    setEditNarrative('');
  }, []);

  // Get member labels for a loop
  const getLoopMembers = useCallback((loop) => {
    return loop.nodeIds.slice(0, -1).map(id => {
      const el = elementMap.get(id);
      return el?.label || el?.name || id;
    });
  }, [elementMap]);

  if (!isOpen) return null;

  const reinforcingCount = loops.filter(l => l.type === 'R').length;
  const balancingCount = loops.filter(l => l.type === 'B').length;

  return (
    <div className="sd-loop-inspector">
      <div className="inspector-header">
        <LoopIcon fontSize="small" />
        <span className="inspector-title">Loop Inspector</span>
        <button className="inspector-close" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <div className="loop-summary">
        <div className="summary-item reinforcing">
          <TrendingUpIcon fontSize="small" />
          <span>{reinforcingCount} Reinforcing</span>
        </div>
        <div className="summary-item balancing">
          <TrendingDownIcon fontSize="small" />
          <span>{balancingCount} Balancing</span>
        </div>
      </div>

      <div className="sort-controls">
        <SortIcon fontSize="small" />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="type">Sort by Type</option>
          <option value="size">Sort by Size</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div className="loops-list">
        {sortedLoops.length === 0 ? (
          <div className="no-loops">
            <LoopIcon />
            <p>No feedback loops detected</p>
            <p className="hint">Create causal links between variables to form loops</p>
          </div>
        ) : (
          sortedLoops.map(loop => (
            <div
              key={loop.id}
              className={`loop-item ${loop.type === 'R' ? 'reinforcing' : 'balancing'}`}
              onMouseEnter={() => onLoopHover?.(loop)}
              onMouseLeave={() => onLoopHover?.(null)}
            >
              <div className="loop-header">
                <span className={`loop-badge ${loop.type === 'R' ? 'reinforcing' : 'balancing'}`}>
                  {loop.name}
                </span>
                <span className="loop-type">{loop.label}</span>
                <div className="loop-actions">
                  <button onClick={() => focusOnLoop(loop)} title="Focus on loop">
                    <CenterFocusStrongIcon fontSize="small" />
                  </button>
                  <button onClick={() => startEditNarrative(loop)} title="Edit narrative">
                    <EditIcon fontSize="small" />
                  </button>
                </div>
              </div>

              <div className="loop-members">
                {getLoopMembers(loop).map((member, idx) => (
                  <span key={idx} className="member-tag">
                    {member}
                    {idx < getLoopMembers(loop).length - 1 && <span className="arrow">→</span>}
                  </span>
                ))}
                <span className="member-tag loop-back">↻</span>
              </div>

              {editingLoop === loop.id ? (
                <div className="narrative-edit">
                  <textarea
                    value={editNarrative}
                    onChange={e => setEditNarrative(e.target.value)}
                    placeholder="Describe what this loop represents..."
                    rows={3}
                    autoFocus
                  />
                  <div className="narrative-actions">
                    <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                    <button className="btn-save" onClick={saveNarrative}>Save</button>
                  </div>
                </div>
              ) : loop.narrative ? (
                <div className="loop-narrative">
                  {loop.narrative}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .sd-loop-inspector {
          position: absolute;
          top: 60px;
          right: 10px;
          width: 320px;
          max-height: calc(100vh - 180px);
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 200;
          overflow: hidden;
        }

        .inspector-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }

        .inspector-title {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .inspector-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .inspector-close:hover {
          background: var(--border);
          color: var(--text);
        }

        .loop-summary {
          display: flex;
          gap: 12px;
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .summary-item.reinforcing {
          color: #3b82f6;
        }

        .summary-item.balancing {
          color: #ef4444;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-bottom: 1px solid var(--border);
          color: var(--text-muted);
        }

        .sort-controls select {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
        }

        .loops-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }

        .no-loops {
          text-align: center;
          padding: 30px 20px;
          color: var(--text-muted);
        }

        .no-loops :global(svg) {
          font-size: 40px;
          opacity: 0.3;
          margin-bottom: 10px;
        }

        .no-loops p {
          margin: 5px 0;
        }

        .no-loops .hint {
          font-size: 12px;
          opacity: 0.7;
        }

        .loop-item {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 10px;
          transition: all 0.2s;
        }

        .loop-item:hover {
          border-color: var(--accent);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
        }

        .loop-item.reinforcing {
          border-left: 3px solid #3b82f6;
        }

        .loop-item.balancing {
          border-left: 3px solid #ef4444;
        }

        .loop-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .loop-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }

        .loop-badge.reinforcing {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .loop-badge.balancing {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .loop-type {
          flex: 1;
          font-size: 12px;
          color: var(--text-muted);
        }

        .loop-actions {
          display: flex;
          gap: 4px;
        }

        .loop-actions button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .loop-actions button:hover {
          background: var(--border);
          color: var(--accent);
        }

        .loop-members {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 6px;
        }

        .member-tag {
          font-size: 11px;
          padding: 2px 6px;
          background: var(--panel);
          border-radius: 4px;
          color: var(--text);
        }

        .member-tag .arrow {
          color: var(--text-muted);
          margin: 0 2px;
        }

        .member-tag.loop-back {
          color: var(--accent);
          font-weight: bold;
        }

        .loop-narrative {
          font-size: 12px;
          color: var(--text-muted);
          padding: 8px;
          background: var(--panel);
          border-radius: 4px;
          margin-top: 8px;
          line-height: 1.4;
        }

        .narrative-edit {
          margin-top: 8px;
        }

        .narrative-edit textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--panel);
          color: var(--text);
          font-size: 12px;
          resize: vertical;
        }

        .narrative-actions {
          display: flex;
          gap: 8px;
          margin-top: 6px;
          justify-content: flex-end;
        }

        .btn-cancel, .btn-save {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .btn-cancel {
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
        }

        .btn-save {
          border: none;
          background: var(--accent);
          color: white;
        }
      `}</style>
    </div>
  );
}
