// pages/api/admin/roles/[roleId].js
// Get role details and users with this role

import { withSuperAdmin } from '../../../../lib/auth/rbac/middleware.js';
import { getRoleMetadata, isValidRole } from '../../../../lib/auth/rbac/roles.js';
import { ROLE_PERMISSIONS } from '../../../../lib/auth/rbac/permissions.js';
import { roleRepository } from '../../../../lib/repositories/RoleRepository.js';

async function handler(req, res) {
  const { roleId } = req.query;

  if (!isValidRole(roleId)) {
    return res.status(404).json({ error: 'Role not found' });
  }

  if (req.method === 'GET') {
    // Get role details
    const metadata = getRoleMetadata(roleId);
    const permissions = ROLE_PERMISSIONS[roleId] || [];

    // Get users with this role
    let users = [];
    try {
      users = await roleRepository.getUsersByRole(roleId);
    } catch (err) {
      console.error('Error getting users by role:', err);
    }

    return res.status(200).json({
      id: roleId,
      ...metadata,
      permissions,
      users: users.map((u) => ({
        id: u.user_id,
        username: u.username,
        scope: u.scope,
        domainId: u.domain_id,
        projectId: u.project_id,
        assignedAt: u.assigned_at,
      })),
      userCount: users.length,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Require super admin for role management
export default withSuperAdmin()(handler);
