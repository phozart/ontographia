/**
 * RemoteCursors Component
 * Renders cursors of other collaborators on the canvas
 */

import React, { useMemo } from 'react';
import { usePresence } from '../hooks/useCollaboration.js';

/**
 * Single cursor component
 */
function Cursor({ user, scale = 1 }) {
  const cursorStyle = {
    position: 'absolute',
    left: user.cursor?.x || 0,
    top: user.cursor?.y || 0,
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'left 0.05s linear, top 0.05s linear',
    transform: `scale(${1 / scale})`,
    transformOrigin: 'top left',
  };

  const svgStyle = {
    width: 24,
    height: 24,
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
  };

  const labelStyle = {
    position: 'absolute',
    left: 16,
    top: 16,
    backgroundColor: user.color || '#6366f1',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  };

  return (
    <div style={cursorStyle}>
      <svg style={svgStyle} viewBox="0 0 24 24" fill={user.color || '#6366f1'}>
        <path d="M4 4 L4 19 L9 14 L14 19 L14 4 Z" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
      <div style={labelStyle}>
        {user.odName}
      </div>
    </div>
  );
}

/**
 * Animated cursor with smooth interpolation
 */
function AnimatedCursor({ user, scale = 1 }) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const targetRef = React.useRef({ x: 0, y: 0 });
  const frameRef = React.useRef();

  React.useEffect(() => {
    if (user.cursor) {
      targetRef.current = { x: user.cursor.x, y: user.cursor.y };
    }
  }, [user.cursor]);

  React.useEffect(() => {
    const animate = () => {
      setPosition((prev) => {
        const dx = targetRef.current.x - prev.x;
        const dy = targetRef.current.y - prev.y;

        // Smooth interpolation
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          return targetRef.current;
        }

        return {
          x: prev.x + dx * 0.3,
          y: prev.y + dy * 0.3,
        };
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const cursorStyle = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    pointerEvents: 'none',
    zIndex: 9999,
    transform: `scale(${1 / scale})`,
    transformOrigin: 'top left',
    willChange: 'left, top',
  };

  const svgStyle = {
    width: 20,
    height: 20,
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
  };

  const labelStyle = {
    position: 'absolute',
    left: 14,
    top: 14,
    backgroundColor: user.color || '#6366f1',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    maxWidth: 100,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  if (!user.cursor) {
    return null;
  }

  return (
    <div style={cursorStyle}>
      <svg style={svgStyle} viewBox="0 0 24 24">
        <path
          d="M5.5 3.5 L5.5 20.5 L10.5 15.5 L16.5 20.5 L16.5 3.5 Z"
          fill={user.color || '#6366f1'}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div style={labelStyle}>
        {user.odName?.split(' ')[0] || 'User'}
      </div>
    </div>
  );
}

/**
 * RemoteCursors container
 */
export function RemoteCursors({ scale = 1, animated = true }) {
  const { activeCollaborators } = usePresence();

  const cursorsWithPosition = useMemo(
    () => activeCollaborators.filter((c) => c.cursor),
    [activeCollaborators]
  );

  const containerStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  const CursorComponent = animated ? AnimatedCursor : Cursor;

  return (
    <div style={containerStyle}>
      {cursorsWithPosition.map((user) => (
        <CursorComponent key={user.odId} user={user} scale={scale} />
      ))}
    </div>
  );
}

export default RemoteCursors;
