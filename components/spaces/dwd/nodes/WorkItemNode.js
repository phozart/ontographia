// components/dwd/nodes/WorkItemNode.js
// Custom ReactFlow node for DWD Work Items
// Shows work item name, type, volatility, and state

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// MUI Icons
import GavelIcon from '@mui/icons-material/Gavel';
import WarningIcon from '@mui/icons-material/Warning';
import BugReportIcon from '@mui/icons-material/BugReport';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SpeedIcon from '@mui/icons-material/Speed';

const WORK_ITEM_TYPE_ICONS = {
  decision: GavelIcon,
  risk: WarningIcon,
  incident_cluster: BugReportIcon,
  customer_situation: PersonIcon,
  change_request: EditIcon,
  other: MoreHorizIcon,
};

const VOLATILITY_COLORS = {
  low: { bg: '#dcfce7', color: '#16a34a', border: '#16a34a' },
  medium: { bg: '#fef3c7', color: '#d97706', border: '#d97706' },
  high: { bg: '#fee2e2', color: '#dc2626', border: '#dc2626' },
};

const STATE_COLORS = {
  open: '#3b82f6',
  in_review: '#f59e0b',
  waiting: '#eab308',
  blocked: '#ef4444',
  resolved: '#10b981',
  reopened: '#8b5cf6',
};

function WorkItemNode({ data, selected }) {
  const {
    name,
    description,
    itemType = 'other',
    volatility = 'medium',
    itemState = 'open',
    reversibility,
    signals = [],
    onEdit,
    onClick,
    onAssessVolatility,
  } = data;

  const Icon = WORK_ITEM_TYPE_ICONS[itemType] || MoreHorizIcon;
  const volStyle = VOLATILITY_COLORS[volatility] || VOLATILITY_COLORS.medium;
  const stateColor = STATE_COLORS[itemState] || STATE_COLORS.open;

  return (
    <div
      className={`dwd-work-item-node ${selected ? 'dwd-work-item-node--selected' : ''}`}
      style={{ borderColor: volStyle.border }}
      onClick={() => onClick?.(data)}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="dwd-node-handle" />
      <Handle type="source" position={Position.Bottom} className="dwd-node-handle" />
      <Handle type="target" position={Position.Left} className="dwd-node-handle" />
      <Handle type="source" position={Position.Right} className="dwd-node-handle" />

      {/* Header with volatility indicator */}
      <div className="dwd-work-item-node__header">
        <div className="dwd-work-item-node__icon" style={{ backgroundColor: volStyle.bg, color: volStyle.color }}>
          <Icon fontSize="small" />
        </div>
        <div className="dwd-work-item-node__title">
          <span className="dwd-work-item-node__type">{itemType.replace('_', ' ')}</span>
          <span className="dwd-work-item-node__name">{name}</span>
        </div>
      </div>

      {/* Volatility and State badges */}
      <div className="dwd-work-item-node__badges">
        <button
          className="dwd-work-item-node__volatility"
          style={{ backgroundColor: volStyle.bg, color: volStyle.color }}
          onClick={(e) => {
            e.stopPropagation();
            onAssessVolatility?.(data);
          }}
          title="Click to assess volatility"
        >
          <SpeedIcon style={{ fontSize: 12 }} />
          {volatility}
        </button>
        <span
          className="dwd-work-item-node__state"
          style={{ backgroundColor: stateColor }}
        >
          {itemState.replace('_', ' ')}
        </span>
      </div>

      {/* Description if short */}
      {description && description.length <= 60 && (
        <div className="dwd-work-item-node__description">
          {description}
        </div>
      )}

      {/* Signals if any */}
      {signals.length > 0 && (
        <div className="dwd-work-item-node__signals">
          {signals.slice(0, 2).map((signal, idx) => (
            <div
              key={idx}
              className="dwd-work-item-node__signal"
              style={{ backgroundColor: signal.color || '#ef4444' }}
              title={signal.name}
            >
              {signal.type || 'signal'}
            </div>
          ))}
          {signals.length > 2 && (
            <span className="dwd-work-item-node__more-signals">
              +{signals.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Reversibility hint */}
      {reversibility && (
        <div className={`dwd-work-item-node__reversibility dwd-work-item-node__reversibility--${reversibility}`}>
          {reversibility === 'easy' ? 'Easy to reverse' :
           reversibility === 'hard' ? 'Hard to reverse' : 'Reversible'}
        </div>
      )}

      <style jsx>{`
        .dwd-work-item-node {
          background: var(--panel, #ffffff);
          border: 2px solid;
          border-radius: 8px;
          min-width: 160px;
          max-width: 200px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .dwd-work-item-node:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .dwd-work-item-node--selected {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .dwd-work-item-node__header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }

        .dwd-work-item-node__icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dwd-work-item-node__title {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .dwd-work-item-node__type {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted, #64748b);
        }

        .dwd-work-item-node__name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text, #1e293b);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dwd-work-item-node__badges {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
        }

        .dwd-work-item-node__volatility {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 500;
          text-transform: capitalize;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dwd-work-item-node__volatility:hover {
          filter: brightness(0.95);
          transform: scale(1.02);
        }

        .dwd-work-item-node__state {
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 500;
          color: white;
          text-transform: capitalize;
        }

        .dwd-work-item-node__description {
          padding: 0 10px 8px;
          font-size: 10px;
          color: var(--text-muted, #64748b);
          line-height: 1.4;
        }

        .dwd-work-item-node__signals {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 10px 8px;
          flex-wrap: wrap;
        }

        .dwd-work-item-node__signal {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 500;
          color: white;
          text-transform: capitalize;
        }

        .dwd-work-item-node__more-signals {
          font-size: 9px;
          color: var(--text-muted, #64748b);
        }

        .dwd-work-item-node__reversibility {
          padding: 6px 10px;
          font-size: 9px;
          color: var(--text-muted, #64748b);
          background: var(--bg, #f8fafc);
          border-radius: 0 0 6px 6px;
          text-align: center;
        }

        .dwd-work-item-node__reversibility--easy {
          color: #16a34a;
          background: rgba(22, 163, 74, 0.05);
        }

        .dwd-work-item-node__reversibility--hard {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.05);
        }
      `}</style>
    </div>
  );
}

export default memo(WorkItemNode);
