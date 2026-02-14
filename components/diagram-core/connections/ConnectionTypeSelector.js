// components/diagram-core/connections/ConnectionTypeSelector.js
// Popup for selecting connection type when creating connections

import { useState, useEffect, useRef } from 'react';

export default function ConnectionTypeSelector({
  position,
  types = [],
  defaultType,
  onSelect,
  onCancel,
}) {
  const [selectedType, setSelectedType] = useState(defaultType);
  const [selectedStyle, setSelectedStyle] = useState('bezier');
  const popupRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onCancel?.();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);

  const handleConfirm = () => {
    onSelect?.({
      type: selectedType,
      style: selectedStyle,
    });
  };

  const connectionStyles = [
    { id: 'straight', name: 'Straight', icon: '—' },
    { id: 'bezier', name: 'Curved', icon: '⌒' },
    { id: 'arc', name: 'Arc', icon: '⌓' },
    { id: 'orthogonal', name: 'Orthogonal', icon: '⊏' },
  ];

  // Default types if none provided
  const displayTypes = types.length > 0 ? types : [
    { id: 'arrow', name: 'Arrow', color: '#374151', arrowEnd: 'arrow' },
    { id: 'line', name: 'Line', color: '#6b7280', arrowEnd: 'none' },
    { id: 'dashed', name: 'Dashed', color: '#9ca3af', strokeStyle: 'dashed' },
  ];

  return (
    <div
      ref={popupRef}
      className="dc-connection-type-selector"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="dc-cts-header">Connection Type</div>

      {/* Connection types */}
      <div className="dc-cts-section">
        <div className="dc-cts-label">Type</div>
        <div className="dc-cts-types">
          {displayTypes.map(type => (
            <button
              key={type.id}
              className={`dc-cts-type ${selectedType === type.id ? 'selected' : ''}`}
              onClick={() => setSelectedType(type.id)}
              title={type.name}
            >
              <div
                className="dc-cts-type-preview"
                style={{ borderColor: type.color }}
              >
                <svg width="32" height="16" viewBox="0 0 32 16">
                  <line
                    x1="2"
                    y1="8"
                    x2="26"
                    y2="8"
                    stroke={type.color}
                    strokeWidth="2"
                    strokeDasharray={type.strokeStyle === 'dashed' ? '4 2' : type.strokeStyle === 'dotted' ? '2 2' : undefined}
                    markerEnd={type.arrowEnd !== 'none' ? `url(#arrowPreview-${type.id})` : undefined}
                  />
                  {type.arrowEnd !== 'none' && (
                    <defs>
                      <marker
                        id={`arrowPreview-${type.id}`}
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="4"
                        markerHeight="4"
                        orient="auto"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={type.color} />
                      </marker>
                    </defs>
                  )}
                </svg>
              </div>
              <span className="dc-cts-type-name">{type.name}</span>
              {type.polarity && (
                <span className="dc-cts-polarity">{type.polarity}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Connection styles */}
      <div className="dc-cts-section">
        <div className="dc-cts-label">Style</div>
        <div className="dc-cts-styles">
          {connectionStyles.map(style => (
            <button
              key={style.id}
              className={`dc-cts-style ${selectedStyle === style.id ? 'selected' : ''}`}
              onClick={() => setSelectedStyle(style.id)}
              title={style.name}
            >
              <span className="dc-cts-style-icon">{style.icon}</span>
              <span className="dc-cts-style-name">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="dc-cts-actions">
        <button className="dc-cts-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="dc-cts-confirm" onClick={handleConfirm}>
          Connect
        </button>
      </div>
    </div>
  );
}
