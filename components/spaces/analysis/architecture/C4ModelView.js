// components/spaces/analysis/architecture/C4ModelView.js
// C4 Model Viewer/Editor - Three zoom levels: System Context, Container, Component
// Pure SVG interactive diagram with drag, pan, zoom, selection, and connection rendering

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import PersonIcon from '@mui/icons-material/Person';
import StorageIcon from '@mui/icons-material/Storage';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import WidgetsIcon from '@mui/icons-material/Widgets';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LinkIcon from '@mui/icons-material/Link';

// ============ CONSTANTS ============

const C4_LEVELS = {
  context: { label: 'System Context', description: 'High-level systems and actors' },
  container: { label: 'Container', description: 'Applications, data stores, services' },
  component: { label: 'Component', description: 'Components within containers' },
};

const C4_ELEMENT_TYPES = {
  Person: { color: '#ec4899', textColor: '#fff', shape: 'person', label: 'Person' },
  System: { color: '#3b82f6', textColor: '#fff', shape: 'box', label: 'System' },
  ExternalSystem: { color: '#94a3b8', textColor: '#fff', shape: 'box', label: 'External System' },
  Container: { color: '#6366f1', textColor: '#fff', shape: 'box', label: 'Container' },
  Component: { color: '#8b5cf6', textColor: '#fff', shape: 'box', label: 'Component' },
  Database: { color: '#14b8a6', textColor: '#fff', shape: 'cylinder', label: 'Database' },
};

const DEFAULT_NODE_SIZE = { context: { w: 200, h: 120 }, container: { w: 180, h: 100 }, component: { w: 160, h: 90 } };

// ============ SVG NODE RENDERERS ============

function PersonShape({ x, y, w, h, color, selected }) {
  const headR = 16;
  const cx = x + w / 2;
  const bodyTop = y + 10 + headR * 2;
  return (
    <g>
      {selected && (
        <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={8}
          fill="none" stroke="#47453F" strokeWidth={2} strokeDasharray="6 3" />
      )}
      <rect x={x} y={bodyTop} width={w} height={h - 10 - headR * 2}
        rx={4} fill={color} stroke="rgba(31,30,27,0.2)" strokeWidth={1} />
      <circle cx={cx} cy={y + 10 + headR} r={headR} fill={color}
        stroke="rgba(31,30,27,0.2)" strokeWidth={1} />
    </g>
  );
}

function BoxShape({ x, y, w, h, color, selected, dashed }) {
  return (
    <g>
      {selected && (
        <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={8}
          fill="none" stroke="#47453F" strokeWidth={2} strokeDasharray="6 3" />
      )}
      <rect x={x} y={y} width={w} height={h} rx={4} fill={color}
        stroke={dashed ? 'rgba(31,30,27,0.3)' : 'rgba(31,30,27,0.15)'}
        strokeWidth={dashed ? 2 : 1}
        strokeDasharray={dashed ? '8 4' : 'none'} />
    </g>
  );
}

function CylinderShape({ x, y, w, h, color, selected }) {
  const ellipseH = 12;
  return (
    <g>
      {selected && (
        <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={8}
          fill="none" stroke="#47453F" strokeWidth={2} strokeDasharray="6 3" />
      )}
      <path
        d={`M ${x} ${y + ellipseH} L ${x} ${y + h - ellipseH} Q ${x} ${y + h + ellipseH / 2} ${x + w / 2} ${y + h} Q ${x + w} ${y + h + ellipseH / 2} ${x + w} ${y + h - ellipseH} L ${x + w} ${y + ellipseH}`}
        fill={color} stroke="rgba(31,30,27,0.15)" strokeWidth={1}
      />
      <ellipse cx={x + w / 2} cy={y + ellipseH} rx={w / 2} ry={ellipseH}
        fill={color} stroke="rgba(31,30,27,0.15)" strokeWidth={1} />
      <ellipse cx={x + w / 2} cy={y + ellipseH} rx={w / 2} ry={ellipseH}
        fill="rgba(255,255,255,0.15)" stroke="none" />
    </g>
  );
}

function C4Node({ node, selected, onMouseDown, onSelect, level }) {
  const typeConfig = C4_ELEMENT_TYPES[node.c4Type] || C4_ELEMENT_TYPES.System;
  const size = DEFAULT_NODE_SIZE[level] || DEFAULT_NODE_SIZE.context;
  const w = node.w || size.w;
  const h = node.h || size.h;
  const x = node.x || 0;
  const y = node.y || 0;

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(node.id);
    onMouseDown(e, node.id);
  };

  const renderShape = () => {
    switch (typeConfig.shape) {
      case 'person':
        return <PersonShape x={x} y={y} w={w} h={h} color={typeConfig.color} selected={selected} />;
      case 'cylinder':
        return <CylinderShape x={x} y={y} w={w} h={h} color={typeConfig.color} selected={selected} />;
      default:
        return <BoxShape x={x} y={y} w={w} h={h} color={typeConfig.color}
          selected={selected} dashed={node.c4Type === 'ExternalSystem'} />;
    }
  };

  const textY = typeConfig.shape === 'person' ? y + h * 0.55 : y + h * 0.35;

  return (
    <g className="c4-node" style={{ cursor: 'grab' }} onMouseDown={handleMouseDown}>
      {renderShape()}
      <text x={x + w / 2} y={textY} textAnchor="middle" fill={typeConfig.textColor}
        fontSize={13} fontWeight={600} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {truncateText(node.name, w - 20, 13)}
      </text>
      {node.technology && (
        <text x={x + w / 2} y={textY + 18} textAnchor="middle" fill="rgba(255,255,255,0.8)"
          fontSize={10} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          [{node.technology}]
        </text>
      )}
      <text x={x + w / 2} y={textY + (node.technology ? 34 : 18)} textAnchor="middle"
        fill="rgba(255,255,255,0.6)" fontSize={9}
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {typeConfig.label}
      </text>
    </g>
  );
}

function truncateText(text, maxWidth, fontSize) {
  if (!text) return '';
  const charWidth = fontSize * 0.55;
  const maxChars = Math.floor(maxWidth / charWidth);
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '\u2026';
}

// ============ CONNECTION LINE ============

function ConnectionLine({ from, to, label, nodes }) {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);
  if (!fromNode || !toNode) return null;

  const fW = fromNode.w || 200;
  const fH = fromNode.h || 120;
  const tW = toNode.w || 200;
  const tH = toNode.h || 120;

  const x1 = (fromNode.x || 0) + fW / 2;
  const y1 = (fromNode.y || 0) + fH / 2;
  const x2 = (toNode.x || 0) + tW / 2;
  const y2 = (toNode.y || 0) + tH / 2;

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLen = 10;
  const ax1 = x2 - arrowLen * Math.cos(angle - Math.PI / 7);
  const ay1 = y2 - arrowLen * Math.sin(angle - Math.PI / 7);
  const ax2 = x2 - arrowLen * Math.cos(angle + Math.PI / 7);
  const ay2 = y2 - arrowLen * Math.sin(angle + Math.PI / 7);

  return (
    <g className="c4-connection">
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#9C9A94" strokeWidth={1.5} />
      <polygon points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} fill="#9C9A94" />
      {label && (
        <g>
          <rect x={mx - 40} y={my - 10} width={80} height={20} rx={3}
            fill="#FDFCFA" stroke="#E2E0DB" strokeWidth={1} />
          <text x={mx} y={my + 4} textAnchor="middle" fill="#5C5A54" fontSize={10}>
            {truncateText(label, 70, 10)}
          </text>
        </g>
      )}
    </g>
  );
}

// ============ BOUNDARY GROUP ============

function BoundaryGroup({ parentNode, childNodes, level }) {
  if (!parentNode || childNodes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  childNodes.forEach(n => {
    const x = n.x || 0;
    const y = n.y || 0;
    const w = n.w || 180;
    const h = n.h || 100;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });

  const pad = 30;
  return (
    <g className="c4-boundary">
      <rect
        x={minX - pad} y={minY - pad - 20}
        width={maxX - minX + pad * 2} height={maxY - minY + pad * 2 + 20}
        rx={6} fill="none"
        stroke="#9C9A94" strokeWidth={1.5} strokeDasharray="10 5"
      />
      <text x={minX - pad + 10} y={minY - pad - 6} fill="#5C5A54" fontSize={12} fontWeight={600}>
        {parentNode.name} [boundary]
      </text>
    </g>
  );
}

// ============ INLINE ADD FORM ============

function InlineAddForm({ level, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [c4Type, setC4Type] = useState(level === 'context' ? 'System' : level === 'container' ? 'Container' : 'Component');
  const [technology, setTechnology] = useState('');

  const allowedTypes = useMemo(() => {
    switch (level) {
      case 'context': return ['Person', 'System', 'ExternalSystem'];
      case 'container': return ['Container', 'Database', 'ExternalSystem'];
      case 'component': return ['Component'];
      default: return Object.keys(C4_ELEMENT_TYPES);
    }
  }, [level]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), c4Type, technology: technology.trim() || undefined });
    setName('');
    setTechnology('');
  };

  return (
    <div className="c4-inline-form">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <select value={c4Type} onChange={(e) => setC4Type(e.target.value)}>
            {allowedTypes.map(t => (
              <option key={t} value={t}>{C4_ELEMENT_TYPES[t].label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Element name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            type="text"
            placeholder="Technology (optional)"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
          />
          <button type="submit" className="btn-primary-sm">
            <AddIcon fontSize="small" />
          </button>
          <button type="button" className="btn-cancel-sm" onClick={onCancel}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </form>

      <style jsx>{`
        .c4-inline-form {
          padding: 8px 12px;
          background: #F0EFEC;
          border-bottom: 1px solid #E2E0DB;
        }
        .form-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .form-row select,
        .form-row input {
          padding: 6px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 13px;
          background: #FDFCFA;
          color: #1F1E1B;
        }
        .form-row input { flex: 1; }
        .form-row select { min-width: 140px; }
        .btn-primary-sm {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 120ms ease-out;
        }
        .btn-primary-sm:hover { background: #35332F; }
        .btn-cancel-sm {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: transparent;
          color: #9C9A94;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-cancel-sm:hover { color: #A54D4D; border-color: #A54D4D; }
      `}</style>
    </div>
  );
}

// ============ PROPERTIES PANEL ============

function PropertiesPanel({ node, onUpdate, onDelete, onClose, onStartConnection, components }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: node?.name || '',
    description: node?.description || '',
    technology: node?.technology || '',
    c4Type: node?.c4Type || 'System',
    parentId: node?.parentId || '',
  });

  useEffect(() => {
    setFormData({
      name: node?.name || '',
      description: node?.description || '',
      technology: node?.technology || '',
      c4Type: node?.c4Type || 'System',
      parentId: node?.parentId || '',
    });
    setEditing(false);
  }, [node?.id]);

  if (!node) return null;

  const handleSave = () => {
    onUpdate(node.id, {
      name: formData.name,
      metadata: {
        ...node.metadata,
        c4Type: formData.c4Type,
        technology: formData.technology,
        parentId: formData.parentId,
        description: formData.description,
      },
    });
    setEditing(false);
  };

  const typeConfig = C4_ELEMENT_TYPES[node.c4Type] || C4_ELEMENT_TYPES.System;

  return (
    <div className="c4-properties">
      <div className="props-header">
        <div className="props-title-row">
          <span className="props-type-badge" style={{ background: typeConfig.color, color: typeConfig.textColor }}>
            {typeConfig.label}
          </span>
          <button className="props-close" onClick={onClose}><CloseIcon fontSize="small" /></button>
        </div>
      </div>

      <div className="props-body">
        {editing ? (
          <div className="props-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={formData.c4Type}
                onChange={(e) => setFormData(p => ({ ...p, c4Type: e.target.value }))}>
                {Object.entries(C4_ELEMENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Technology</label>
              <input type="text" value={formData.technology}
                onChange={(e) => setFormData(p => ({ ...p, technology: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Parent (Container/System)</label>
              <select value={formData.parentId}
                onChange={(e) => setFormData(p => ({ ...p, parentId: e.target.value }))}>
                <option value="">None</option>
                {components.filter(c => c.id !== node.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} rows={3}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="props-actions">
              <button className="btn-primary-sm" onClick={handleSave}>
                <SaveIcon fontSize="small" /> Save
              </button>
              <button className="btn-cancel-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="props-detail">
            <h3 className="props-name">{node.name}</h3>
            {node.technology && <p className="props-tech">[{node.technology}]</p>}
            {node.description && <p className="props-desc">{node.description}</p>}
            <div className="props-actions">
              <button className="btn-icon" onClick={() => setEditing(true)} title="Edit">
                <EditIcon fontSize="small" />
              </button>
              <button className="btn-icon" onClick={() => onStartConnection(node.id)} title="Draw connection">
                <LinkIcon fontSize="small" />
              </button>
              <button className="btn-icon danger" onClick={() => onDelete(node.id)} title="Delete">
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .c4-properties {
          width: 280px;
          border-left: 1px solid #E2E0DB;
          background: #F0EFEC;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .props-header {
          padding: 12px;
          border-bottom: 1px solid #E2E0DB;
        }
        .props-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .props-type-badge {
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .props-close {
          background: none;
          border: none;
          color: #9C9A94;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        .props-close:hover { color: #1F1E1B; background: #E2E0DB; }
        .props-body { padding: 12px; flex: 1; }
        .props-name { font-size: 16px; font-weight: 600; color: #1F1E1B; margin: 0 0 4px; }
        .props-tech { font-size: 12px; color: #5C5A54; margin: 0 0 8px; }
        .props-desc { font-size: 13px; color: #5C5A54; line-height: 1.5; margin: 0 0 12px; }
        .props-form .form-group { margin-bottom: 10px; }
        .props-form label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #5C5A54;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .props-form input, .props-form select, .props-form textarea {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 13px;
          background: #FDFCFA;
          color: #1F1E1B;
          box-sizing: border-box;
        }
        .props-form textarea { resize: vertical; font-family: inherit; }
        .props-actions {
          display: flex;
          gap: 6px;
          margin-top: 12px;
        }
        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          cursor: pointer;
          color: #5C5A54;
          transition: all 120ms ease-out;
        }
        .btn-icon:hover { background: #E2E0DB; color: #1F1E1B; transform: translateY(-1px); }
        .btn-icon.danger:hover { color: #A54D4D; border-color: #A54D4D; }
        .btn-primary-sm {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: background 120ms ease-out;
        }
        .btn-primary-sm:hover { background: #35332F; }
        .btn-cancel-sm {
          padding: 6px 12px;
          background: transparent;
          color: #5C5A54;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

// ============ MAIN C4 MODEL VIEW ============

export default function C4ModelView() {
  const {
    artefacts,
    relationships,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    createRelationship,
    deleteRelationship,
    getArtefactsByType,
  } = useAnalysis();

  const svgRef = useRef(null);
  const [activeLevel, setActiveLevel] = useState('context');
  const [viewBox, setViewBox] = useState({ x: -50, y: -50, w: 1200, h: 800 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [panning, setPanning] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);

  // Build nodes from Component artefacts
  const allComponents = useMemo(() => getArtefactsByType('Component'), [getArtefactsByType]);

  const nodes = useMemo(() => {
    return allComponents.map((art, idx) => {
      const meta = art.metadata || {};
      const c4Level = meta.c4_level || meta.c4Level || 'System';
      const levelMap = { System: 'context', Container: 'container', Component: 'component' };
      return {
        id: art.id,
        name: art.name,
        description: art.description || meta.description || '',
        c4Type: meta.c4Type || c4Level,
        c4Level: levelMap[c4Level] || 'context',
        technology: meta.technology || '',
        parentId: meta.parentId || art.parent_id || '',
        x: meta.posX ?? (100 + (idx % 4) * 260),
        y: meta.posY ?? (80 + Math.floor(idx / 4) * 200),
        w: meta.posW,
        h: meta.posH,
        metadata: meta,
      };
    });
  }, [allComponents]);

  // Filter nodes by active level
  const visibleNodes = useMemo(() => {
    return nodes.filter(n => {
      if (activeLevel === 'context') {
        return ['System', 'ExternalSystem', 'Person'].includes(n.c4Type) || n.c4Level === 'context';
      }
      if (activeLevel === 'container') {
        return ['Container', 'Database', 'ExternalSystem'].includes(n.c4Type) || n.c4Level === 'container';
      }
      return n.c4Type === 'Component' || n.c4Level === 'component';
    });
  }, [nodes, activeLevel]);

  // Build connections from relationships
  const connections = useMemo(() => {
    const nodeIds = new Set(visibleNodes.map(n => n.id));
    return relationships
      .filter(r => nodeIds.has(r.from) && nodeIds.has(r.to))
      .map(r => ({
        id: r.id,
        from: r.from,
        to: r.to,
        label: r.relationship_type || r.name || '',
      }));
  }, [relationships, visibleNodes]);

  // Boundary groups
  const boundaries = useMemo(() => {
    const groups = {};
    visibleNodes.forEach(n => {
      if (n.parentId) {
        if (!groups[n.parentId]) groups[n.parentId] = [];
        groups[n.parentId].push(n);
      }
    });
    return Object.entries(groups).map(([parentId, children]) => {
      const parentNode = nodes.find(n => n.id === parentId);
      return { parentNode, childNodes: children };
    }).filter(b => b.parentNode);
  }, [visibleNodes, nodes]);

  const selectedNode = useMemo(
    () => visibleNodes.find(n => n.id === selectedNodeId),
    [visibleNodes, selectedNodeId]
  );

  // ---- EVENT HANDLERS ----

  const handleNodeMouseDown = useCallback((e, nodeId) => {
    if (connectingFrom) {
      // Complete connection
      if (connectingFrom !== nodeId) {
        createRelationship({
          from: connectingFrom,
          to: nodeId,
          relationship_type: 'uses',
        });
      }
      setConnectingFrom(null);
      return;
    }
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.w / svgRect.width;
    const scaleY = viewBox.h / svgRect.height;
    setDragging({
      nodeId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: visibleNodes.find(n => n.id === nodeId)?.x || 0,
      startNodeY: visibleNodes.find(n => n.id === nodeId)?.y || 0,
      scaleX,
      scaleY,
    });
  }, [connectingFrom, viewBox, visibleNodes, createRelationship]);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'svg' || e.target.classList?.contains?.('c4-bg')) {
      setSelectedNodeId(null);
      setConnectingFrom(null);
      setPanning({
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startViewX: viewBox.x,
        startViewY: viewBox.y,
      });
    }
  }, [viewBox]);

  const handleMouseMove = useCallback((e) => {
    if (dragging) {
      const dx = (e.clientX - dragging.startMouseX) * dragging.scaleX;
      const dy = (e.clientY - dragging.startMouseY) * dragging.scaleY;
      const node = allComponents.find(a => a.id === dragging.nodeId);
      if (node) {
        const meta = node.metadata || {};
        updateArtefact(dragging.nodeId, {
          metadata: {
            ...meta,
            posX: Math.round(dragging.startNodeX + dx),
            posY: Math.round(dragging.startNodeY + dy),
          },
        });
      }
    } else if (panning) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const scaleX = viewBox.w / svgRect.width;
      const scaleY = viewBox.h / svgRect.height;
      const dx = (e.clientX - panning.startMouseX) * scaleX;
      const dy = (e.clientY - panning.startMouseY) * scaleY;
      setViewBox(prev => ({
        ...prev,
        x: panning.startViewX - dx,
        y: panning.startViewY - dy,
      }));
    }
  }, [dragging, panning, allComponents, updateArtefact, viewBox]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setPanning(null);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const svgRect = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - svgRect.left) / svgRect.width) * viewBox.w + viewBox.x;
    const my = ((e.clientY - svgRect.top) / svgRect.height) * viewBox.h + viewBox.y;

    setViewBox(prev => {
      const newW = prev.w * factor;
      const newH = prev.h * factor;
      return {
        x: mx - (mx - prev.x) * factor,
        y: my - (my - prev.y) * factor,
        w: newW,
        h: newH,
      };
    });
  }, [viewBox]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ---- ACTIONS ----

  const handleAddElement = useCallback(async ({ name, c4Type, technology }) => {
    const c4LevelMap = {
      Person: 'System', System: 'System', ExternalSystem: 'System',
      Container: 'Container', Database: 'Container',
      Component: 'Component',
    };
    const count = visibleNodes.length;
    await createArtefact('Component', {
      name,
      metadata: {
        c4Type,
        c4_level: c4LevelMap[c4Type] || 'System',
        technology: technology || '',
        posX: 100 + (count % 4) * 260,
        posY: 80 + Math.floor(count / 4) * 200,
      },
    });
    setShowAddForm(false);
  }, [createArtefact, visibleNodes.length]);

  const handleDeleteNode = useCallback(async (nodeId) => {
    await deleteArtefact(nodeId);
    setSelectedNodeId(null);
  }, [deleteArtefact]);

  const handleUpdateNode = useCallback(async (nodeId, data) => {
    await updateArtefact(nodeId, data);
  }, [updateArtefact]);

  const handleZoom = useCallback((direction) => {
    const factor = direction === 'in' ? 0.8 : 1.25;
    setViewBox(prev => ({
      x: prev.x + prev.w * (1 - factor) / 2,
      y: prev.y + prev.h * (1 - factor) / 2,
      w: prev.w * factor,
      h: prev.h * factor,
    }));
  }, []);

  const handleFitAll = useCallback(() => {
    if (visibleNodes.length === 0) {
      setViewBox({ x: -50, y: -50, w: 1200, h: 800 });
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    visibleNodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + (n.w || 200));
      maxY = Math.max(maxY, n.y + (n.h || 120));
    });
    const pad = 80;
    setViewBox({
      x: minX - pad,
      y: minY - pad,
      w: maxX - minX + pad * 2,
      h: maxY - minY + pad * 2,
    });
  }, [visibleNodes]);

  return (
    <div className="c4-model-view">
      {/* Toolbar */}
      <div className="c4-toolbar">
        <div className="c4-level-tabs">
          {Object.entries(C4_LEVELS).map(([key, level]) => (
            <button
              key={key}
              className={`level-tab ${activeLevel === key ? 'active' : ''}`}
              onClick={() => setActiveLevel(key)}
            >
              {level.label}
            </button>
          ))}
        </div>

        <div className="c4-toolbar-actions">
          <button className="toolbar-btn" onClick={() => setShowAddForm(!showAddForm)} title="Add element">
            <AddIcon fontSize="small" />
            <span>Add {C4_LEVELS[activeLevel]?.label?.split(' ').pop()}</span>
          </button>

          <div className="toolbar-divider" />

          <button className="toolbar-btn icon-only" onClick={() => handleZoom('in')} title="Zoom in">
            <ZoomInIcon fontSize="small" />
          </button>
          <button className="toolbar-btn icon-only" onClick={() => handleZoom('out')} title="Zoom out">
            <ZoomOutIcon fontSize="small" />
          </button>
          <button className="toolbar-btn icon-only" onClick={handleFitAll} title="Fit all">
            <FitScreenIcon fontSize="small" />
          </button>
        </div>
      </div>

      {showAddForm && (
        <InlineAddForm
          level={activeLevel}
          onSubmit={handleAddElement}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {connectingFrom && (
        <div className="c4-connecting-banner">
          Drawing connection from <strong>{visibleNodes.find(n => n.id === connectingFrom)?.name}</strong> - click a target node or press Escape
          <button onClick={() => setConnectingFrom(null)}>Cancel</button>
        </div>
      )}

      {/* Main canvas area */}
      <div className="c4-canvas-wrapper">
        <div className="c4-canvas-area">
          <svg
            ref={svgRef}
            className="c4-svg"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background grid */}
            <defs>
              <pattern id="c4-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E0DB" strokeWidth={0.5} />
              </pattern>
            </defs>
            <rect className="c4-bg" x={viewBox.x - 2000} y={viewBox.y - 2000}
              width={viewBox.w + 4000} height={viewBox.h + 4000}
              fill="url(#c4-grid)" />

            {/* Boundaries */}
            {boundaries.map((b, i) => (
              <BoundaryGroup key={i} parentNode={b.parentNode} childNodes={b.childNodes} level={activeLevel} />
            ))}

            {/* Connections */}
            {connections.map(conn => (
              <ConnectionLine key={conn.id} from={conn.from} to={conn.to}
                label={conn.label} nodes={visibleNodes} />
            ))}

            {/* Nodes */}
            {visibleNodes.map(node => (
              <C4Node
                key={node.id}
                node={node}
                level={activeLevel}
                selected={selectedNodeId === node.id}
                onMouseDown={handleNodeMouseDown}
                onSelect={setSelectedNodeId}
              />
            ))}
          </svg>

          {visibleNodes.length === 0 && (
            <div className="c4-empty-overlay">
              <ViewModuleIcon style={{ fontSize: 48, color: '#9C9A94' }} />
              <h3>No {C4_LEVELS[activeLevel]?.label} Elements</h3>
              <p>Add elements to build your C4 {activeLevel} diagram.</p>
              <button className="btn-primary" onClick={() => setShowAddForm(true)}>
                <AddIcon fontSize="small" />
                Add First Element
              </button>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
            onStartConnection={setConnectingFrom}
            components={allComponents}
          />
        )}
      </div>

      <style jsx>{`
        .c4-model-view {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FDFCFA;
          border-radius: 4px;
          overflow: hidden;
        }
        .c4-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #F0EFEC;
          border-bottom: 1px solid #E2E0DB;
        }
        .c4-level-tabs {
          display: flex;
          gap: 2px;
          background: #E2E0DB;
          border-radius: 4px;
          padding: 2px;
        }
        .level-tab {
          padding: 6px 16px;
          border: none;
          background: transparent;
          color: #5C5A54;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 3px;
          transition: all 120ms ease-out;
        }
        .level-tab:hover { color: #1F1E1B; }
        .level-tab.active {
          background: #FDFCFA;
          color: #1F1E1B;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(31,30,27,0.1);
        }
        .c4-toolbar-actions {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid #E2E0DB;
          background: #FDFCFA;
          color: #5C5A54;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 120ms ease-out;
        }
        .toolbar-btn:hover {
          background: #E2E0DB;
          color: #1F1E1B;
          transform: translateY(-1px);
        }
        .toolbar-btn.icon-only { padding: 6px; }
        .toolbar-btn span { white-space: nowrap; }
        .toolbar-divider {
          width: 1px;
          height: 20px;
          background: #E2E0DB;
          margin: 0 4px;
        }
        .c4-connecting-banner {
          padding: 8px 16px;
          background: #f59e0b;
          color: #1F1E1B;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .c4-connecting-banner button {
          margin-left: auto;
          padding: 3px 10px;
          border: 1px solid rgba(31,30,27,0.3);
          background: rgba(255,255,255,0.5);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .c4-canvas-wrapper {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        .c4-canvas-area {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        .c4-svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .c4-empty-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(253,252,250,0.85);
          pointer-events: none;
        }
        .c4-empty-overlay h3 {
          margin: 0;
          font-size: 18px;
          color: #1F1E1B;
        }
        .c4-empty-overlay p {
          margin: 0;
          color: #5C5A54;
          font-size: 14px;
        }
        .c4-empty-overlay .btn-primary {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          margin-top: 8px;
          transition: background 120ms ease-out;
        }
        .c4-empty-overlay .btn-primary:hover {
          background: #35332F;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export { C4Node, ConnectionLine, BoundaryGroup, InlineAddForm, PropertiesPanel, C4_ELEMENT_TYPES, C4_LEVELS };
