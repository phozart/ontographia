// components/dwd/nodes/ActorNode.js
// Custom ReactFlow node for DWD Actors
// Shows actor name, type, authority level, and work items

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ACTOR_TYPE_ICONS = {
  person: PersonIcon,
  team: GroupsIcon,
  system: SmartToyIcon,
};

const AUTHORITY_COLORS = {
  low: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '#ef4444' },
  medium: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '#f59e0b' },
  high: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '#10b981' },
};

function ActorNode({ data, selected }) {
  const {
    name,
    actorType = 'person',
    authorityLevel = 'medium',
    constraints,
    workItems = [],
    hasWarning = false,
    onEdit,
    onClick,
  } = data;

  const Icon = ACTOR_TYPE_ICONS[actorType] || PersonIcon;
  const authorityStyle = AUTHORITY_COLORS[authorityLevel] || AUTHORITY_COLORS.medium;

  return (
    <div
      className={`dwd-actor-node ${selected ? 'dwd-actor-node--selected' : ''} ${hasWarning ? 'dwd-actor-node--warning' : ''}`}
      onClick={() => onClick?.(data)}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="dwd-node-handle" />
      <Handle type="source" position={Position.Bottom} className="dwd-node-handle" />
      <Handle type="target" position={Position.Left} className="dwd-node-handle" />
      <Handle type="source" position={Position.Right} className="dwd-node-handle" />

      {/* Header */}
      <div className="dwd-actor-node__header">
        <div className="dwd-actor-node__icon" style={{ backgroundColor: authorityStyle.bg, color: authorityStyle.color }}>
          <Icon fontSize="small" />
        </div>
        <div className="dwd-actor-node__title">
          <span className="dwd-actor-node__type">{actorType}</span>
          <span className="dwd-actor-node__name">{name}</span>
        </div>
        {hasWarning && (
          <WarningAmberIcon className="dwd-actor-node__warning-icon" fontSize="small" />
        )}
      </div>

      {/* Authority badge */}
      <div
        className="dwd-actor-node__authority"
        style={{ backgroundColor: authorityStyle.bg, color: authorityStyle.color, borderColor: authorityStyle.border }}
      >
        Authority: {authorityLevel}
      </div>

      {/* Work items if any */}
      {workItems.length > 0 && (
        <div className="dwd-actor-node__work-items">
          {workItems.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="dwd-actor-node__work-item"
              style={{
                borderLeftColor: item.volatilityColor || '#6b7280',
              }}
            >
              <span className="dwd-actor-node__work-item-name">{item.name}</span>
              {item.volatility && (
                <span
                  className="dwd-actor-node__work-item-vol"
                  style={{ backgroundColor: item.volatilityColor || '#6b7280' }}
                >
                  {item.volatility[0]?.toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {workItems.length > 3 && (
            <div className="dwd-actor-node__more">+{workItems.length - 3} more</div>
          )}
        </div>
      )}

      {/* Constraints hint */}
      {constraints && (
        <div className="dwd-actor-node__constraints">
          {constraints.length > 50 ? constraints.slice(0, 50) + '...' : constraints}
        </div>
      )}

      <style jsx>{`
        .dwd-actor-node {
          background: var(--panel, #ffffff);
          border: 2px solid var(--border, #e5e7eb);
          border-radius: 12px;
          min-width: 180px;
          max-width: 220px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .dwd-actor-node:hover {
          border-color: var(--accent, #6366f1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .dwd-actor-node--selected {
          border-color: var(--accent, #6366f1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .dwd-actor-node--warning {
          border-color: #f59e0b;
        }

        .dwd-actor-node__header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }

        .dwd-actor-node__icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dwd-actor-node__title {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .dwd-actor-node__type {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted, #64748b);
        }

        .dwd-actor-node__name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text, #1e293b);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dwd-actor-node__warning-icon {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .dwd-actor-node__authority {
          margin: 8px 12px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-align: center;
          border: 1px solid;
          text-transform: capitalize;
        }

        .dwd-actor-node__work-items {
          padding: 0 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dwd-actor-node__work-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          padding: 4px 8px;
          background: var(--bg, #f8fafc);
          border-radius: 4px;
          border-left: 3px solid;
          font-size: 11px;
        }

        .dwd-actor-node__work-item-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text, #1e293b);
        }

        .dwd-actor-node__work-item-vol {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 9px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .dwd-actor-node__more {
          font-size: 10px;
          color: var(--text-muted, #64748b);
          text-align: center;
          padding: 2px;
        }

        .dwd-actor-node__constraints {
          padding: 8px 12px;
          font-size: 10px;
          color: var(--text-muted, #64748b);
          background: var(--bg, #f8fafc);
          border-radius: 0 0 10px 10px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default memo(ActorNode);
