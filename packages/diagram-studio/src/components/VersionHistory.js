/**
 * VersionHistory Component
 * Timeline view of board versions with restore capability
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Format date for display
 */
function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Version entry in timeline
 */
function VersionEntry({
  version,
  isSelected,
  isCurrent,
  onClick,
  onRestore,
  onRename,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(version.name || '');
  const [showMenu, setShowMenu] = useState(false);

  const handleSaveName = () => {
    if (name.trim() && name !== version.name) {
      onRename?.(version.id, name.trim());
    }
    setIsEditing(false);
  };

  const containerStyle = {
    padding: '12px 16px',
    borderLeft: `3px solid ${isSelected ? '#3b82f6' : (isCurrent ? '#10b981' : '#e5e7eb')}`,
    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.15s',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: version.name ? 600 : 400,
    color: version.name ? '#111827' : '#6b7280',
  };

  const timeStyle = {
    fontSize: 12,
    color: '#9ca3af',
  };

  const badgeStyle = {
    padding: '2px 8px',
    borderRadius: 10,
    backgroundColor: isCurrent ? '#dcfce7' : '#f3f4f6',
    color: isCurrent ? '#166534' : '#6b7280',
    fontSize: 10,
    fontWeight: 500,
    marginLeft: 8,
  };

  const statsStyle = {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  };

  const menuButtonStyle = {
    padding: '4px 8px',
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: 16,
  };

  const menuStyle = {
    position: 'absolute',
    right: 16,
    top: 40,
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    zIndex: 100,
    overflow: 'hidden',
    minWidth: 140,
  };

  const menuItemStyle = {
    padding: '10px 16px',
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
  };

  const inputStyle = {
    width: '100%',
    padding: '4px 8px',
    border: '1px solid #3b82f6',
    borderRadius: 4,
    fontSize: 14,
    outline: 'none',
  };

  return (
    <div style={containerStyle} onClick={() => onClick?.(version)}>
      <div style={headerStyle}>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            onClick={(e) => e.stopPropagation()}
            style={inputStyle}
            autoFocus
          />
        ) : (
          <span style={titleStyle}>
            {version.name || 'Auto-save'}
            {isCurrent && <span style={badgeStyle}>Current</span>}
          </span>
        )}

        <button
          style={menuButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          ⋯
        </button>

        {showMenu && (
          <div style={menuStyle} onClick={(e) => e.stopPropagation()}>
            {!isCurrent && (
              <button
                style={menuItemStyle}
                onClick={() => {
                  onRestore?.(version);
                  setShowMenu(false);
                }}
              >
                Restore this version
              </button>
            )}
            <button
              style={menuItemStyle}
              onClick={() => {
                setIsEditing(true);
                setShowMenu(false);
              }}
            >
              {version.name ? 'Rename' : 'Name this version'}
            </button>
            {!isCurrent && (
              <button
                style={{ ...menuItemStyle, color: '#ef4444' }}
                onClick={() => {
                  onDelete?.(version.id);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div style={timeStyle}>{formatDate(version.createdAt)}</div>

      {version.stats && (
        <div style={statsStyle}>
          {version.stats.elements} elements, {version.stats.connections} connections
        </div>
      )}

      {version.user && (
        <div style={statsStyle}>
          by {version.user.name}
        </div>
      )}
    </div>
  );
}

/**
 * Create checkpoint dialog
 */
function CreateCheckpointDialog({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const dialogStyle = {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  };

  const contentStyle = {
    padding: 20,
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
    outline: 'none',
  };

  const footerStyle = {
    padding: '12px 20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  };

  const buttonStyle = (primary) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: primary ? '#3b82f6' : '#f3f4f6',
    color: primary ? '#ffffff' : '#374151',
  });

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Save Version</h3>
        </div>

        <div style={contentStyle}>
          <label style={labelStyle}>Version name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Before major refactor"
            style={inputStyle}
            autoFocus
          />

          <label style={labelStyle}>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What changed in this version?"
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          />
        </div>

        <div style={footerStyle}>
          <button style={buttonStyle(false)} onClick={onClose}>
            Cancel
          </button>
          <button
            style={buttonStyle(true)}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Version
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Restore confirmation dialog
 */
function RestoreDialog({ version, isOpen, onClose, onConfirm }) {
  if (!isOpen || !version) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const dialogStyle = {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
  };

  const buttonStyle = (primary, danger) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: danger ? '#ef4444' : (primary ? '#3b82f6' : '#f3f4f6'),
    color: danger || primary ? '#ffffff' : '#374151',
    marginLeft: 8,
  });

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600 }}>
          Restore Version?
        </h3>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>
          This will restore the board to "{version.name || 'Auto-save'}" from {formatDate(version.createdAt)}.
          A backup of the current state will be saved automatically.
        </p>
        <div>
          <button style={buttonStyle(false)} onClick={onClose}>
            Cancel
          </button>
          <button style={buttonStyle(false, true)} onClick={() => onConfirm(version)}>
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Version History Panel
 */
export function VersionHistory({
  boardId,
  versions = [],
  currentVersionId,
  onVersionSelect,
  onVersionRestore,
  onVersionRename,
  onVersionDelete,
  onCreateCheckpoint,
  onClose,
  isLoading,
}) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showCheckpointDialog, setShowCheckpointDialog] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState(null);

  // Sort versions by date, newest first
  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [versions]
  );

  // Group versions by date
  const groupedVersions = useMemo(() => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    sortedVersions.forEach((version) => {
      const date = new Date(version.createdAt).toDateString();
      let label;

      if (date === today) {
        label = 'Today';
      } else if (date === yesterday) {
        label = 'Yesterday';
      } else {
        label = new Date(version.createdAt).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(version);
    });

    return groups;
  }, [sortedVersions]);

  const handleVersionClick = useCallback((version) => {
    setSelectedVersion(version);
    onVersionSelect?.(version);
  }, [onVersionSelect]);

  const handleRestore = useCallback((version) => {
    setRestoreVersion(null);
    onVersionRestore?.(version);
  }, [onVersionRestore]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e5e7eb',
  };

  const headerStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
  };

  const closeButtonStyle = {
    padding: 4,
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 18,
    color: '#6b7280',
  };

  const toolbarStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
  };

  const saveButtonStyle = {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid #3b82f6',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };

  const listStyle = {
    flex: 1,
    overflowY: 'auto',
  };

  const groupHeaderStyle = {
    padding: '8px 16px',
    backgroundColor: '#f9fafb',
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
  };

  const emptyStyle = {
    padding: 32,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  };

  const loadingStyle = {
    padding: 32,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>Version History</span>
        {onClose && (
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        )}
      </div>

      <div style={toolbarStyle}>
        <button style={saveButtonStyle} onClick={() => setShowCheckpointDialog(true)}>
          <span>💾</span>
          Save current version
        </button>
      </div>

      <div style={listStyle}>
        {isLoading ? (
          <div style={loadingStyle}>Loading versions...</div>
        ) : sortedVersions.length === 0 ? (
          <div style={emptyStyle}>
            No version history yet.<br />
            Save a version to create a restore point.
          </div>
        ) : (
          Object.entries(groupedVersions).map(([label, versionGroup]) => (
            <div key={label}>
              <div style={groupHeaderStyle}>{label}</div>
              {versionGroup.map((version) => (
                <VersionEntry
                  key={version.id}
                  version={version}
                  isSelected={selectedVersion?.id === version.id}
                  isCurrent={version.id === currentVersionId}
                  onClick={handleVersionClick}
                  onRestore={() => setRestoreVersion(version)}
                  onRename={onVersionRename}
                  onDelete={onVersionDelete}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <CreateCheckpointDialog
        isOpen={showCheckpointDialog}
        onClose={() => setShowCheckpointDialog(false)}
        onSave={onCreateCheckpoint}
      />

      <RestoreDialog
        version={restoreVersion}
        isOpen={!!restoreVersion}
        onClose={() => setRestoreVersion(null)}
        onConfirm={handleRestore}
      />
    </div>
  );
}

/**
 * Hook to manage version history
 */
export function useVersionHistory(boardId) {
  const [versions, setVersions] = useState([]);
  const [currentVersionId, setCurrentVersionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load versions
  const loadVersions = useCallback(async () => {
    if (!boardId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/boards/${boardId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
        setCurrentVersionId(data.currentVersionId);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  // Create checkpoint
  const createCheckpoint = useCallback(async ({ name, description }) => {
    if (!boardId) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const newVersion = await response.json();
        setVersions((prev) => [newVersion, ...prev]);
        return newVersion;
      }
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
    }
  }, [boardId]);

  // Restore version
  const restoreVersion = useCallback(async (version) => {
    if (!boardId || !version) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/versions/${version.id}/restore`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentVersionId(version.id);
        // Reload versions to get the backup that was created
        loadVersions();
        return result;
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  }, [boardId, loadVersions]);

  // Rename version
  const renameVersion = useCallback(async (versionId, name) => {
    if (!boardId) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setVersions((prev) =>
          prev.map((v) => (v.id === versionId ? { ...v, name } : v))
        );
      }
    } catch (error) {
      console.error('Failed to rename version:', error);
    }
  }, [boardId]);

  // Delete version
  const deleteVersion = useCallback(async (versionId) => {
    if (!boardId) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/versions/${versionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVersions((prev) => prev.filter((v) => v.id !== versionId));
      }
    } catch (error) {
      console.error('Failed to delete version:', error);
    }
  }, [boardId]);

  // Load on mount
  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  return {
    versions,
    currentVersionId,
    isLoading,
    loadVersions,
    createCheckpoint,
    restoreVersion,
    renameVersion,
    deleteVersion,
  };
}

export default VersionHistory;
