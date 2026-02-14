// components/diagram-core/connections/RadialTypeSelector.js
// Radial menu for quick connection type selection

import { useState, useEffect, useRef, useCallback } from 'react';

export default function RadialTypeSelector({
  position,
  types = [],
  defaultType,
  onSelect,
  onCancel,
}) {
  const [hoveredType, setHoveredType] = useState(null);
  const containerRef = useRef(null);

  // Configuration
  const radius = 70; // Distance from center to options
  const optionSize = 48; // Size of each option button
  const centerSize = 40; // Size of center button

  // Close on escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
        return;
      }

      // Number keys for quick selection (1-9)
      const num = parseInt(e.key);
      if (num >= 1 && num <= types.length) {
        onSelect?.({ type: types[num - 1].id });
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        // Use default type when clicking outside
        onSelect?.({ type: defaultType || types[0]?.id });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Delay adding click listener to prevent immediate trigger
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timer);
    };
  }, [types, defaultType, onSelect, onCancel]);

  // Calculate positions for each type in a circle
  const getOptionPosition = useCallback((index, total) => {
    // Start from top (-90 degrees) and go clockwise
    const startAngle = -90;
    const angleStep = 360 / total;
    const angle = (startAngle + index * angleStep) * (Math.PI / 180);

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  }, [radius]);

  const handleTypeClick = (type) => {
    onSelect?.({ type: type.id });
  };

  // Default types if none provided
  const displayTypes = types.length > 0 ? types : [
    { id: 'positive', name: 'Positive', color: '#10b981', polarity: '+' },
    { id: 'negative', name: 'Negative', color: '#ef4444', polarity: '-' },
    { id: 'delayed', name: 'Delayed', color: '#6b7280', polarity: '||' },
  ];

  return (
    <div
      ref={containerRef}
      className="dc-radial-selector"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 0,
        height: 0,
      }}
    >
      {/* Background ring */}
      <div
        className="dc-radial-ring"
        style={{
          position: 'absolute',
          left: -(radius + optionSize / 2 + 10),
          top: -(radius + optionSize / 2 + 10),
          width: (radius + optionSize / 2 + 10) * 2,
          height: (radius + optionSize / 2 + 10) * 2,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      />

      {/* Center cancel/default button */}
      <button
        className="dc-radial-center"
        onClick={() => onSelect?.({ type: defaultType || types[0]?.id })}
        style={{
          position: 'absolute',
          left: -centerSize / 2,
          top: -centerSize / 2,
          width: centerSize,
          height: centerSize,
          borderRadius: '50%',
          border: '2px solid #e5e7eb',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: '#6b7280',
          transition: 'all 0.15s ease',
          zIndex: 10,
        }}
        title="Use default type"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10h12M12 6l4 4-4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Type options */}
      {displayTypes.map((type, index) => {
        const pos = getOptionPosition(index, displayTypes.length);
        const isHovered = hoveredType === type.id;
        const isDefault = type.id === defaultType;

        return (
          <button
            key={type.id}
            className={`dc-radial-option ${isHovered ? 'hovered' : ''} ${isDefault ? 'default' : ''}`}
            onClick={() => handleTypeClick(type)}
            onMouseEnter={() => setHoveredType(type.id)}
            onMouseLeave={() => setHoveredType(null)}
            style={{
              position: 'absolute',
              left: pos.x - optionSize / 2,
              top: pos.y - optionSize / 2,
              width: optionSize,
              height: optionSize,
              borderRadius: '50%',
              border: `3px solid ${type.color}`,
              background: isHovered ? type.color : 'white',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              zIndex: isHovered ? 20 : 5,
              boxShadow: isDefault
                ? `0 0 0 3px ${type.color}40, 0 2px 8px rgba(0,0,0,0.15)`
                : '0 2px 8px rgba(0,0,0,0.1)',
            }}
            title={`${type.name} (${index + 1})`}
          >
            {/* Polarity or icon */}
            <span
              style={{
                fontSize: type.polarity ? '18px' : '14px',
                fontWeight: 'bold',
                color: isHovered ? 'white' : type.color,
                lineHeight: 1,
              }}
            >
              {type.polarity || type.name.charAt(0)}
            </span>

            {/* Keyboard shortcut hint */}
            <span
              style={{
                fontSize: '10px',
                color: isHovered ? 'rgba(255,255,255,0.8)' : '#9ca3af',
                marginTop: '2px',
              }}
            >
              {index + 1}
            </span>
          </button>
        );
      })}

      {/* Hover label */}
      {hoveredType && (
        <div
          className="dc-radial-label"
          style={{
            position: 'absolute',
            left: '50%',
            top: radius + optionSize / 2 + 20,
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 30,
          }}
        >
          {displayTypes.find(t => t.id === hoveredType)?.name || hoveredType}
        </div>
      )}
    </div>
  );
}
