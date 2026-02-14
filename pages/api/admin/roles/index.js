// pages/api/admin/roles/index.js
// List all role definitions and role assignments

import { withSuperAdmin, getUserFromRequest, enrichUserContext } from '../../../../lib/auth/rbac/middleware.js';
import { getAllRoles, ROLES } from '../../../../lib/auth/rbac/roles.js';
import { getPermissionsByCategory, ROLE_PERMISSIONS } from '../../../../lib/auth/rbac/permissions.js';
import { roleRepository } from '../../../../lib/repositories/RoleRepository.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all role definitions with their permissions
    const roles = getAllRoles();

    // Enrich with permissions for each role
    const enrichedRoles = roles.map((role) => ({
      ...role,
      permissions: ROLE_PERMISSIONS[role.id] || [],
    }));

    // Get permission categories for reference
    const permissionCategories = getPermissionsByCategory();

    return res.status(200).json({
      roles: enrichedRoles,
      permissionCategories,
      hierarchy: Object.values(ROLES),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Require super admin for role management
export default withSuperAdmin()(handler);
