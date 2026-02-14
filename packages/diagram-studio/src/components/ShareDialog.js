/**
 * ShareDialog Component
 * Modal for sharing boards and managing access
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Role selector dropdown
 */
function RoleSelector({ value, onChange, disabled }) {
  const roles = [
    { value: 'editor', label: 'Can edit', description: 'Full editing access' },
    { value: 'commenter', label: 'Can comment', description: 'View and comment only' },
    { value: 'viewer', label: 'Can view', description: 'View only access' },
  ];

  const [isOpen, setIsOpen] = useState(false);

  const selectedRole = roles.find((r) => r.value === value) || roles[2];

  const containerStyle = {
    position: 'relative',
  };

  const buttonStyle = {
    padding: '6px 24px 6px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    fontSize: 13,
    color: '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    width: 180,
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    zIndex: 100,
    overflow: 'hidden',
  };

  const optionStyle = (isSelected) => ({
    padding: '10px 12px',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
  });

  return (
    <div style={containerStyle}>
      <button
        style={buttonStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedRole.label}
        <span style={{ position: 'absolute', right: 8 }}>▾</span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          {roles.map((role) => (
            <div
              key={role.value}
              style={optionStyle(role.value === value)}
              onClick={() => {
                onChange(role.value);
                setIsOpen(false);
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                {role.label}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                {role.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Member row in the list
 */
function MemberRow({ member, isOwner, onRoleChange, onRemove, canManage }) {
  const avatarStyle = {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  };

  const infoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  };

  const nameStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: '#111827',
  };

  const emailStyle = {
    fontSize: 12,
    color: '#6b7280',
  };

  const badgeStyle = {
    padding: '2px 8px',
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontSize: 11,
    fontWeight: 500,
    marginLeft: 8,
  };

  const removeButtonStyle = {
    padding: '4px 8px',
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontSize: 12,
    cursor: 'pointer',
    marginLeft: 8,
  };

  return (
    <div style={rowStyle}>
      <div style={infoStyle}>
        <div style={avatarStyle}>
          {member.name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={nameStyle}>{member.name || member.email}</span>
            {isOwner && <span style={badgeStyle}>Owner</span>}
          </div>
          {member.name && <div style={emailStyle}>{member.email}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isOwner ? (
          <span style={{ fontSize: 13, color: '#6b7280' }}>Owner</span>
        ) : (
          <>
            <RoleSelector
              value={member.role}
              onChange={(role) => onRoleChange(member.id, role)}
              disabled={!canManage}
            />
            {canManage && (
              <button style={removeButtonStyle} onClick={() => onRemove(member.id)}>
                Remove
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Share dialog component
 */
export function ShareDialog({
  isOpen,
  onClose,
  boardId,
  boardName,
  members = [],
  currentUserId,
  onInvite,
  onUpdateRole,
  onRemoveMember,
  onCopyLink,
  onCreateShareLink,
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkRole, setLinkRole] = useState('viewer');
  const [copySuccess, setCopySuccess] = useState(false);

  const currentUserRole = useMemo(
    () => members.find((m) => m.userId === currentUserId)?.role || 'viewer',
    [members, currentUserId]
  );

  const canManage = currentUserRole === 'owner' || currentUserRole === 'editor';
  const isOwner = members.find((m) => m.userId === currentUserId)?.role === 'owner';

  const handleInvite = async () => {
    if (!email.trim()) return;

    setIsInviting(true);
    try {
      await onInvite?.(email.trim(), role);
      setEmail('');
    } catch (error) {
      console.error('Failed to invite:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateLink = async () => {
    try {
      const link = await onCreateShareLink?.(linkRole);
      if (link) {
        setShareLink(link);
      }
    } catch (error) {
      console.error('Failed to create link:', error);
    }
  };

  const handleCopyLink = () => {
    const link = shareLink || `${window.location.origin}/diagrams/${boardId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      onCopyLink?.(link);
    });
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
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
  };

  const closeButtonStyle = {
    padding: 4,
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    fontSize: 20,
    color: '#6b7280',
    cursor: 'pointer',
  };

  const contentStyle = {
    padding: 20,
  };

  const sectionStyle = {
    marginBottom: 24,
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 8,
  };

  const inputRowStyle = {
    display: 'flex',
    gap: 8,
  };

  const inputStyle = {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  };

  const buttonStyle = (primary, disabled) => ({
    padding: '10px 16px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: primary ? '#3b82f6' : '#f3f4f6',
    color: primary ? '#ffffff' : '#374151',
    opacity: disabled ? 0.6 : 1,
  });

  const linkSectionStyle = {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginTop: 16,
  };

  const linkInputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 13,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={titleStyle}>Share "{boardName}"</span>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>

        <div style={contentStyle}>
          {/* Invite by email */}
          {canManage && (
            <div style={sectionStyle}>
              <div style={labelStyle}>Invite people</div>
              <div style={inputRowStyle}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
                <RoleSelector value={role} onChange={setRole} />
                <button
                  style={buttonStyle(true, isInviting || !email.trim())}
                  onClick={handleInvite}
                  disabled={isInviting || !email.trim()}
                >
                  {isInviting ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            </div>
          )}

          {/* Members list */}
          <div style={sectionStyle}>
            <div style={labelStyle}>People with access ({members.length})</div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isOwner={member.role === 'owner'}
                  canManage={canManage && member.userId !== currentUserId}
                  onRoleChange={onUpdateRole}
                  onRemove={onRemoveMember}
                />
              ))}
            </div>
          </div>

          {/* Share link */}
          <div style={linkSectionStyle}>
            <div style={labelStyle}>Share link</div>
            <div style={inputRowStyle}>
              <input
                type="text"
                readOnly
                value={shareLink || `${window.location.origin}/diagrams/${boardId}`}
                style={linkInputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <RoleSelector value={linkRole} onChange={setLinkRole} />
              <button style={buttonStyle(false)} onClick={handleCreateLink}>
                Create Link
              </button>
              <button style={buttonStyle(true, false)} onClick={handleCopyLink}>
                {copySuccess ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage share dialog state
 */
export function useShareDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  };
}

export default ShareDialog;
