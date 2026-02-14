/**
 * PresenceAvatars Component
 * Displays avatars of active collaborators in the toolbar
 */

import React, { useMemo } from 'react';
import { usePresence } from '../hooks/useCollaboration.js';

/**
 * Single avatar component
 */
function Avatar({ user, size = 32, showTooltip = true }) {
  const initials = useMemo(() => {
    if (!user.odName) return '?';
    const parts = user.odName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.odName.slice(0, 2).toUpperCase();
  }, [user.odName]);

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: user.color || '#6366f1',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    fontWeight: 600,
    border: '2px solid #ffffff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    cursor: 'default',
    position: 'relative',
  };

  const tooltipStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    marginBottom: '4px',
    opacity: 0,
    transition: 'opacity 0.2s',
    pointerEvents: 'none',
  };

  const [showingTooltip, setShowingTooltip] = React.useState(false);

  return (
    <div
      style={style}
      onMouseEnter={() => setShowingTooltip(true)}
      onMouseLeave={() => setShowingTooltip(false)}
      title={showTooltip ? user.odName : undefined}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.odName}
          style={{ width: '100%', height: '100%', borderRadius: '50%' }}
        />
      ) : (
        initials
      )}
      {showTooltip && showingTooltip && (
        <div style={{ ...tooltipStyle, opacity: 1 }}>
          {user.odName}
        </div>
      )}
    </div>
  );
}

/**
 * Presence avatars group
 */
export function PresenceAvatars({
  maxVisible = 5,
  size = 32,
  spacing = -8,
  showCount = true,
}) {
  const { activeCollaborators, collaboratorCount } = usePresence();

  const visibleCollaborators = useMemo(
    () => activeCollaborators.slice(0, maxVisible),
    [activeCollaborators, maxVisible]
  );

  const overflowCount = useMemo(
    () => Math.max(0, collaboratorCount - maxVisible),
    [collaboratorCount, maxVisible]
  );

  if (collaboratorCount === 0) {
    return null;
  }

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  };

  const avatarsStyle = {
    display: 'flex',
    flexDirection: 'row-reverse',
  };

  const avatarWrapperStyle = (index) => ({
    marginLeft: index > 0 ? spacing : 0,
    zIndex: visibleCollaborators.length - index,
  });

  const overflowStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.35,
    fontWeight: 600,
    border: '2px solid #ffffff',
    marginLeft: spacing,
  };

  return (
    <div style={containerStyle}>
      <div style={avatarsStyle}>
        {overflowCount > 0 && (
          <div style={overflowStyle} title={`+${overflowCount} more`}>
            +{overflowCount}
          </div>
        )}
        {visibleCollaborators.map((user, index) => (
          <div key={user.odId} style={avatarWrapperStyle(index)}>
            <Avatar user={user} size={size} />
          </div>
        ))}
      </div>
      {showCount && (
        <span
          style={{
            marginLeft: 8,
            fontSize: 14,
            color: '#6b7280',
          }}
        >
          {collaboratorCount} online
        </span>
      )}
    </div>
  );
}

export default PresenceAvatars;
