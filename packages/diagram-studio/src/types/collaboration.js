/**
 * Diagram Studio - Collaboration Type Definitions
 * Using JSDoc for type safety in JavaScript
 */

/**
 * @typedef {Object} Workspace
 * @property {string} id - UUID
 * @property {string} name - Workspace name
 * @property {string} [description] - Optional description
 * @property {string} ownerId - User ID of workspace owner
 * @property {WorkspaceSettings} settings - Workspace configuration
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} WorkspaceSettings
 * @property {boolean} allowGuestAccess - Allow viewers without account
 * @property {boolean} requireApproval - Require owner approval for new members
 * @property {string} defaultBoardRole - Default role for new boards
 */

/**
 * @typedef {'owner'|'admin'|'member'|'guest'} WorkspaceRole
 */

/**
 * @typedef {'owner'|'editor'|'commenter'|'viewer'} BoardRole
 */

/**
 * @typedef {Object} WorkspaceMember
 * @property {string} id - Membership ID
 * @property {string} workspaceId - Workspace ID
 * @property {string} userId - User ID
 * @property {WorkspaceRole} role - Member role
 * @property {string} invitedBy - User ID who invited
 * @property {string} invitedAt - ISO timestamp
 * @property {string} [acceptedAt] - ISO timestamp when accepted
 */

/**
 * @typedef {Object} BoardMember
 * @property {string} id - Membership ID
 * @property {string} boardId - Board ID
 * @property {string} userId - User ID
 * @property {BoardRole} role - Member role
 * @property {string} invitedBy - User ID who invited
 * @property {string} invitedAt - ISO timestamp
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - Display name
 * @property {string} email - Email address
 * @property {string} [avatar] - Avatar URL
 * @property {string} [color] - User's cursor/presence color
 */

/**
 * @typedef {Object} Presence
 * @property {string} odId - User ID
 * @property {string} odName - User name
 * @property {string} color - Cursor color
 * @property {{x: number, y: number}} [cursor] - Cursor position
 * @property {string[]} selectedIds - Selected element IDs
 * @property {Viewport} viewport - User's viewport
 * @property {boolean} isActive - Whether user is actively engaged
 * @property {number} lastActiveAt - Timestamp of last activity
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - Comment ID
 * @property {string} boardId - Board ID
 * @property {string} [parentId] - Parent comment ID for replies
 * @property {string} userId - Author user ID
 * @property {User} user - Author user object
 * @property {string} content - Comment text
 * @property {'element'|'position'} anchorType - Anchor type
 * @property {string} [anchorElementId] - Anchored element ID
 * @property {{x: number, y: number}} [anchorPosition] - Anchored position
 * @property {boolean} resolved - Whether comment is resolved
 * @property {string} [resolvedBy] - User ID who resolved
 * @property {string} [resolvedAt] - ISO timestamp
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 * @property {Comment[]} [replies] - Nested replies
 */

/**
 * @typedef {Object} ShareLink
 * @property {string} id - Link ID
 * @property {string} boardId - Board ID
 * @property {string} token - Unique share token
 * @property {BoardRole} role - Access role granted
 * @property {string} [expiresAt] - Expiration timestamp
 * @property {number} [maxUses] - Maximum number of uses
 * @property {number} useCount - Current use count
 * @property {string} createdBy - User ID who created
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {Object} CollaborationState
 * @property {boolean} isConnected - WebSocket connection status
 * @property {boolean} isSyncing - Whether currently syncing changes
 * @property {Presence[]} presence - Active collaborators
 * @property {number} pendingChanges - Count of unsaved changes
 * @property {string} [lastSyncedAt] - Last successful sync timestamp
 * @property {string} [error] - Current error message
 */

/**
 * Role permission definitions
 */
export const WORKSPACE_PERMISSIONS = {
  owner: {
    canManageWorkspace: true,
    canManageMembers: true,
    canCreateBoards: true,
    canDeleteBoards: true,
    canViewAllBoards: true,
  },
  admin: {
    canManageWorkspace: false,
    canManageMembers: true,
    canCreateBoards: true,
    canDeleteBoards: true,
    canViewAllBoards: true,
  },
  member: {
    canManageWorkspace: false,
    canManageMembers: false,
    canCreateBoards: true,
    canDeleteBoards: false,
    canViewAllBoards: false,
  },
  guest: {
    canManageWorkspace: false,
    canManageMembers: false,
    canCreateBoards: false,
    canDeleteBoards: false,
    canViewAllBoards: false,
  },
};

export const BOARD_PERMISSIONS = {
  owner: {
    canEdit: true,
    canComment: true,
    canShare: true,
    canDelete: true,
    canManageMembers: true,
  },
  editor: {
    canEdit: true,
    canComment: true,
    canShare: false,
    canDelete: false,
    canManageMembers: false,
  },
  commenter: {
    canEdit: false,
    canComment: true,
    canShare: false,
    canDelete: false,
    canManageMembers: false,
  },
  viewer: {
    canEdit: false,
    canComment: false,
    canShare: false,
    canDelete: false,
    canManageMembers: false,
  },
};

/**
 * Check if a workspace role has a specific permission
 * @param {WorkspaceRole} role - The role to check
 * @param {string} permission - The permission key
 * @returns {boolean}
 */
export function hasWorkspacePermission(role, permission) {
  return WORKSPACE_PERMISSIONS[role]?.[permission] ?? false;
}

/**
 * Check if a board role has a specific permission
 * @param {BoardRole} role - The role to check
 * @param {string} permission - The permission key
 * @returns {boolean}
 */
export function hasBoardPermission(role, permission) {
  return BOARD_PERMISSIONS[role]?.[permission] ?? false;
}

/**
 * Generate a unique color for a user's cursor
 * @param {string} userId - User ID for consistent color
 * @returns {string} - Hex color code
 */
export function generateUserColor(userId) {
  // Predefined palette of distinguishable colors
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
    '#BB8FCE', // Purple
    '#85C1E9', // Sky Blue
  ];

  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Create a new presence object for a user
 * @param {User} user - User object
 * @returns {Presence}
 */
export function createPresence(user) {
  return {
    odId: user.id,
    odName: user.name,
    color: user.color || generateUserColor(user.id),
    cursor: null,
    selectedIds: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    isActive: true,
    lastActiveAt: Date.now(),
  };
}

/**
 * Create a new comment
 * @param {string} boardId - Board ID
 * @param {User} user - Comment author
 * @param {string} content - Comment text
 * @param {Object} anchor - Anchor configuration
 * @returns {Comment}
 */
export function createComment(boardId, user, content, anchor = {}) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    boardId,
    parentId: anchor.parentId || null,
    userId: user.id,
    user: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    },
    content,
    anchorType: anchor.elementId ? 'element' : 'position',
    anchorElementId: anchor.elementId || null,
    anchorPosition: anchor.position || null,
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
