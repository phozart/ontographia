/**
 * RoleBasedUI Component
 * Components and hooks for role-based access control in the UI
 */

import React, { createContext, useContext, useMemo, useCallback } from 'react';

/**
 * Role hierarchy and permissions
 */
export const ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  COMMENTER: 'commenter',
  VIEWER: 'viewer',
};

export const ROLE_HIERARCHY = [ROLES.VIEWER, ROLES.COMMENTER, ROLES.EDITOR, ROLES.OWNER];

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // View permissions
  VIEW_BOARD: 'view:board',
  VIEW_COMMENTS: 'view:comments',
  VIEW_HISTORY: 'view:history',

  // Edit permissions
  EDIT_ELEMENTS: 'edit:elements',
  EDIT_CONNECTIONS: 'edit:connections',
  EDIT_FRAMES: 'edit:frames',
  EDIT_STYLES: 'edit:styles',
  DELETE_ELEMENTS: 'delete:elements',

  // Comment permissions
  ADD_COMMENT: 'add:comment',
  EDIT_OWN_COMMENT: 'edit:own_comment',
  DELETE_OWN_COMMENT: 'delete:own_comment',
  RESOLVE_COMMENT: 'resolve:comment',

  // Collaboration permissions
  INVITE_USERS: 'invite:users',
  MANAGE_ROLES: 'manage:roles',
  REMOVE_USERS: 'remove:users',

  // Board permissions
  EDIT_SETTINGS: 'edit:settings',
  EXPORT_BOARD: 'export:board',
  DELETE_BOARD: 'delete:board',
  TRANSFER_OWNERSHIP: 'transfer:ownership',
};

/**
 * Role permission mappings
 */
const ROLE_PERMISSIONS = {
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_BOARD,
    PERMISSIONS.VIEW_COMMENTS,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.EXPORT_BOARD,
  ],
  [ROLES.COMMENTER]: [
    PERMISSIONS.VIEW_BOARD,
    PERMISSIONS.VIEW_COMMENTS,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.ADD_COMMENT,
    PERMISSIONS.EDIT_OWN_COMMENT,
    PERMISSIONS.DELETE_OWN_COMMENT,
    PERMISSIONS.EXPORT_BOARD,
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.VIEW_BOARD,
    PERMISSIONS.VIEW_COMMENTS,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.EDIT_ELEMENTS,
    PERMISSIONS.EDIT_CONNECTIONS,
    PERMISSIONS.EDIT_FRAMES,
    PERMISSIONS.EDIT_STYLES,
    PERMISSIONS.DELETE_ELEMENTS,
    PERMISSIONS.ADD_COMMENT,
    PERMISSIONS.EDIT_OWN_COMMENT,
    PERMISSIONS.DELETE_OWN_COMMENT,
    PERMISSIONS.RESOLVE_COMMENT,
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.EXPORT_BOARD,
    PERMISSIONS.EDIT_SETTINGS,
  ],
  [ROLES.OWNER]: Object.values(PERMISSIONS), // All permissions
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role meets minimum role requirement
 */
export function meetsRoleRequirement(currentRole, requiredRole) {
  const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return currentIndex >= requiredIndex;
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role) {
  const names = {
    [ROLES.OWNER]: 'Owner',
    [ROLES.EDITOR]: 'Editor',
    [ROLES.COMMENTER]: 'Commenter',
    [ROLES.VIEWER]: 'Viewer',
  };
  return names[role] || 'Unknown';
}

/**
 * Get role color
 */
export function getRoleColor(role) {
  const colors = {
    [ROLES.OWNER]: { bg: '#dbeafe', text: '#1e40af' },
    [ROLES.EDITOR]: { bg: '#dcfce7', text: '#166534' },
    [ROLES.COMMENTER]: { bg: '#fef3c7', text: '#92400e' },
    [ROLES.VIEWER]: { bg: '#f3f4f6', text: '#374151' },
  };
  return colors[role] || colors[ROLES.VIEWER];
}

/**
 * Role context
 */
const RoleContext = createContext({
  role: ROLES.VIEWER,
  userId: null,
  permissions: [],
  can: () => false,
  canEdit: false,
  canComment: false,
  canManage: false,
  isOwner: false,
});

/**
 * Role provider component
 */
export function RoleProvider({ role, userId, children }) {
  const permissions = useMemo(() => ROLE_PERMISSIONS[role] || [], [role]);

  const can = useCallback(
    (permission) => permissions.includes(permission),
    [permissions]
  );

  const value = useMemo(
    () => ({
      role,
      userId,
      permissions,
      can,
      canEdit: can(PERMISSIONS.EDIT_ELEMENTS),
      canComment: can(PERMISSIONS.ADD_COMMENT),
      canManage: can(PERMISSIONS.MANAGE_ROLES),
      isOwner: role === ROLES.OWNER,
    }),
    [role, userId, permissions, can]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

/**
 * Hook to access role context
 */
export function useRole() {
  return useContext(RoleContext);
}

/**
 * Component that conditionally renders based on permission
 */
export function IfCan({ permission, children, fallback = null }) {
  const { can } = useRole();
  return can(permission) ? children : fallback;
}

/**
 * Component that conditionally renders for specific roles
 */
export function IfRole({ role, children, fallback = null }) {
  const { role: currentRole } = useRole();
  const hasRole = Array.isArray(role) ? role.includes(currentRole) : role === currentRole;
  return hasRole ? children : fallback;
}

/**
 * Component that requires minimum role
 */
export function RequireRole({ minRole, children, fallback = null }) {
  const { role } = useRole();
  return meetsRoleRequirement(role, minRole) ? children : fallback;
}

/**
 * Role badge component
 */
export function RoleBadge({ role, size = 'medium' }) {
  const colors = getRoleColor(role);
  const displayName = getRoleDisplayName(role);

  const sizes = {
    small: { fontSize: 10, padding: '2px 6px' },
    medium: { fontSize: 11, padding: '3px 8px' },
    large: { fontSize: 12, padding: '4px 10px' },
  };

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: colors.bg,
    color: colors.text,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    ...sizes[size],
  };

  return <span style={style}>{displayName}</span>;
}

/**
 * Read-only indicator banner
 */
export function ReadOnlyBanner() {
  const { canEdit, role } = useRole();

  if (canEdit) return null;

  const bannerStyle = {
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    borderBottom: '1px solid #fcd34d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 13,
    color: '#92400e',
  };

  const iconStyle = {
    fontSize: 14,
  };

  const getMessage = () => {
    if (role === ROLES.VIEWER) {
      return 'You have view-only access to this board.';
    }
    if (role === ROLES.COMMENTER) {
      return 'You can view and comment on this board, but cannot edit.';
    }
    return 'This board is read-only.';
  };

  return (
    <div style={bannerStyle}>
      <span style={iconStyle}>👁️</span>
      <span>{getMessage()}</span>
    </div>
  );
}

/**
 * Disabled overlay for read-only elements
 */
export function ReadOnlyOverlay({ children, showOverlay = true }) {
  const { canEdit } = useRole();

  if (canEdit || !showOverlay) {
    return children;
  }

  const containerStyle = {
    position: 'relative',
  };

  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    cursor: 'not-allowed',
    zIndex: 10,
  };

  const contentStyle = {
    opacity: 0.7,
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle} title="View only - you cannot edit this" />
      <div style={contentStyle}>{children}</div>
    </div>
  );
}

/**
 * Action button that respects permissions
 */
export function PermissionButton({
  permission,
  onClick,
  disabled,
  children,
  tooltip,
  ...props
}) {
  const { can } = useRole();
  const hasPermission = can(permission);
  const isDisabled = disabled || !hasPermission;

  const buttonStyle = {
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    ...props.style,
  };

  return (
    <button
      {...props}
      style={buttonStyle}
      onClick={hasPermission ? onClick : undefined}
      disabled={isDisabled}
      title={!hasPermission ? 'You do not have permission for this action' : tooltip}
    >
      {children}
    </button>
  );
}

/**
 * Toolbar that shows/hides based on permissions
 */
export function EditToolbar({ children }) {
  const { canEdit } = useRole();

  if (!canEdit) {
    return null;
  }

  return children;
}

/**
 * Comment toolbar that shows for commenters and above
 */
export function CommentToolbar({ children }) {
  const { canComment } = useRole();

  if (!canComment) {
    return null;
  }

  return children;
}

/**
 * Management toolbar that shows for editors and above
 */
export function ManageToolbar({ children }) {
  const { canManage } = useRole();

  if (!canManage) {
    return null;
  }

  return children;
}

/**
 * Get action availability based on role
 */
export function useActionAvailability() {
  const { role, can } = useRole();

  return useMemo(
    () => ({
      // Element actions
      canCreateElement: can(PERMISSIONS.EDIT_ELEMENTS),
      canMoveElement: can(PERMISSIONS.EDIT_ELEMENTS),
      canResizeElement: can(PERMISSIONS.EDIT_ELEMENTS),
      canDeleteElement: can(PERMISSIONS.DELETE_ELEMENTS),
      canStyleElement: can(PERMISSIONS.EDIT_STYLES),

      // Connection actions
      canCreateConnection: can(PERMISSIONS.EDIT_CONNECTIONS),
      canDeleteConnection: can(PERMISSIONS.DELETE_ELEMENTS),

      // Frame actions
      canCreateFrame: can(PERMISSIONS.EDIT_FRAMES),
      canEditFrame: can(PERMISSIONS.EDIT_FRAMES),
      canDeleteFrame: can(PERMISSIONS.DELETE_ELEMENTS),

      // Comment actions
      canAddComment: can(PERMISSIONS.ADD_COMMENT),
      canResolveComment: can(PERMISSIONS.RESOLVE_COMMENT),
      canEditOwnComment: can(PERMISSIONS.EDIT_OWN_COMMENT),
      canDeleteOwnComment: can(PERMISSIONS.DELETE_OWN_COMMENT),

      // Board actions
      canExport: can(PERMISSIONS.EXPORT_BOARD),
      canEditSettings: can(PERMISSIONS.EDIT_SETTINGS),
      canInviteUsers: can(PERMISSIONS.INVITE_USERS),
      canManageRoles: can(PERMISSIONS.MANAGE_ROLES),
      canRemoveUsers: can(PERMISSIONS.REMOVE_USERS),
      canDeleteBoard: can(PERMISSIONS.DELETE_BOARD),
      canTransferOwnership: can(PERMISSIONS.TRANSFER_OWNERSHIP),
    }),
    [can]
  );
}

export default {
  ROLES,
  PERMISSIONS,
  ROLE_HIERARCHY,
  hasPermission,
  meetsRoleRequirement,
  getRoleDisplayName,
  getRoleColor,
  RoleProvider,
  useRole,
  useActionAvailability,
  IfCan,
  IfRole,
  RequireRole,
  RoleBadge,
  ReadOnlyBanner,
  ReadOnlyOverlay,
  PermissionButton,
  EditToolbar,
  CommentToolbar,
  ManageToolbar,
};
