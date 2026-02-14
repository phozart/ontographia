/**
 * RemoteSelections Component
 * Shows selection outlines for elements selected by other collaborators
 */

import React, { useMemo } from 'react';
import { usePresence } from '../hooks/useCollaboration.js';
import { useDiagram } from '../hooks/useDiagram.js';

/**
 * Selection outline for a single element
 */
function SelectionOutline({ element, user, scale = 1 }) {
  if (!element?.position || !element?.size) {
    return null;
  }

  const padding = 4 / scale;
  const strokeWidth = 2 / scale;
  const borderRadius = 4 / scale;

  const outlineStyle = {
    position: 'absolute',
    left: element.position.x - padding,
    top: element.position.y - padding,
    width: element.size.width + padding * 2,
    height: element.size.height + padding * 2,
    border: `${strokeWidth}px dashed ${user.color || '#6366f1'}`,
    borderRadius: borderRadius,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };

  const badgeStyle = {
    position: 'absolute',
    top: -20 / scale,
    left: 0,
    backgroundColor: user.color || '#6366f1',
    color: '#ffffff',
    padding: `${2 / scale}px ${6 / scale}px`,
    borderRadius: `${3 / scale}px`,
    fontSize: `${11 / scale}px`,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    maxWidth: 80 / scale,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div style={outlineStyle}>
      <div style={badgeStyle}>
        {user.odName?.split(' ')[0] || 'User'}
      </div>
    </div>
  );
}

/**
 * User's selection group (all elements selected by one user)
 */
function UserSelections({ user, elements, scale = 1 }) {
  const selectedElements = useMemo(() => {
    if (!user.selectedIds || user.selectedIds.length === 0) {
      return [];
    }

    return user.selectedIds
      .map((id) => elements[id])
      .filter(Boolean);
  }, [user.selectedIds, elements]);

  if (selectedElements.length === 0) {
    return null;
  }

  return (
    <>
      {selectedElements.map((element) => (
        <SelectionOutline
          key={`${user.odId}-${element.id}`}
          element={element}
          user={user}
          scale={scale}
        />
      ))}
    </>
  );
}

/**
 * RemoteSelections container
 */
export function RemoteSelections({ scale = 1 }) {
  const { activeCollaborators } = usePresence();
  const { state } = useDiagram();

  const collaboratorsWithSelections = useMemo(
    () => activeCollaborators.filter((c) => c.selectedIds && c.selectedIds.length > 0),
    [activeCollaborators]
  );

  const containerStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle}>
      {collaboratorsWithSelections.map((user) => (
        <UserSelections
          key={user.odId}
          user={user}
          elements={state.elements}
          scale={scale}
        />
      ))}
    </div>
  );
}

/**
 * Collaborative selection badge for a single element
 * Shows who else is selecting the same element
 */
export function CollaboratorBadge({ elementId, scale = 1 }) {
  const { activeCollaborators } = usePresence();

  const selectingUsers = useMemo(
    () => activeCollaborators.filter((c) => c.selectedIds?.includes(elementId)),
    [activeCollaborators, elementId]
  );

  if (selectingUsers.length === 0) {
    return null;
  }

  const badgeStyle = {
    display: 'flex',
    gap: 2 / scale,
    position: 'absolute',
    top: -16 / scale,
    right: 0,
  };

  const dotStyle = (color) => ({
    width: 8 / scale,
    height: 8 / scale,
    borderRadius: '50%',
    backgroundColor: color || '#6366f1',
    border: `${1 / scale}px solid #ffffff`,
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  });

  return (
    <div style={badgeStyle}>
      {selectingUsers.map((user) => (
        <div
          key={user.odId}
          style={dotStyle(user.color)}
          title={user.odName}
        />
      ))}
    </div>
  );
}

export default RemoteSelections;
