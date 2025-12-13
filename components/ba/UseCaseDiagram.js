// components/ba/UseCaseDiagram.js
// UML Use Case Diagram Builder with database persistence, pan/zoom, auto-save
// Shows actors, use cases with flow steps, and relationships (include, extend, generalization)

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import RestoreIcon from '@mui/icons-material/Restore';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import PanToolIcon from '@mui/icons-material/PanTool';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Auto-save delay in milliseconds
const AUTO_SAVE_DELAY = 2000;

// ============ RELATIONSHIP TYPES ============
const UC_RELATIONSHIP_TYPES = {
  association: {
    id: 'association',
    name: 'Association',
    description: 'Actor participates in use case',
    lineStyle: 'solid',
    color: '#374151',
    hasArrow: false,
  },
  include: {
    id: 'include',
    name: '<<include>>',
    description: 'Base use case always includes another',
    lineStyle: 'dashed',
    color: '#3b82f6',
    hasArrow: true,
    label: '<<include>>',
  },
  extend: {
    id: 'extend',
    name: '<<extend>>',
    description: 'Use case optionally extends another',
    lineStyle: 'dashed',
    color: '#22c55e',
    hasArrow: true,
    label: '<<extend>>',
  },
  generalization: {
    id: 'generalization',
    name: 'Generalization',
    description: 'Actor or use case inherits from another',
    lineStyle: 'solid',
    color: '#8b5cf6',
    hasArrow: true,
    arrowType: 'triangle',
  },
};

// ============ ACTOR FIGURE (STICK FIGURE) ============
function ActorFigure({ actor, position, isSelected, onSelect, onDragStart, scale = 1 }) {
  const height = 60 * scale;
  const headRadius = 10 * scale;
  const bodyLength = 20 * scale;
  const armSpan = 24 * scale;
  const legSpan = 20 * scale;

  return (
    <g
      className={`uc-actor ${isSelected ? 'selected' : ''}`}
      transform={`translate(${position.x}, ${position.y})`}
      onClick={(e) => { e.stopPropagation(); onSelect(actor); }}
      onMouseDown={(e) => onDragStart(e, actor, 'actor')}
      style={{ cursor: 'grab' }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={-armSpan / 2 - 8}
          y={-headRadius - 8}
          width={armSpan + 16}
          height={height + 30}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 2"
          rx={4}
        />
      )}

      {/* Head */}
      <circle cx={0} cy={0} r={headRadius} fill="white" stroke="#374151" strokeWidth={2} />
      {/* Body */}
      <line x1={0} y1={headRadius} x2={0} y2={headRadius + bodyLength} stroke="#374151" strokeWidth={2} />
      {/* Arms */}
      <line x1={-armSpan / 2} y1={headRadius + bodyLength * 0.4} x2={armSpan / 2} y2={headRadius + bodyLength * 0.4} stroke="#374151" strokeWidth={2} />
      {/* Left leg */}
      <line x1={0} y1={headRadius + bodyLength} x2={-legSpan / 2} y2={headRadius + bodyLength + legSpan} stroke="#374151" strokeWidth={2} />
      {/* Right leg */}
      <line x1={0} y1={headRadius + bodyLength} x2={legSpan / 2} y2={headRadius + bodyLength + legSpan} stroke="#374151" strokeWidth={2} />
      {/* Label */}
      <text x={0} y={height + 15} textAnchor="middle" fill="#1f2937" fontSize={12 * scale} fontWeight="500" fontFamily="Inter, sans-serif">
        {actor.name}
      </text>
    </g>
  );
}

// ============ USE CASE ELLIPSE WITH FLOW STEPS ============
function UseCaseEllipse({ useCase, position, isSelected, onSelect, onDragStart, showSteps = false, scale = 1 }) {
  const width = 140 * scale;
  const height = 60 * scale;

  // Calculate text wrapping
  const maxCharsPerLine = 20;
  const lines = [];
  const words = useCase.name.split(' ');
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  // Parse flow steps - handle both array and legacy string format
  const flowSteps = useMemo(() => {
    if (!useCase.mainFlow) return [];
    if (Array.isArray(useCase.mainFlow)) {
      return useCase.mainFlow.map((step, i) => ({ num: i + 1, text: step }));
    }
    // Legacy string format
    return useCase.mainFlow.split('\n').filter(s => s.trim()).map((step, i) => {
      const cleaned = step.replace(/^\d+[\.\)]\s*/, '').trim();
      return { num: i + 1, text: cleaned };
    });
  }, [useCase.mainFlow]);

  return (
    <g
      className={`uc-usecase ${isSelected ? 'selected' : ''}`}
      transform={`translate(${position.x}, ${position.y})`}
      onClick={(e) => { e.stopPropagation(); onSelect(useCase); }}
      onMouseDown={(e) => onDragStart(e, useCase, 'usecase')}
      style={{ cursor: 'grab' }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <ellipse cx={0} cy={0} rx={width / 2 + 6} ry={height / 2 + 6} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 2" />
      )}

      {/* Main ellipse */}
      <ellipse cx={0} cy={0} rx={width / 2} ry={height / 2} fill="white" stroke={isSelected ? '#3b82f6' : '#374151'} strokeWidth={2} />

      {/* Label - multiline */}
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={(i - (lines.length - 1) / 2) * 14 * scale}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1f2937"
          fontSize={11 * scale}
          fontWeight="500"
          fontFamily="Inter, sans-serif"
        >
          {line}
        </text>
      ))}

      {/* Flow steps indicator badge */}
      {flowSteps.length > 0 && (
        <g transform={`translate(${width / 2 - 10}, ${-height / 2 - 5})`}>
          <circle r={10} fill="#3b82f6" />
          <text x={0} y={4} textAnchor="middle" fill="white" fontSize={10} fontWeight="600">{flowSteps.length}</text>
        </g>
      )}

      {/* Show flow steps when selected */}
      {isSelected && showSteps && flowSteps.length > 0 && (
        <g transform={`translate(${width / 2 + 20}, ${-height / 2})`}>
          <rect
            x={0}
            y={0}
            width={200}
            height={flowSteps.length * 20 + 30}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth={1}
            rx={6}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          <text x={10} y={18} fill="#374151" fontSize={11} fontWeight="600">Flow Steps:</text>
          {flowSteps.slice(0, 8).map((step, i) => (
            <g key={i} transform={`translate(10, ${30 + i * 20})`}>
              <circle cx={6} cy={-3} r={8} fill="#3b82f6" />
              <text x={6} y={1} textAnchor="middle" fill="white" fontSize={9} fontWeight="600">{step.num}</text>
              <text x={20} y={0} fill="#4b5563" fontSize={10}>
                {step.text.length > 22 ? step.text.slice(0, 22) + '...' : step.text}
              </text>
            </g>
          ))}
          {flowSteps.length > 8 && (
            <text x={10} y={30 + 8 * 20} fill="#6b7280" fontSize={10} fontStyle="italic">
              +{flowSteps.length - 8} more steps...
            </text>
          )}
        </g>
      )}
    </g>
  );
}

// ============ SYSTEM BOUNDARY ============
function SystemBoundary({ name, bounds, scale = 1 }) {
  const padding = 40;

  return (
    <g className="uc-system-boundary">
      <rect
        x={bounds.x - padding}
        y={bounds.y - padding - 20}
        width={bounds.width + padding * 2}
        height={bounds.height + padding * 2 + 20}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={2}
        rx={8}
      />
      <text
        x={bounds.x + bounds.width / 2}
        y={bounds.y - padding - 5}
        textAnchor="middle"
        fill="#475569"
        fontSize={14 * scale}
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {name}
      </text>
    </g>
  );
}

// ============ RELATIONSHIP LINE ============
function RelationshipLine({ relationship, fromPos, toPos, fromType, toType }) {
  const relType = UC_RELATIONSHIP_TYPES[relationship.type] || UC_RELATIONSHIP_TYPES.association;

  const getEdgePoint = (center, target, shapeType) => {
    const dx = target.x - center.x;
    const dy = target.y - center.y;
    const angle = Math.atan2(dy, dx);

    if (shapeType === 'actor') {
      const radius = 35;
      return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
    } else {
      const a = 70;
      const b = 30;
      const r = (a * b) / Math.sqrt(b * b * Math.cos(angle) ** 2 + a * a * Math.sin(angle) ** 2);
      return { x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r };
    }
  };

  const startPoint = getEdgePoint(fromPos, toPos, fromType);
  const endPoint = getEdgePoint(toPos, fromPos, toType);
  const midX = (startPoint.x + endPoint.x) / 2;
  const midY = (startPoint.y + endPoint.y) / 2;
  const markerId = `arrow-${relationship.id}`;

  return (
    <g className="uc-relationship">
      <defs>
        {relType.hasArrow && relType.arrowType === 'triangle' ? (
          <marker id={markerId} markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 Z" fill="white" stroke={relType.color} strokeWidth={1} />
          </marker>
        ) : relType.hasArrow ? (
          <marker id={markerId} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10" fill="none" stroke={relType.color} strokeWidth={2} />
          </marker>
        ) : null}
      </defs>

      <line
        x1={startPoint.x} y1={startPoint.y}
        x2={endPoint.x} y2={endPoint.y}
        stroke={relType.color}
        strokeWidth={2}
        strokeDasharray={relType.lineStyle === 'dashed' ? '6 4' : 'none'}
        markerEnd={relType.hasArrow ? `url(#${markerId})` : undefined}
      />

      {relType.label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect x={-40} y={-10} width={80} height={20} fill="white" stroke="none" />
          <text x={0} y={4} textAnchor="middle" fill={relType.color} fontSize={10} fontStyle="italic" fontFamily="Inter, sans-serif">
            {relType.label}
          </text>
        </g>
      )}
    </g>
  );
}

// ============ LIST ITEM COMPONENT ============
function ListItemField({ items, onUpdate, placeholder, numbered = false }) {
  const addItem = () => {
    onUpdate([...items, '']);
  };

  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onUpdate(newItems);
  };

  const removeItem = (index) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onUpdate(newItems);
  };

  return (
    <div className="list-field">
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
          {numbered && (
            <span style={{
              minWidth: '28px',
              height: '28px',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              marginTop: '4px'
            }}>
              {index + 1}
            </span>
          )}
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
            style={{ flex: 1 }}
          />
          <div style={{ display: 'flex', gap: '2px' }}>
            {numbered && (
              <>
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  style={{ padding: '4px 6px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.5 : 1 }}
                  title="Move up"
                >↑</button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  style={{ padding: '4px 6px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', cursor: index === items.length - 1 ? 'not-allowed' : 'pointer', opacity: index === items.length - 1 ? 0.5 : 1 }}
                  title="Move down"
                >↓</button>
              </>
            )}
            <button
              type="button"
              onClick={() => removeItem(index)}
              style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}
              title="Remove"
            >×</button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          background: 'var(--bg)',
          border: '1px dashed var(--border)',
          borderRadius: '6px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        + Add {numbered ? 'Step' : 'Item'}
      </button>
    </div>
  );
}

// ============ ALTERNATIVE FLOW COMPONENT ============
function AlternativeFlowField({ altFlows, mainFlowSteps, onUpdate }) {
  const addAltFlow = () => {
    onUpdate([...altFlows, { stepRef: 1, condition: '', steps: [''] }]);
  };

  const updateAltFlow = (index, field, value) => {
    const newFlows = [...altFlows];
    newFlows[index] = { ...newFlows[index], [field]: value };
    onUpdate(newFlows);
  };

  const updateAltFlowStep = (flowIndex, stepIndex, value) => {
    const newFlows = [...altFlows];
    newFlows[flowIndex].steps[stepIndex] = value;
    onUpdate(newFlows);
  };

  const addAltFlowStep = (flowIndex) => {
    const newFlows = [...altFlows];
    newFlows[flowIndex].steps.push('');
    onUpdate(newFlows);
  };

  const removeAltFlowStep = (flowIndex, stepIndex) => {
    const newFlows = [...altFlows];
    newFlows[flowIndex].steps = newFlows[flowIndex].steps.filter((_, i) => i !== stepIndex);
    onUpdate(newFlows);
  };

  const removeAltFlow = (index) => {
    onUpdate(altFlows.filter((_, i) => i !== index));
  };

  return (
    <div className="alt-flow-field">
      {altFlows.map((flow, flowIndex) => (
        <div key={flowIndex} style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: '#92400e' }}>Alt Flow</span>
              <select
                value={flow.stepRef}
                onChange={(e) => updateAltFlow(flowIndex, 'stepRef', parseInt(e.target.value))}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #fcd34d' }}
              >
                {mainFlowSteps.map((_, i) => (
                  <option key={i} value={i + 1}>After Step {i + 1}</option>
                ))}
                {mainFlowSteps.length === 0 && <option value={1}>Step 1</option>}
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeAltFlow(flowIndex)}
              style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}
            >×</button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={flow.condition}
              onChange={(e) => updateAltFlow(flowIndex, 'condition', e.target.value)}
              placeholder="Condition (e.g., 'If credentials are invalid')"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #fcd34d' }}
            />
          </div>

          <div style={{ paddingLeft: '12px', borderLeft: '3px solid #f59e0b' }}>
            {flow.steps.map((step, stepIndex) => (
              <div key={stepIndex} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                <span style={{
                  minWidth: '36px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#92400e'
                }}>
                  {flow.stepRef}{String.fromCharCode(97 + stepIndex)}.
                </span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updateAltFlowStep(flowIndex, stepIndex, e.target.value)}
                  placeholder="Alternative step action..."
                  style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #fcd34d' }}
                />
                <button
                  type="button"
                  onClick={() => removeAltFlowStep(flowIndex, stepIndex)}
                  disabled={flow.steps.length === 1}
                  style={{ padding: '2px 6px', background: flow.steps.length === 1 ? '#f3f4f6' : '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#ef4444', cursor: flow.steps.length === 1 ? 'not-allowed' : 'pointer', opacity: flow.steps.length === 1 ? 0.5 : 1 }}
                >×</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addAltFlowStep(flowIndex)}
              style={{ fontSize: '12px', padding: '4px 8px', background: 'transparent', border: '1px dashed #f59e0b', borderRadius: '4px', cursor: 'pointer', color: '#92400e' }}
            >+ Add Step</button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addAltFlow}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 14px',
          background: '#fffbeb',
          border: '1px dashed #f59e0b',
          borderRadius: '6px',
          cursor: 'pointer',
          color: '#92400e',
          width: '100%',
          justifyContent: 'center',
          fontWeight: '500'
        }}
      >
        + Add Alternative Flow
      </button>
    </div>
  );
}

// ============ ELEMENT FORM MODAL ============
function ElementFormModal({ element, type, onSave, onClose }) {
  // For actors - simple fields
  const [name, setName] = useState(element?.name || '');
  const [description, setDescription] = useState(element?.description || '');

  // For use cases - structured fields
  const [preconditions, setPreconditions] = useState(
    Array.isArray(element?.preconditions) ? element.preconditions :
    element?.preconditions ? [element.preconditions] : []
  );
  const [mainFlow, setMainFlow] = useState(
    Array.isArray(element?.mainFlow) ? element.mainFlow :
    element?.mainFlow ? element.mainFlow.split('\n').filter(s => s.trim()).map(s => s.replace(/^\d+[\.\)]\s*/, '')) : []
  );
  const [altFlows, setAltFlows] = useState(
    Array.isArray(element?.altFlows) ? element.altFlows :
    element?.alternativeFlows ? [{ stepRef: 1, condition: '', steps: element.alternativeFlows.split('\n').filter(s => s.trim()) }] : []
  );
  const [postconditions, setPostconditions] = useState(
    Array.isArray(element?.postconditions) ? element.postconditions :
    element?.postconditions ? [element.postconditions] : []
  );
  const [trigger, setTrigger] = useState(element?.trigger || '');
  const [primaryActor, setPrimaryActor] = useState(element?.primaryActor || '');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (type === 'actor') {
      onSave({
        ...element,
        id: element?.id || `actor-${Date.now()}`,
        type: 'actor',
        name,
        description,
      });
    } else {
      onSave({
        ...element,
        id: element?.id || `usecase-${Date.now()}`,
        type: 'usecase',
        name,
        description,
        trigger,
        primaryActor,
        preconditions: preconditions.filter(p => p.trim()),
        mainFlow: mainFlow.filter(s => s.trim()),
        altFlows: altFlows.filter(f => f.condition.trim() || f.steps.some(s => s.trim())),
        postconditions: postconditions.filter(p => p.trim()),
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="context-form-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: type === 'usecase' ? '700px' : '400px', maxHeight: '90vh', overflow: 'auto' }}
      >
        <div className="modal-header" style={{ position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 10 }}>
          <h3>{element?.id ? 'Edit' : 'Add'} {type === 'actor' ? 'Actor' : 'Use Case'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 20px 20px' }}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={type === 'actor' ? 'Actor name' : 'Use case name (e.g., Login, Place Order)'}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'actor' ? 'Role and responsibilities...' : 'Brief description of this use case...'}
              rows={2}
            />
          </div>

          {type === 'usecase' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Primary Actor</label>
                  <input
                    type="text"
                    value={primaryActor}
                    onChange={(e) => setPrimaryActor(e.target.value)}
                    placeholder="e.g., Customer, Admin"
                  />
                </div>
                <div className="form-group">
                  <label>Trigger</label>
                  <input
                    type="text"
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    placeholder="What initiates this use case"
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Preconditions
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    (What must be true before starting)
                  </span>
                </label>
                <ListItemField
                  items={preconditions}
                  onUpdate={setPreconditions}
                  placeholder="Enter precondition..."
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Main Flow</span>
                    Steps
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    (Auto-numbered, drag to reorder)
                  </span>
                </label>
                <ListItemField
                  items={mainFlow}
                  onUpdate={setMainFlow}
                  placeholder="Describe this step..."
                  numbered={true}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Alternative Flows</span>
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    (Exceptions & variations linked to main steps)
                  </span>
                </label>
                <AlternativeFlowField
                  altFlows={altFlows}
                  mainFlowSteps={mainFlow}
                  onUpdate={setAltFlows}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Postconditions
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    (What is true after completion)
                  </span>
                </label>
                <ListItemField
                  items={postconditions}
                  onUpdate={setPostconditions}
                  placeholder="Enter postcondition..."
                />
              </div>
            </>
          )}

          <div className="modal-footer" style={{ position: 'sticky', bottom: 0, background: 'var(--panel)', paddingTop: '16px', marginTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{element?.id ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ RELATIONSHIP FORM MODAL ============
function RelationshipFormModal({ actors, useCases, onSave, onClose }) {
  const [formData, setFormData] = useState({
    fromId: '',
    fromType: '',
    toId: '',
    toType: '',
    type: 'association',
  });

  const allElements = [
    ...actors.map(a => ({ ...a, elementType: 'actor' })),
    ...useCases.map(uc => ({ ...uc, elementType: 'usecase' })),
  ];

  const handleFromChange = (e) => {
    const id = e.target.value;
    const element = allElements.find(el => el.id === id);
    setFormData({ ...formData, fromId: id, fromType: element?.elementType || '' });
  };

  const handleToChange = (e) => {
    const id = e.target.value;
    const element = allElements.find(el => el.id === id);
    setFormData({ ...formData, toId: id, toType: element?.elementType || '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: `rel-${Date.now()}`, ...formData });
  };

  const availableTypes = useMemo(() => {
    const types = [];
    const fromEl = allElements.find(el => el.id === formData.fromId);
    const toEl = allElements.find(el => el.id === formData.toId);

    if (fromEl?.elementType === 'actor' && toEl?.elementType === 'usecase') types.push(UC_RELATIONSHIP_TYPES.association);
    if (fromEl?.elementType === 'usecase' && toEl?.elementType === 'actor') types.push(UC_RELATIONSHIP_TYPES.association);
    if (fromEl?.elementType === 'usecase' && toEl?.elementType === 'usecase') {
      types.push(UC_RELATIONSHIP_TYPES.include, UC_RELATIONSHIP_TYPES.extend, UC_RELATIONSHIP_TYPES.generalization);
    }
    if (fromEl?.elementType === 'actor' && toEl?.elementType === 'actor') types.push(UC_RELATIONSHIP_TYPES.generalization);

    return types.length > 0 ? types : Object.values(UC_RELATIONSHIP_TYPES);
  }, [formData.fromId, formData.toId, allElements]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="context-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Relationship</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>From *</label>
            <select value={formData.fromId} onChange={handleFromChange} required>
              <option value="">Select element...</option>
              <optgroup label="Actors">
                {actors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </optgroup>
              <optgroup label="Use Cases">
                {useCases.map(uc => <option key={uc.id} value={uc.id}>{uc.name}</option>)}
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label>Relationship Type *</label>
            <div className="type-options">
              {availableTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  className={`type-option ${formData.type === type.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, type: type.id })}
                  style={{ borderColor: formData.type === type.id ? type.color : 'transparent' }}
                >
                  <span style={{ display: 'inline-block', borderTop: `2px ${type.lineStyle} ${type.color}`, width: '30px', marginBottom: '4px' }} />
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>To *</label>
            <select value={formData.toId} onChange={handleToChange} required>
              <option value="">Select element...</option>
              <optgroup label="Actors">
                {actors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </optgroup>
              <optgroup label="Use Cases">
                {useCases.map(uc => <option key={uc.id} value={uc.id}>{uc.name}</option>)}
              </optgroup>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={!formData.fromId || !formData.toId}>Add Relationship</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ DIAGRAM SELECTOR MODAL ============
function DiagramSelectorModal({ diagrams, currentDiagramId, onSelect, onCreate, onClose }) {
  const [newName, setNewName] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="context-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3><FolderOpenIcon fontSize="small" style={{ marginRight: 8 }} /> Use Case Diagrams</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div style={{ padding: '16px' }}>
          {diagrams.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No diagrams yet. Create your first one below.</p>
          ) : (
            <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '16px' }}>
              {diagrams.map(d => (
                <div
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  style={{
                    padding: '12px',
                    border: `2px solid ${d.id === currentDiagramId ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    background: d.id === currentDiagramId ? 'var(--accent-bg)' : 'var(--bg)',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {d.elements?.actors?.length || 0} actors, {d.elements?.useCases?.length || 0} use cases
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Updated: {new Date(d.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <label style={{ fontWeight: 500, marginBottom: '8px', display: 'block' }}>Create New Diagram</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Diagram name..."
                style={{ flex: 1 }}
              />
              <button
                onClick={() => { if (newName.trim()) { onCreate(newName.trim()); setNewName(''); } }}
                className="btn-primary"
                disabled={!newName.trim()}
              >
                <CreateNewFolderIcon fontSize="small" /> Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN USE CASE DIAGRAM ============
export default function UseCaseDiagram({ projectId }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { user, role } = useAuth();
  const { activeProject } = useProjects();

  // State
  const [allDiagrams, setAllDiagrams] = useState([]);
  const [diagramId, setDiagramId] = useState(null);
  const [systemName, setSystemName] = useState('');
  const [actors, setActors] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [positions, setPositions] = useState({});
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showSteps, setShowSteps] = useState(true);

  // Persistence state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [versions, setVersions] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Modals
  const [showActorModal, setShowActorModal] = useState(false);
  const [showUseCaseModal, setShowUseCaseModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [showDiagramSelector, setShowDiagramSelector] = useState(false);
  const [editingElement, setEditingElement] = useState(null);

  // Sidebar state
  const [showDiagramSidebar, setShowDiagramSidebar] = useState(true);
  const [newDiagramName, setNewDiagramName] = useState('');

  // Auto-save refs
  const autoSaveTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Canvas dimensions
  const canvasWidth = 1200;
  const canvasHeight = 800;

  // Effective project ID
  const effectivePid = activeProject?.id || projectId;

  // Calculate system boundary
  const systemBounds = useMemo(() => {
    if (useCases.length === 0) return { x: 100, y: 50, width: 400, height: 300 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    useCases.forEach(uc => {
      const pos = positions[uc.id] || { x: 200, y: 150 };
      minX = Math.min(minX, pos.x - 80);
      minY = Math.min(minY, pos.y - 40);
      maxX = Math.max(maxX, pos.x + 80);
      maxY = Math.max(maxY, pos.y + 40);
    });

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, [useCases, positions]);

  // Load all diagrams for project
  useEffect(() => {
    const loadDiagrams = async () => {
      if (!user || !role || !effectivePid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const res = await fetch(`/api/diagrams?type=usecase&project_id=${effectivePid}`, {
          headers: { 'x-user': user, 'x-role': role },
        });

        if (res.ok) {
          const diagrams = await res.json();
          setAllDiagrams(diagrams);

          if (diagrams.length > 0) {
            // Load the first (most recent) diagram
            loadDiagramData(diagrams[0]);
          } else {
            // No diagrams - start fresh
            resetDiagram();
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setLoadError(`Failed to load: ${errData.error || res.statusText}`);
        }
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    };
    loadDiagrams();
  }, [effectivePid, user, role]);

  const loadDiagramData = (diagram) => {
    setDiagramId(diagram.id);
    setSystemName(diagram.name || 'Use Case Diagram');
    const elements = diagram.elements || {};
    setActors(elements.actors || []);
    setUseCases(elements.useCases || []);
    setRelationships(elements.relationships || []);
    setPositions(elements.positions || {});
    if (elements.versions) setVersions(elements.versions);
    setHasChanges(false);
    isInitialLoadRef.current = false;
  };

  const resetDiagram = () => {
    setDiagramId(null);
    setSystemName(activeProject?.name ? `${activeProject.name} - Use Cases` : 'Use Case Diagram');
    setActors([]);
    setUseCases([]);
    setRelationships([]);
    setPositions({});
    setVersions([]);
    setHasChanges(false);
    isInitialLoadRef.current = false;
  };

  // Handle diagram selection
  const handleSelectDiagram = (id) => {
    const diagram = allDiagrams.find(d => d.id === id);
    if (diagram) {
      loadDiagramData(diagram);
    }
    setShowDiagramSelector(false);
  };

  // Create new diagram
  const handleCreateDiagram = async (name) => {
    setSaveError(null);

    const payload = {
      name,
      type: 'usecase',
      elements: { actors: [], useCases: [], relationships: [], positions: {}, versions: [] },
      settings: { project_id: effectivePid },
    };

    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setAllDiagrams(prev => [saved, ...prev]);
        loadDiagramData(saved);
        setShowDiagramSelector(false);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error || 'Failed to create diagram');
      }
    } catch (err) {
      setSaveError(err.message);
    }
  };

  // Save diagram
  const saveDiagram = useCallback(async () => {
    if (!effectivePid || !user || !role) {
      setSaveError('No project or auth');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const newVersion = {
        id: `v-${Date.now()}`,
        savedAt: new Date().toISOString(),
        actorCount: actors.length,
        useCaseCount: useCases.length,
        relationshipCount: relationships.length,
        actors: [...actors],
        useCases: [...useCases],
        relationships: [...relationships],
        positions: { ...positions },
      };
      const updatedVersions = [newVersion, ...versions].slice(0, 10);

      const payload = {
        name: systemName,
        type: 'usecase',
        elements: { actors, useCases, relationships, positions, versions: updatedVersions },
        settings: { project_id: effectivePid },
      };

      const method = diagramId ? 'PUT' : 'POST';
      const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setDiagramId(saved.id);
        setVersions(updatedVersions);
        setHasChanges(false);

        // Update allDiagrams list
        setAllDiagrams(prev => {
          const exists = prev.find(d => d.id === saved.id);
          if (exists) {
            return prev.map(d => d.id === saved.id ? { ...saved, elements: payload.elements } : d);
          }
          return [{ ...saved, elements: payload.elements }, ...prev];
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error || err.details || 'Save failed');
      }
    } catch (err) {
      setSaveError(err.message);
    }
    setIsSaving(false);
  }, [effectivePid, user, role, diagramId, systemName, actors, useCases, relationships, positions, versions]);

  // Auto-save effect
  useEffect(() => {
    if (isInitialLoadRef.current || isLoading || !effectivePid || !user || !role || !hasChanges) {
      return;
    }

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      saveDiagram();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [actors, useCases, relationships, positions, systemName, hasChanges, saveDiagram]);

  // Restore version
  const handleRestoreVersion = (version) => {
    setActors(version.actors || []);
    setUseCases(version.useCases || []);
    setRelationships(version.relationships || []);
    setPositions(version.positions || {});
    setHasChanges(true);
    setShowVersionHistory(false);
  };

  // Initialize positions for new elements
  useEffect(() => {
    const newPositions = { ...positions };
    let changed = false;

    actors.forEach((actor, i) => {
      if (!newPositions[actor.id]) {
        newPositions[actor.id] = { x: -200, y: 50 + i * 120 };
        changed = true;
      }
    });

    useCases.forEach((uc, i) => {
      if (!newPositions[uc.id]) {
        newPositions[uc.id] = { x: 150 + (i % 3) * 180, y: 80 + Math.floor(i / 3) * 120 };
        changed = true;
      }
    });

    if (changed) setPositions(newPositions);
  }, [actors, useCases]);

  // Element drag handlers
  const handleDragStart = (e, element, type) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragTarget(element);
    setSelectedElement(element);
    setSelectedType(type);
  };

  // Pan handlers
  const handlePanStart = (e) => {
    if (e.target === e.currentTarget || e.target.tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x * zoom, y: e.clientY - pan.y * zoom });
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && dragTarget && svgRef.current) {
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / zoom - pan.x;
      const y = (e.clientY - rect.top - rect.height / 2) / zoom - pan.y;
      setPositions(prev => ({ ...prev, [dragTarget.id]: { x, y } }));
      setHasChanges(true);
    } else if (isPanning) {
      setPan({
        x: (e.clientX - panStart.x) / zoom,
        y: (e.clientY - panStart.y) / zoom,
      });
    }
  }, [isDragging, dragTarget, isPanning, panStart, zoom, pan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragTarget(null);
    setIsPanning(false);
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.3, Math.min(2.5, z + delta)));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Selection handler
  const handleSelect = (element, type) => {
    setSelectedElement(element);
    setSelectedType(type);
  };

  // CRUD handlers
  const handleAddActor = () => { setEditingElement(null); setShowActorModal(true); };
  const handleAddUseCase = () => { setEditingElement(null); setShowUseCaseModal(true); };

  const handleEditElement = () => {
    if (!selectedElement) return;
    setEditingElement(selectedElement);
    if (selectedType === 'actor') setShowActorModal(true);
    else setShowUseCaseModal(true);
  };

  const handleSaveActor = (actor) => {
    if (actors.find(a => a.id === actor.id)) {
      setActors(actors.map(a => a.id === actor.id ? actor : a));
    } else {
      setActors([...actors, actor]);
    }
    setShowActorModal(false);
    setEditingElement(null);
    setHasChanges(true);
  };

  const handleSaveUseCase = (useCase) => {
    if (useCases.find(uc => uc.id === useCase.id)) {
      setUseCases(useCases.map(uc => uc.id === useCase.id ? useCase : uc));
    } else {
      setUseCases([...useCases, useCase]);
    }
    setShowUseCaseModal(false);
    setEditingElement(null);
    setHasChanges(true);
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;
    if (confirm(`Delete "${selectedElement.name}"?`)) {
      if (selectedType === 'actor') {
        setActors(actors.filter(a => a.id !== selectedElement.id));
      } else {
        setUseCases(useCases.filter(uc => uc.id !== selectedElement.id));
      }
      setRelationships(relationships.filter(r => r.fromId !== selectedElement.id && r.toId !== selectedElement.id));
      setSelectedElement(null);
      setSelectedType(null);
      setHasChanges(true);
    }
  };

  const handleSaveRelationship = (rel) => {
    setRelationships([...relationships, rel]);
    setShowRelationshipModal(false);
    setHasChanges(true);
  };

  const handleDeleteRelationship = (relId) => {
    setRelationships(relationships.filter(r => r.id !== relId));
    setHasChanges(true);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.3));
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Export SVG
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${systemName || 'use-case-diagram'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PNG
  const handleExportPNG = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // Higher resolution
      canvas.width = canvasWidth * scale;
      canvas.height = canvasHeight * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${systemName || 'use-case-diagram'}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Export PDF with full documentation
  const handleExportPDF = () => {
    if (!svgRef.current) return;

    // Convert SVG to data URL for embedding
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
    const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    // Generate HTML document
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${systemName || 'Use Case Diagram'} - Documentation</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1f2937;
      line-height: 1.6;
    }
    h1 {
      color: #1e40af;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 12px;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .diagram-container {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .diagram-container img {
      max-width: 100%;
      height: auto;
    }
    h2 {
      color: #1e40af;
      margin-top: 40px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    h3 {
      color: #374151;
      margin-top: 30px;
      margin-bottom: 12px;
    }
    .use-case {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    .use-case h3 {
      margin: 0 0 16px 0;
      color: #1e40af;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .use-case h3::before {
      content: '○';
      color: #3b82f6;
      font-size: 20px;
    }
    .field { margin: 12px 0; }
    .field-label {
      font-weight: 600;
      color: #374151;
      display: block;
      margin-bottom: 4px;
    }
    .field-value {
      background: #f9fafb;
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .flow-steps {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
    }
    .flow-steps ol {
      margin: 0;
      padding-left: 24px;
    }
    .flow-steps li {
      margin: 8px 0;
      padding-left: 8px;
    }
    .alt-flows {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
    }
    .actor-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 16px 0;
    }
    .actor-badge {
      background: #374151;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .actor-badge::before {
      content: '👤';
    }
    .relationship-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .relationship-table th,
    .relationship-table td {
      border: 1px solid #e5e7eb;
      padding: 10px 14px;
      text-align: left;
    }
    .relationship-table th {
      background: #f3f4f6;
      font-weight: 600;
    }
    .relationship-type {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .rel-association { background: #f3f4f6; color: #374151; }
    .rel-include { background: #dbeafe; color: #1e40af; }
    .rel-extend { background: #dcfce7; color: #166534; }
    .rel-generalization { background: #ede9fe; color: #5b21b6; }
    .summary-box {
      background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .summary-stats {
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e40af;
    }
    .stat-label {
      font-size: 13px;
      color: #6b7280;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .use-case { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${systemName || 'Use Case Diagram'}</h1>
  <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>

  <div class="summary-box">
    <div class="summary-stats">
      <div class="stat-item">
        <div class="stat-value">${actors.length}</div>
        <div class="stat-label">Actors</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${useCases.length}</div>
        <div class="stat-label">Use Cases</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${relationships.length}</div>
        <div class="stat-label">Relationships</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${useCases.reduce((sum, uc) => sum + (Array.isArray(uc.mainFlow) ? uc.mainFlow.length : (uc.mainFlow?.split('\\n').filter(s => s.trim()).length || 0)), 0)}</div>
        <div class="stat-label">Total Steps</div>
      </div>
    </div>
  </div>

  <div class="diagram-container">
    <img src="${svgDataUrl}" alt="Use Case Diagram" />
  </div>

  <h2>Actors</h2>
  ${actors.length === 0 ? '<p style="color: #6b7280;">No actors defined.</p>' : `
  <div class="actor-list">
    ${actors.map(a => `<div class="actor-badge">${a.name}</div>`).join('')}
  </div>
  ${actors.filter(a => a.description).length > 0 ? `
  <div style="margin-top: 16px;">
    ${actors.filter(a => a.description).map(a => `
    <div style="margin: 8px 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
      <strong>${a.name}:</strong> ${a.description}
    </div>
    `).join('')}
  </div>
  ` : ''}
  `}

  <h2>Use Cases</h2>
  ${useCases.length === 0 ? '<p style="color: #6b7280;">No use cases defined.</p>' : useCases.map((uc, index) => {
    const ucRelationships = relationships.filter(r => r.fromId === uc.id || r.toId === uc.id);
    const flowSteps = Array.isArray(uc.mainFlow) ? uc.mainFlow : (uc.mainFlow?.split('\\n').filter(s => s.trim()).map(s => s.replace(/^\\d+[\\.)\\s]*/, '')) || []);
    const precondList = Array.isArray(uc.preconditions) ? uc.preconditions : (uc.preconditions ? [uc.preconditions] : []);
    const postcondList = Array.isArray(uc.postconditions) ? uc.postconditions : (uc.postconditions ? [uc.postconditions] : []);
    const altFlowsList = uc.altFlows || [];

    return `
  <div class="use-case">
    <h3>UC-${String(index + 1).padStart(2, '0')}: ${uc.name}</h3>

    <table style="width: 100%; margin-bottom: 16px; font-size: 13px;">
      ${uc.primaryActor ? `<tr><td style="width: 120px; color: #6b7280; padding: 4px 0;"><strong>Primary Actor:</strong></td><td>${uc.primaryActor}</td></tr>` : ''}
      ${uc.trigger ? `<tr><td style="color: #6b7280; padding: 4px 0;"><strong>Trigger:</strong></td><td>${uc.trigger}</td></tr>` : ''}
    </table>

    ${uc.description ? `
    <div class="field">
      <span class="field-label">Description</span>
      <div class="field-value">${uc.description}</div>
    </div>
    ` : ''}

    ${precondList.length > 0 ? `
    <div class="field">
      <span class="field-label">Preconditions</span>
      <div class="field-value">
        <ul style="margin: 0; padding-left: 20px;">
          ${precondList.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}

    ${flowSteps.length > 0 ? `
    <div class="field">
      <span class="field-label" style="display: flex; align-items: center; gap: 8px;">
        <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Main Flow</span>
        Steps
      </span>
      <div class="flow-steps">
        <ol>
          ${flowSteps.map((step, i) => {
            // Find any alt flows for this step
            const altForStep = altFlowsList.filter(af => af.stepRef === (i + 1));
            return `
              <li style="margin-bottom: ${altForStep.length > 0 ? '16px' : '8px'};">
                ${step}
                ${altForStep.length > 0 ? `
                  ${altForStep.map(af => `
                    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 10px; margin-top: 8px;">
                      <div style="font-weight: 600; color: #92400e; margin-bottom: 6px;">
                        ⚡ ${af.condition || 'Alternative Flow'}
                      </div>
                      <ul style="margin: 0; padding-left: 16px; color: #78350f;">
                        ${af.steps.map((s, j) => `<li>${i + 1}${String.fromCharCode(97 + j)}. ${s}</li>`).join('')}
                      </ul>
                    </div>
                  `).join('')}
                ` : ''}
              </li>
            `;
          }).join('')}
        </ol>
      </div>
    </div>
    ` : ''}

    ${postcondList.length > 0 ? `
    <div class="field">
      <span class="field-label">Postconditions</span>
      <div class="field-value" style="background: #ecfdf5; border-color: #a7f3d0;">
        <ul style="margin: 0; padding-left: 20px;">
          ${postcondList.map(p => `<li style="color: #065f46;">${p}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}

    ${ucRelationships.length > 0 ? `
    <div class="field">
      <span class="field-label">Relationships</span>
      <div style="margin-top: 8px;">
        ${ucRelationships.map(r => {
          const other = [...actors, ...useCases].find(el => el.id === (r.fromId === uc.id ? r.toId : r.fromId));
          const relType = UC_RELATIONSHIP_TYPES[r.type];
          const direction = r.fromId === uc.id ? '→' : '←';
          const typeClass = r.type === 'include' ? 'rel-include' : r.type === 'extend' ? 'rel-extend' : r.type === 'generalization' ? 'rel-generalization' : 'rel-association';
          return `<span class="relationship-type ${typeClass}">${relType?.name || r.type}</span> ${direction} ${other?.name || 'Unknown'}`;
        }).join(' &nbsp;|&nbsp; ')}
      </div>
    </div>
    ` : ''}
  </div>
    `;
  }).join('')}

  ${relationships.length > 0 ? `
  <h2>Relationships Matrix</h2>
  <table class="relationship-table">
    <thead>
      <tr>
        <th>From</th>
        <th>Type</th>
        <th>To</th>
      </tr>
    </thead>
    <tbody>
      ${relationships.map(r => {
        const fromEl = [...actors, ...useCases].find(el => el.id === r.fromId);
        const toEl = [...actors, ...useCases].find(el => el.id === r.toId);
        const typeClass = r.type === 'include' ? 'rel-include' : r.type === 'extend' ? 'rel-extend' : r.type === 'generalization' ? 'rel-generalization' : 'rel-association';
        return `
        <tr>
          <td>${fromEl?.name || 'Unknown'}</td>
          <td><span class="relationship-type ${typeClass}">${UC_RELATIONSHIP_TYPES[r.type]?.name || r.type}</span></td>
          <td>${toEl?.name || 'Unknown'}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    Generated by Requirements Studio &nbsp;•&nbsp; ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();

    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Export menu state
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowExportMenu(false);
    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  return (
    <div className="context-diagram-view">
      {/* Header */}
      <div className="diagram-header usecase-header">
        <div className="header-title">
          <AccountTreeIcon style={{ fontSize: 28, color: '#3b82f6' }} />
          <div>
            <h2>Use Case Diagram</h2>
            <span className="subtitle">Model actors and their interactions with system use cases</span>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{actors.length}</span>
            <span className="stat-label">Actors</span>
          </div>
          <div className="stat">
            <span className="stat-value">{useCases.length}</span>
            <span className="stat-label">Use Cases</span>
          </div>
          <div className="stat">
            <span className="stat-value">{relationships.length}</span>
            <span className="stat-label">Relations</span>
          </div>
          {isLoading ? (
            <div className="stat" style={{ color: '#3b82f6' }}>
              <span className="stat-label">Loading...</span>
            </div>
          ) : isSaving ? (
            <div className="stat" style={{ color: '#3b82f6' }}>
              <span className="stat-label">Saving...</span>
            </div>
          ) : hasChanges ? (
            <div className="stat unsaved">
              <span className="stat-label">Unsaved</span>
            </div>
          ) : diagramId ? (
            <div className="stat" style={{ color: '#22c55e' }}>
              <span className="stat-label">Saved</span>
            </div>
          ) : null}
          {loadError && <div className="stat" style={{ color: '#ef4444' }}><span className="stat-label">Load Error</span></div>}
          {saveError && <div className="stat" style={{ color: '#ef4444' }}><span className="stat-label">Save Error</span></div>}
          {!effectivePid && <div className="stat" style={{ color: '#f59e0b' }}><span className="stat-label">No Project</span></div>}
        </div>
      </div>

      {/* Toolbar */}
      <div className="diagram-toolbar">
        <div className="toolbar-actions">
          <button onClick={handleAddActor} className="btn-tool">
            <PersonOutlineIcon fontSize="small" />
            <span>Add Actor</span>
          </button>
          <button onClick={handleAddUseCase} className="btn-tool">
            <AddIcon fontSize="small" />
            <span>Add Use Case</span>
          </button>
          <button onClick={() => setShowRelationshipModal(true)} className="btn-tool" disabled={actors.length === 0 && useCases.length === 0}>
            <LinkIcon fontSize="small" />
            <span>Add Relation</span>
          </button>
          <button onClick={() => setShowSteps(!showSteps)} className={`btn-tool ${showSteps ? 'active' : ''}`} title="Toggle flow steps display">
            <ListAltIcon fontSize="small" />
            <span>Steps</span>
          </button>
        </div>

        <div className="toolbar-view">
          <button onClick={handleZoomOut} title="Zoom Out (or scroll)"><ZoomOutIcon fontSize="small" /></button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} title="Zoom In (or scroll)"><ZoomInIcon fontSize="small" /></button>
          <button onClick={handleResetView} title="Reset View"><CenterFocusStrongIcon fontSize="small" /></button>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '8px' }}>
            <PanToolIcon fontSize="small" style={{ verticalAlign: 'middle' }} /> Drag to pan
          </span>
        </div>

        <div className="toolbar-export" style={{ position: 'relative' }}>
          <button onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }} className="btn-tool">
            <DownloadIcon fontSize="small" /><span>Export</span>
          </button>
          {showExportMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow)',
                zIndex: 1000,
                minWidth: '180px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => { handleExportSVG(); setShowExportMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }}
                onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                <DownloadIcon fontSize="small" /> Export SVG
              </button>
              <button
                onClick={() => { handleExportPNG(); setShowExportMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }}
                onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                <ImageIcon fontSize="small" /> Export PNG
              </button>
              <div style={{ borderTop: '1px solid var(--border)' }} />
              <button
                onClick={() => { handleExportPDF(); setShowExportMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }}
                onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                <PictureAsPdfIcon fontSize="small" style={{ color: '#ef4444' }} /> Export PDF Documentation
              </button>
            </div>
          )}
          <button onClick={() => setShowVersionHistory(!showVersionHistory)} className="btn-tool" title="Version History">
            <HistoryIcon fontSize="small" /><span>History</span>
          </button>
          <button onClick={saveDiagram} className="btn-save" disabled={isSaving || isLoading || !hasChanges || !effectivePid} title="Auto-saves after 2 seconds">
            <SaveIcon fontSize="small" />
            <span>{isSaving ? 'Saving...' : 'Save Now'}</span>
          </button>
        </div>
      </div>

      {/* Version History Panel */}
      {showVersionHistory && (
        <div className="version-history-panel" style={{ position: 'absolute', top: '130px', right: '20px', zIndex: 100, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', boxShadow: 'var(--shadow)', minWidth: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0 }}><HistoryIcon fontSize="small" /> Version History</h4>
            <button onClick={() => setShowVersionHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><CloseIcon fontSize="small" /></button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {versions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No previous versions saved yet</p>
            ) : (
              versions.map((v, idx) => (
                <div key={v.id || idx} style={{ padding: '8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>{new Date(v.savedAt).toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{v.actorCount} actors, {v.useCaseCount} use cases</div>
                  </div>
                  {idx > 0 ? (
                    <button onClick={() => handleRestoreVersion(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }} title="Restore">
                      <RestoreIcon fontSize="small" />
                    </button>
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Current</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="diagram-content with-left-sidebar">
        {/* Diagrams Sidebar */}
        <div className={`diagram-sidebar-left ${showDiagramSidebar ? 'expanded' : 'collapsed'}`}>
          <div className="sidebar-toggle" onClick={() => setShowDiagramSidebar(!showDiagramSidebar)}>
            {showDiagramSidebar ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </div>

          {showDiagramSidebar && (
            <div className="sidebar-content">
              <div className="sidebar-header">
                <FolderOpenIcon fontSize="small" />
                <h4>Diagrams</h4>
              </div>

              <div className="sidebar-diagrams-list">
                {allDiagrams.length === 0 ? (
                  <div className="empty-diagrams">
                    <p>No diagrams yet</p>
                    <p className="hint">Create your first diagram below</p>
                  </div>
                ) : (
                  allDiagrams.map(d => (
                    <div
                      key={d.id}
                      className={`diagram-item ${d.id === diagramId ? 'active' : ''}`}
                      onClick={() => handleSelectDiagram(d.id)}
                    >
                      <div className="diagram-item-icon">
                        <AccountTreeIcon fontSize="small" />
                      </div>
                      <div className="diagram-item-info">
                        <span className="diagram-item-name">{d.name}</span>
                        <span className="diagram-item-meta">
                          {d.elements?.actors?.length || 0} actors, {d.elements?.useCases?.length || 0} UC
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="sidebar-create">
                <input
                  type="text"
                  value={newDiagramName}
                  onChange={e => setNewDiagramName(e.target.value)}
                  placeholder="New diagram name..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newDiagramName.trim()) {
                      handleCreateDiagram(newDiagramName.trim());
                      setNewDiagramName('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newDiagramName.trim()) {
                      handleCreateDiagram(newDiagramName.trim());
                      setNewDiagramName('');
                    }
                  }}
                  disabled={!newDiagramName.trim()}
                  title="Create diagram"
                >
                  <CreateNewFolderIcon fontSize="small" />
                </button>
              </div>

              <div className="sidebar-info">
                <InfoOutlinedIcon fontSize="small" />
                <p>Use case diagrams capture functional requirements by showing actors and their interactions with the system.</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="diagram-canvas-container"
          style={{ cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handlePanStart}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            className="uc-canvas"
            viewBox={`${-canvasWidth / 2} ${-canvasHeight / 2} ${canvasWidth} ${canvasHeight}`}
            onClick={() => { setSelectedElement(null); setSelectedType(null); }}
          >
            <defs>
              <pattern id="uc-grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
              <pattern id="uc-grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#uc-grid-small)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#d1d5db" strokeWidth="1" />
              </pattern>
            </defs>

            <rect x={-canvasWidth / 2} y={-canvasHeight / 2} width={canvasWidth} height={canvasHeight} fill="url(#uc-grid-large)" />

            <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
              {useCases.length > 0 && <SystemBoundary name={systemName} bounds={systemBounds} scale={1} />}

              {relationships.map(rel => {
                const fromEl = [...actors, ...useCases].find(el => el.id === rel.fromId);
                const toEl = [...actors, ...useCases].find(el => el.id === rel.toId);
                if (!fromEl || !toEl) return null;
                return (
                  <RelationshipLine
                    key={rel.id}
                    relationship={rel}
                    fromPos={positions[fromEl.id] || { x: 0, y: 0 }}
                    toPos={positions[toEl.id] || { x: 0, y: 0 }}
                    fromType={rel.fromType}
                    toType={rel.toType}
                  />
                );
              })}

              {useCases.map(uc => (
                <UseCaseEllipse
                  key={uc.id}
                  useCase={uc}
                  position={positions[uc.id] || { x: 200, y: 150 }}
                  isSelected={selectedElement?.id === uc.id}
                  onSelect={(el) => handleSelect(el, 'usecase')}
                  onDragStart={handleDragStart}
                  showSteps={showSteps}
                  scale={1}
                />
              ))}

              {actors.map(actor => (
                <ActorFigure
                  key={actor.id}
                  actor={actor}
                  position={positions[actor.id] || { x: -150, y: 100 }}
                  isSelected={selectedElement?.id === actor.id}
                  onSelect={(el) => handleSelect(el, 'actor')}
                  onDragStart={handleDragStart}
                  scale={1}
                />
              ))}
            </g>
          </svg>

          {actors.length === 0 && useCases.length === 0 && (
            <div className="diagram-empty-hint">
              <p>Use the toolbar to add actors and use cases</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scroll to zoom, drag background to pan</p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="actors-list-panel">
          {selectedElement ? (
            <div className="panel-section">
              <div className="panel-section-header">
                <h4>{selectedType === 'actor' ? 'Actor' : 'Use Case'} Details</h4>
                <button className="close-panel-btn" onClick={() => { setSelectedElement(null); setSelectedType(null); }}><CloseIcon fontSize="small" /></button>
              </div>
              <div className="panel-section-content">
                <p><strong>Name:</strong> {selectedElement.name}</p>
                {selectedElement.description && <p><strong>Description:</strong> {selectedElement.description}</p>}

                {selectedType === 'usecase' && (
                  <>
                    {selectedElement.primaryActor && <p><strong>Primary Actor:</strong> {selectedElement.primaryActor}</p>}
                    {selectedElement.trigger && <p><strong>Trigger:</strong> {selectedElement.trigger}</p>}

                    {selectedElement.preconditions?.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <strong>Preconditions:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '12px' }}>
                          {(Array.isArray(selectedElement.preconditions) ? selectedElement.preconditions : [selectedElement.preconditions]).map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedElement.mainFlow?.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ background: '#3b82f6', color: 'white', padding: '1px 6px', borderRadius: '3px', fontSize: '10px' }}>Main Flow</span>
                        </strong>
                        <ol style={{ margin: '4px 0', paddingLeft: '24px', fontSize: '12px' }}>
                          {(Array.isArray(selectedElement.mainFlow) ? selectedElement.mainFlow : selectedElement.mainFlow.split('\n')).filter(s => typeof s === 'string' ? s.trim() : s).map((step, i) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{typeof step === 'string' ? step.replace(/^\d+[\.\)]\s*/, '') : step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {selectedElement.altFlows?.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ background: '#f59e0b', color: 'white', padding: '1px 6px', borderRadius: '3px', fontSize: '10px' }}>Alt Flows</span>
                        </strong>
                        {selectedElement.altFlows.map((af, i) => (
                          <div key={i} style={{ background: '#fef3c7', padding: '8px', borderRadius: '4px', marginTop: '4px', fontSize: '11px' }}>
                            <div style={{ fontWeight: '500', color: '#92400e' }}>Step {af.stepRef}: {af.condition}</div>
                            <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                              {af.steps.map((s, j) => (
                                <li key={j}>{af.stepRef}{String.fromCharCode(97 + j)}. {s}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedElement.postconditions?.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <strong>Postconditions:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '12px' }}>
                          {(Array.isArray(selectedElement.postconditions) ? selectedElement.postconditions : [selectedElement.postconditions]).map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <div style={{ marginTop: '12px' }}>
                  <strong>Relationships:</strong>
                  {relationships.filter(r => r.fromId === selectedElement.id || r.toId === selectedElement.id).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0' }}>
                      {relationships.filter(r => r.fromId === selectedElement.id || r.toId === selectedElement.id).map(r => {
                        const other = [...actors, ...useCases].find(el => el.id === (r.fromId === selectedElement.id ? r.toId : r.fromId));
                        const relType = UC_RELATIONSHIP_TYPES[r.type];
                        const direction = r.fromId === selectedElement.id ? '→' : '←';
                        return (
                          <li key={r.id} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <span style={{ color: relType?.color }}>{relType?.name}</span> {direction} {other?.name}
                            <button onClick={() => handleDeleteRelationship(r.id)} title="Delete" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={handleEditElement} className="btn-tool" style={{ flex: 1 }}><EditIcon fontSize="small" /> Edit</button>
                  <button onClick={handleDeleteElement} className="btn-tool" style={{ flex: 1, color: '#ef4444' }}><DeleteIcon fontSize="small" /> Delete</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="panel-section">
                <div className="panel-section-header"><h4>Actors ({actors.length})</h4></div>
                <div className="panel-section-content">
                  {actors.length === 0 ? <p className="empty-hint">No actors yet</p> : actors.map(actor => (
                    <div key={actor.id} className="list-item" onClick={() => handleSelect(actor, 'actor')} style={{ cursor: 'pointer' }}>
                      <div className="list-item-icon" style={{ background: '#374151' }}><PersonIcon style={{ fontSize: 14, color: 'white' }} /></div>
                      <div className="list-item-info"><span className="list-item-name">{actor.name}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <div className="panel-section-header"><h4>Use Cases ({useCases.length})</h4></div>
                <div className="panel-section-content">
                  {useCases.length === 0 ? <p className="empty-hint">No use cases yet</p> : useCases.map(uc => {
                    const stepCount = Array.isArray(uc.mainFlow) ? uc.mainFlow.length : (uc.mainFlow?.split('\n').filter(s => s.trim()).length || 0);
                    return (
                      <div key={uc.id} className="list-item" onClick={() => handleSelect(uc, 'usecase')} style={{ cursor: 'pointer' }}>
                        <div className="list-item-icon flow-icon" style={{ background: '#64748b' }}>○</div>
                        <div className="list-item-info">
                          <span className="list-item-name">{uc.name}</span>
                          {stepCount > 0 && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{stepCount} steps</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="panel-section">
                <div className="panel-section-header"><h4>Legend</h4></div>
                <div className="panel-section-content">
                  {Object.values(UC_RELATIONSHIP_TYPES).map(type => (
                    <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '11px' }}>
                      <span style={{ display: 'inline-block', width: '24px', borderTop: `2px ${type.lineStyle} ${type.color}` }} />
                      <span>{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showActorModal && <ElementFormModal element={editingElement} type="actor" onSave={handleSaveActor} onClose={() => { setShowActorModal(false); setEditingElement(null); }} />}
      {showUseCaseModal && <ElementFormModal element={editingElement} type="usecase" onSave={handleSaveUseCase} onClose={() => { setShowUseCaseModal(false); setEditingElement(null); }} />}
      {showRelationshipModal && <RelationshipFormModal actors={actors} useCases={useCases} onSave={handleSaveRelationship} onClose={() => setShowRelationshipModal(false)} />}
      {showDiagramSelector && <DiagramSelectorModal diagrams={allDiagrams} currentDiagramId={diagramId} onSelect={handleSelectDiagram} onCreate={handleCreateDiagram} onClose={() => setShowDiagramSelector(false)} />}
    </div>
  );
}

export { ActorFigure, UseCaseEllipse, SystemBoundary, RelationshipLine, UC_RELATIONSHIP_TYPES };
