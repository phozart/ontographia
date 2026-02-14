// lib/auth/rbac/permissions.js
// Permission definitions for Ontographia V2 RBAC system

import { ROLES } from './roles.js';

/**
 * All available permissions in the system
 * Organized by resource type
 */
export const PERMISSIONS = Object.freeze({
  // System-level permissions
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_USERS: 'system:users',

  // Domain-level permissions
  DOMAIN_CREATE: 'domain:create',
  DOMAIN_MANAGE: 'domain:manage',
  DOMAIN_DELETE: 'domain:delete',
  DOMAIN_VIEW: 'domain:view',

  // Project-level permissions
  PROJECT_CREATE: 'project:create',
  PROJECT_MANAGE: 'project:manage',
  PROJECT_DELETE: 'project:delete',
  PROJECT_VIEW: 'project:view',

  // Artefact permissions
  ARTEFACT_CREATE: 'artefact:create',
  ARTEFACT_EDIT: 'artefact:edit',
  ARTEFACT_DELETE: 'artefact:delete',
  ARTEFACT_VIEW: 'artefact:view',
  ARTEFACT_APPROVE: 'artefact:approve',

  // Relationship permissions
  RELATIONSHIP_CREATE: 'relationship:create',
  RELATIONSHIP_EDIT: 'relationship:edit',
  RELATIONSHIP_DELETE: 'relationship:delete',
  RELATIONSHIP_VIEW: 'relationship:view',

  // User management permissions
  USER_INVITE: 'user:invite',
  USER_REMOVE: 'user:remove',
  USER_ROLE_ASSIGN: 'user:role_assign',

  // Space-specific permissions
  SPACE_ACCESS: 'space:access',
  SPACE_EDIT: 'space:edit',
  SPACE_ADMIN: 'space:admin',

  // Export/Import permissions
  EXPORT_ALL: 'export:all',
  IMPORT_ALL: 'import:all',

  // Comment permissions
  COMMENT_CREATE: 'comment:create',
  COMMENT_EDIT: 'comment:edit',
  COMMENT_DELETE: 'comment:delete',

  // Document permissions
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_EDIT: 'document:edit',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_PUBLISH: 'document:publish',
});

/**
 * Permission metadata for display and categorization
 */
export const PERMISSION_METADATA = Object.freeze({
  [PERMISSIONS.SYSTEM_SETTINGS]: {
    name: 'System Settings',
    description: 'Access and modify system-wide settings',
    category: 'system',
  },
  [PERMISSIONS.SYSTEM_AUDIT]: {
    name: 'View Audit Logs',
    description: 'View system audit logs and activity history',
    category: 'system',
  },
  [PERMISSIONS.SYSTEM_USERS]: {
    name: 'Manage All Users',
    description: 'Create, edit, and delete any user account',
    category: 'system',
  },
  [PERMISSIONS.DOMAIN_CREATE]: {
    name: 'Create Domains',
    description: 'Create new domains/workspaces',
    category: 'domain',
  },
  [PERMISSIONS.DOMAIN_MANAGE]: {
    name: 'Manage Domain',
    description: 'Configure domain settings and members',
    category: 'domain',
  },
  [PERMISSIONS.DOMAIN_DELETE]: {
    name: 'Delete Domain',
    description: 'Delete domains and all contained data',
    category: 'domain',
  },
  [PERMISSIONS.DOMAIN_VIEW]: {
    name: 'View Domain',
    description: 'View domain information',
    category: 'domain',
  },
  [PERMISSIONS.PROJECT_CREATE]: {
    name: 'Create Projects',
    description: 'Create new projects within domains',
    category: 'project',
  },
  [PERMISSIONS.PROJECT_MANAGE]: {
    name: 'Manage Project',
    description: 'Configure project settings',
    category: 'project',
  },
  [PERMISSIONS.PROJECT_DELETE]: {
    name: 'Delete Project',
    description: 'Delete projects and all contained data',
    category: 'project',
  },
  [PERMISSIONS.PROJECT_VIEW]: {
    name: 'View Project',
    description: 'View project information',
    category: 'project',
  },
  [PERMISSIONS.ARTEFACT_CREATE]: {
    name: 'Create Artefacts',
    description: 'Create new artefacts',
    category: 'artefact',
  },
  [PERMISSIONS.ARTEFACT_EDIT]: {
    name: 'Edit Artefacts',
    description: 'Modify existing artefacts',
    category: 'artefact',
  },
  [PERMISSIONS.ARTEFACT_DELETE]: {
    name: 'Delete Artefacts',
    description: 'Remove artefacts',
    category: 'artefact',
  },
  [PERMISSIONS.ARTEFACT_VIEW]: {
    name: 'View Artefacts',
    description: 'View artefact content',
    category: 'artefact',
  },
  [PERMISSIONS.ARTEFACT_APPROVE]: {
    name: 'Approve Artefacts',
    description: 'Change artefact status to Approved',
    category: 'artefact',
  },
  [PERMISSIONS.RELATIONSHIP_CREATE]: {
    name: 'Create Relationships',
    description: 'Create links between artefacts',
    category: 'relationship',
  },
  [PERMISSIONS.RELATIONSHIP_EDIT]: {
    name: 'Edit Relationships',
    description: 'Modify relationship properties',
    category: 'relationship',
  },
  [PERMISSIONS.RELATIONSHIP_DELETE]: {
    name: 'Delete Relationships',
    description: 'Remove relationships',
    category: 'relationship',
  },
  [PERMISSIONS.RELATIONSHIP_VIEW]: {
    name: 'View Relationships',
    description: 'View relationship data',
    category: 'relationship',
  },
  [PERMISSIONS.USER_INVITE]: {
    name: 'Invite Users',
    description: 'Invite users to projects or domains',
    category: 'user',
  },
  [PERMISSIONS.USER_REMOVE]: {
    name: 'Remove Users',
    description: 'Remove users from projects or domains',
    category: 'user',
  },
  [PERMISSIONS.USER_ROLE_ASSIGN]: {
    name: 'Assign Roles',
    description: 'Assign roles to users',
    category: 'user',
  },
  [PERMISSIONS.SPACE_ACCESS]: {
    name: 'Access Space',
    description: 'Access a specific space/studio',
    category: 'space',
  },
  [PERMISSIONS.SPACE_EDIT]: {
    name: 'Edit in Space',
    description: 'Create and edit content in a space',
    category: 'space',
  },
  [PERMISSIONS.SPACE_ADMIN]: {
    name: 'Administer Space',
    description: 'Configure space settings',
    category: 'space',
  },
  [PERMISSIONS.EXPORT_ALL]: {
    name: 'Export Data',
    description: 'Export data to various formats',
    category: 'data',
  },
  [PERMISSIONS.IMPORT_ALL]: {
    name: 'Import Data',
    description: 'Import data from external sources',
    category: 'data',
  },
  [PERMISSIONS.COMMENT_CREATE]: {
    name: 'Create Comments',
    description: 'Add comments to artefacts',
    category: 'comment',
  },
  [PERMISSIONS.COMMENT_EDIT]: {
    name: 'Edit Comments',
    description: 'Edit own comments',
    category: 'comment',
  },
  [PERMISSIONS.COMMENT_DELETE]: {
    name: 'Delete Comments',
    description: 'Delete comments',
    category: 'comment',
  },
  [PERMISSIONS.DOCUMENT_CREATE]: {
    name: 'Create Documents',
    description: 'Create new documents',
    category: 'document',
  },
  [PERMISSIONS.DOCUMENT_EDIT]: {
    name: 'Edit Documents',
    description: 'Modify documents',
    category: 'document',
  },
  [PERMISSIONS.DOCUMENT_DELETE]: {
    name: 'Delete Documents',
    description: 'Remove documents',
    category: 'document',
  },
  [PERMISSIONS.DOCUMENT_PUBLISH]: {
    name: 'Publish Documents',
    description: 'Publish documents',
    category: 'document',
  },
});

/**
 * Role-to-permission mapping
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.DOMAIN_ADMIN]: [
    // Domain permissions
    PERMISSIONS.DOMAIN_MANAGE,
    PERMISSIONS.DOMAIN_VIEW,
    // Project permissions
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_MANAGE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_VIEW,
    // Artefact permissions
    PERMISSIONS.ARTEFACT_CREATE,
    PERMISSIONS.ARTEFACT_EDIT,
    PERMISSIONS.ARTEFACT_DELETE,
    PERMISSIONS.ARTEFACT_VIEW,
    PERMISSIONS.ARTEFACT_APPROVE,
    // Relationship permissions
    PERMISSIONS.RELATIONSHIP_CREATE,
    PERMISSIONS.RELATIONSHIP_EDIT,
    PERMISSIONS.RELATIONSHIP_DELETE,
    PERMISSIONS.RELATIONSHIP_VIEW,
    // User permissions
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.USER_REMOVE,
    PERMISSIONS.USER_ROLE_ASSIGN,
    // Space permissions
    PERMISSIONS.SPACE_ACCESS,
    PERMISSIONS.SPACE_EDIT,
    PERMISSIONS.SPACE_ADMIN,
    // Data permissions
    PERMISSIONS.EXPORT_ALL,
    PERMISSIONS.IMPORT_ALL,
    // Comment permissions
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_EDIT,
    PERMISSIONS.COMMENT_DELETE,
    // Document permissions
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_EDIT,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.DOCUMENT_PUBLISH,
  ],

  [ROLES.PROJECT_ADMIN]: [
    // Domain permissions (view only)
    PERMISSIONS.DOMAIN_VIEW,
    // Project permissions
    PERMISSIONS.PROJECT_MANAGE,
    PERMISSIONS.PROJECT_VIEW,
    // Artefact permissions
    PERMISSIONS.ARTEFACT_CREATE,
    PERMISSIONS.ARTEFACT_EDIT,
    PERMISSIONS.ARTEFACT_DELETE,
    PERMISSIONS.ARTEFACT_VIEW,
    PERMISSIONS.ARTEFACT_APPROVE,
    // Relationship permissions
    PERMISSIONS.RELATIONSHIP_CREATE,
    PERMISSIONS.RELATIONSHIP_EDIT,
    PERMISSIONS.RELATIONSHIP_DELETE,
    PERMISSIONS.RELATIONSHIP_VIEW,
    // User permissions
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.USER_REMOVE,
    // Space permissions
    PERMISSIONS.SPACE_ACCESS,
    PERMISSIONS.SPACE_EDIT,
    // Data permissions
    PERMISSIONS.EXPORT_ALL,
    PERMISSIONS.IMPORT_ALL,
    // Comment permissions
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_EDIT,
    PERMISSIONS.COMMENT_DELETE,
    // Document permissions
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_EDIT,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.DOCUMENT_PUBLISH,
  ],

  [ROLES.EDITOR]: [
    // Domain permissions (view only)
    PERMISSIONS.DOMAIN_VIEW,
    // Project permissions (view only)
    PERMISSIONS.PROJECT_VIEW,
    // Artefact permissions (no delete)
    PERMISSIONS.ARTEFACT_CREATE,
    PERMISSIONS.ARTEFACT_EDIT,
    PERMISSIONS.ARTEFACT_VIEW,
    // Relationship permissions (create/edit only)
    PERMISSIONS.RELATIONSHIP_CREATE,
    PERMISSIONS.RELATIONSHIP_EDIT,
    PERMISSIONS.RELATIONSHIP_VIEW,
    // Space permissions (access and edit)
    PERMISSIONS.SPACE_ACCESS,
    PERMISSIONS.SPACE_EDIT,
    // Data permissions
    PERMISSIONS.EXPORT_ALL,
    // Comment permissions (create and edit own)
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_EDIT,
    // Document permissions (no delete/publish)
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_EDIT,
  ],

  [ROLES.VIEWER]: [
    // Domain permissions (view only)
    PERMISSIONS.DOMAIN_VIEW,
    // Project permissions (view only)
    PERMISSIONS.PROJECT_VIEW,
    // Artefact permissions (view only)
    PERMISSIONS.ARTEFACT_VIEW,
    // Relationship permissions (view only)
    PERMISSIONS.RELATIONSHIP_VIEW,
    // Space permissions (access only)
    PERMISSIONS.SPACE_ACCESS,
    // Data permissions
    PERMISSIONS.EXPORT_ALL,
  ],
});

/**
 * Get permissions for a role
 * @param {string} role - Role identifier
 * @returns {string[]} Array of permission strings
 */
export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 * @param {string} role - Role identifier
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function roleHasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Get all permissions grouped by category
 * @returns {Object} Permissions grouped by category
 */
export function getPermissionsByCategory() {
  const grouped = {};

  for (const [permission, metadata] of Object.entries(PERMISSION_METADATA)) {
    const category = metadata.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({
      id: permission,
      ...metadata,
    });
  }

  return grouped;
}

/**
 * Get permission metadata
 * @param {string} permission - Permission identifier
 * @returns {Object|null}
 */
export function getPermissionMetadata(permission) {
  return PERMISSION_METADATA[permission] || null;
}

/**
 * Check if a permission is valid
 * @param {string} permission - Permission to validate
 * @returns {boolean}
 */
export function isValidPermission(permission) {
  return Object.values(PERMISSIONS).includes(permission);
}

/**
 * Get the permission required for a resource action
 * @param {string} resource - Resource type (artefact, project, etc.)
 * @param {string} action - Action (create, edit, delete, view)
 * @returns {string|null} Permission string or null if not found
 */
export function getRequiredPermission(resource, action) {
  const key = `${resource.toUpperCase()}_${action.toUpperCase()}`;
  return PERMISSIONS[key] || null;
}

export default PERMISSIONS;
