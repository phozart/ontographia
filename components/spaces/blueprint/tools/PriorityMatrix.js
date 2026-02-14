// components/spaces/blueprint/tools/PriorityMatrix.js
// 2×2 Value vs Effort Priority Matrix

import { useState, useCallback, useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';

// MUI Icons
import GridViewIcon from '@mui/icons-material/GridView';
import SaveIcon from '@mui/icons-material/Save';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import BlockIcon from '@mui/icons-material/Block';

const QUADRANTS = [
  {
    id: 'quick-wins',
    name: 'Quick Wins',
    description: 'High Value, Low Effort - Do First!',
    icon: RocketLaunchIcon,
    color: '#5B8A6A',
    position: { value: 'high', effort: 'low' },
  },
  {
    id: 'big-bets',
    name: 'Big Bets',
    description: 'High Value, High Effort - Plan Carefully',
    icon: ScheduleIcon,
    color: '#3B82F6',
    position: { value: 'high', effort: 'high' },
  },
  {
    id: 'fill-ins',
    name: 'Fill-Ins',
    description: 'Low Value, Low Effort - If Time Permits',
    icon: LowPriorityIcon,
    color: '#C9A227',
    position: { value: 'low', effort: 'low' },
  },
  {
    id: 'money-pit',
    name: 'Money Pit',
    description: 'Low Value, High Effort - Avoid!',
    icon: BlockIcon,
    color: '#A54D4D',
    position: { value: 'low', effort: 'high' },
  },
];

export default function PriorityMatrix({ onSelectInitiative }) {
  const { initiatives, updateInitiative } = useBlueprint();
  const [hasChanges, setHasChanges] = useState(false);
  const [localPositions, setLocalPositions] = useState({});
  const [draggingId, setDraggingId] = useState(null);

  // Get active initiatives
  const activeInitiatives = useMemo(() => {
    return initiatives.filter(i => !['approved', 'declined'].includes(i.status));
  }, [initiatives]);

  // Group initiatives by quadrant
  const byQuadrant = useMemo(() => {
    const grouped = {
      'quick-wins': [],
      'big-bets': [],
      'fill-ins': [],
      'money-pit': [],
      'unassigned': [],
    };

    activeInitiatives.forEach(init => {
      const position = localPositions[init.id] || init.priorityQuadrant;
      if (position && grouped[position]) {
        grouped[position].push(init);
      } else {
        grouped['unassigned'].push(init);
      }
    });

    return grouped;
  }, [activeInitiatives, localPositions]);

  const handleDragStart = useCallback((e, initId) => {
    setDraggingId(initId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, quadrantId) => {
    e.preventDefault();
    if (!draggingId) return;

    setLocalPositions(prev => ({
      ...prev,
      [draggingId]: quadrantId,
    }));
    setHasChanges(true);
    setDraggingId(null);
  }, [draggingId]);

  const handleSaveAll = useCallback(async () => {
    try {
      await Promise.all(
        Object.entries(localPositions).map(([initId, quadrant]) =>
          updateInitiative(initId, { priorityQuadrant: quadrant })
        )
      );
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save positions:', error);
    }
  }, [localPositions, updateInitiative]);

  return (
    <div className="priority-matrix">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <GridViewIcon />
          <div>
            <h2>Priority Matrix</h2>
            <p>Drag initiatives into quadrants based on Value vs Effort</p>
          </div>
        </div>
        <div className="canvas-header-right">
          {hasChanges && (
            <button className="btn btn-primary" onClick={handleSaveAll}>
              <SaveIcon fontSize="small" />
              Save Positions
            </button>
          )}
        </div>
      </div>

      {/* Axis labels */}
      <div className="priority-matrix-labels">
        <div className="priority-matrix-label priority-matrix-label--y">
          <span>High Value</span>
          <div className="priority-matrix-arrow priority-matrix-arrow--up" />
          <span>Low Value</span>
        </div>
        <div className="priority-matrix-label priority-matrix-label--x">
          <span>Low Effort</span>
          <div className="priority-matrix-arrow priority-matrix-arrow--right" />
          <span>High Effort</span>
        </div>
      </div>

      {/* Matrix grid */}
      <div className="priority-matrix-grid">
        {QUADRANTS.map(quadrant => {
          const Icon = quadrant.icon;
          const items = byQuadrant[quadrant.id] || [];

          return (
            <div
              key={quadrant.id}
              className={`priority-quadrant priority-quadrant--${quadrant.id}`}
              style={{ '--quadrant-color': quadrant.color }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, quadrant.id)}
            >
              <div className="priority-quadrant-header">
                <Icon style={{ color: quadrant.color }} />
                <h3>{quadrant.name}</h3>
                <span className="priority-quadrant-count">{items.length}</span>
              </div>
              <p className="priority-quadrant-description">{quadrant.description}</p>

              <div className="priority-quadrant-items">
                {items.map(init => {
                  const stageInfo = BPS_STAGE_INFO[init.status] || {};
                  return (
                    <div
                      key={init.id}
                      className="priority-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, init.id)}
                      onClick={() => onSelectInitiative?.(init)}
                    >
                      <span
                        className="priority-item-stage"
                        style={{ backgroundColor: stageInfo.color }}
                      />
                      <div className="priority-item-info">
                        <span className="priority-item-id">{init.display_id}</span>
                        <span className="priority-item-name">{init.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned items */}
      {byQuadrant.unassigned.length > 0 && (
        <div className="priority-unassigned">
          <h3>Unassigned ({byQuadrant.unassigned.length})</h3>
          <p>Drag these initiatives into the matrix above</p>
          <div className="priority-unassigned-items">
            {byQuadrant.unassigned.map(init => {
              const stageInfo = BPS_STAGE_INFO[init.status] || {};
              return (
                <div
                  key={init.id}
                  className="priority-item priority-item--unassigned"
                  draggable
                  onDragStart={(e) => handleDragStart(e, init.id)}
                >
                  <span
                    className="priority-item-stage"
                    style={{ backgroundColor: stageInfo.color }}
                  />
                  <div className="priority-item-info">
                    <span className="priority-item-id">{init.display_id}</span>
                    <span className="priority-item-name">{init.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
