// components/spaces/blueprint/tools/SWOTCanvas.js
// SWOT Analysis Canvas

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import GridViewIcon from '@mui/icons-material/GridView';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

const SWOT_SECTIONS = [
  {
    id: 'strengths',
    name: 'Strengths',
    icon: ThumbUpIcon,
    color: '#5B8A6A',
    hint: 'Internal positives - What do we do well?',
    quadrant: 'positive-internal',
  },
  {
    id: 'weaknesses',
    name: 'Weaknesses',
    icon: ThumbDownIcon,
    color: '#A54D4D',
    hint: 'Internal negatives - Where can we improve?',
    quadrant: 'negative-internal',
  },
  {
    id: 'opportunities',
    name: 'Opportunities',
    icon: TrendingUpIcon,
    color: '#3B82F6',
    hint: 'External positives - What could we take advantage of?',
    quadrant: 'positive-external',
  },
  {
    id: 'threats',
    name: 'Threats',
    icon: WarningIcon,
    color: '#C9A227',
    hint: 'External negatives - What could hurt us?',
    quadrant: 'negative-external',
  },
];

const EMPTY_CANVAS = {
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
};

export default function SWOTCanvas() {
  const { updateInitiative, activeInitiative } = useBlueprint();

  // Use activeInitiative from context
  const selectedInitiative = activeInitiative;

  const canvasData = useMemo(() => {
    return selectedInitiative?.canvases?.swot || EMPTY_CANVAS;
  }, [selectedInitiative]);

  const [localData, setLocalData] = useState(canvasData);
  const [hasChanges, setHasChanges] = useState(false);
  const [newItems, setNewItems] = useState({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
  });

  // Reset local data when selected initiative changes
  useEffect(() => {
    setLocalData(selectedInitiative?.canvases?.swot || EMPTY_CANVAS);
    setHasChanges(false);
  }, [selectedInitiative?.id]);

  const handleAddItem = useCallback((section) => {
    const value = newItems[section]?.trim();
    if (!value) return;

    setLocalData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), { id: Date.now(), text: value, priority: 'medium' }],
    }));
    setNewItems(prev => ({ ...prev, [section]: '' }));
    setHasChanges(true);
  }, [newItems]);

  const handleRemoveItem = useCallback((section, itemId) => {
    setLocalData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== itemId),
    }));
    setHasChanges(true);
  }, []);

  const handlePriorityChange = useCallback((section, itemId, priority) => {
    setLocalData(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === itemId ? { ...item, priority } : item
      ),
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedInitiative) return;

    try {
      await updateInitiative(selectedInitiative.id, {
        canvases: {
          ...selectedInitiative.canvases,
          swot: localData,
        },
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  }, [selectedInitiative, localData, updateInitiative]);

  if (!selectedInitiative) {
    return (
      <div className="canvas-empty">
        <GridViewIcon />
        <h3>Select an Initiative</h3>
        <p>Choose an initiative from the Initiative Board to work on its SWOT Analysis</p>
      </div>
    );
  }

  return (
    <div className="swot-canvas">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <GridViewIcon />
          <div>
            <h2>SWOT Analysis</h2>
            <p>{selectedInitiative.display_id}: {selectedInitiative.name}</p>
          </div>
        </div>
        <div className="canvas-header-right">
          {hasChanges && (
            <button className="btn btn-primary" onClick={handleSave}>
              <SaveIcon fontSize="small" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Axis labels */}
      <div className="swot-canvas-labels">
        <div className="swot-canvas-label swot-canvas-label--top">Positive</div>
        <div className="swot-canvas-label swot-canvas-label--bottom">Negative</div>
        <div className="swot-canvas-label swot-canvas-label--left">Internal</div>
        <div className="swot-canvas-label swot-canvas-label--right">External</div>
      </div>

      <div className="swot-canvas-grid">
        {SWOT_SECTIONS.map(section => {
          const Icon = section.icon;
          const items = localData[section.id] || [];

          return (
            <div
              key={section.id}
              className={`swot-canvas-quadrant swot-canvas-quadrant--${section.id}`}
              style={{ '--quadrant-color': section.color }}
            >
              <div className="swot-quadrant-header">
                <Icon style={{ color: section.color }} />
                <h3>{section.name}</h3>
                <span className="swot-quadrant-count">{items.length}</span>
              </div>
              <p className="swot-quadrant-hint">{section.hint}</p>

              <div className="swot-quadrant-items">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`swot-item swot-item--${item.priority}`}
                  >
                    <span className="swot-item-text">{item.text}</span>
                    <div className="swot-item-actions">
                      <select
                        className="swot-item-priority"
                        value={item.priority}
                        onChange={(e) => handlePriorityChange(section.id, item.id, e.target.value)}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <button
                        className="swot-item-delete"
                        onClick={() => handleRemoveItem(section.id, item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="swot-quadrant-add">
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Add ${section.name.toLowerCase().slice(0, -1)}...`}
                  value={newItems[section.id]}
                  onChange={(e) => setNewItems(prev => ({ ...prev, [section.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem(section.id)}
                />
                <button className="btn btn-icon" onClick={() => handleAddItem(section.id)}>
                  <AddIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
