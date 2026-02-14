// pages/api/user/permissions.js
// Get current user's permissions and accessible spaces

import { enrichUserContext } from '../../../lib/auth/rbac/middleware.js';
import {
  getUserPermissions,
  getEffectiveRole,
  getRoleSummary,
} from '../../../lib/auth/rbac/checker.js';
import {
  getAccessibleSpaces,
  getSpacesByCategory,
} from '../../../lib/auth/rbac/spaceAccess.js';
import { getRoleMetadata } from '../../../lib/auth/rbac/roles.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enrich user context
  const user = await enrichUserContext(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Get context from query params
  const context = {
    domainId: req.query.domainId,
    projectId: req.query.projectId,
  };

  try {
    // Get effective role in context
    const effectiveRole = getEffectiveRole(user, context);

    // Get permissions in context
    const permissions = getUserPermissions(user, context);

    // Get role summary
    const roleSummary = getRoleSummary(user);

    // Get accessible spaces
    const accessibleSpaces = getAccessibleSpaces(user, context);

    // Get spaces by category
    const spacesByCategory = getSpacesByCategory(user, context);

    return res.status(200).json({
      userId: user.id,
      username: user.username,

      // Current context
      context: {
        domainId: context.domainId || null,
        projectId: context.projectId || null,
      },

      // Effective role in this context
      effectiveRole,
      effectiveRoleMetadata: effectiveRole ? getRoleMetadata(effectiveRole) : null,

      // All permissions in this context
      permissions,

      // Role summary (all roles across scopes)
      roleSummary,

      // Accessible spaces
      spaces: {
        list: accessibleSpaces,
        byCategory: spacesByCategory,
        count: accessibleSpaces.length,
      },

      // Quick permission checks (for common UI decisions)
      can: {
        createArtefacts: permissions.includes('artefact:create'),
        editArtefacts: permissions.includes('artefact:edit'),
        deleteArtefacts: permissions.includes('artefact:delete'),
        approveArtefacts: permissions.includes('artefact:approve'),
        manageProject: permissions.includes('project:manage'),
        manageDomain: permissions.includes('domain:manage'),
        inviteUsers: permissions.includes('user:invite'),
        exportData: permissions.includes('export:all'),
      },
    });
  } catch (err) {
    console.error('Error getting user permissions:', err);
    return res.status(500).json({ error: 'Failed to get permissions' });
  }
}
