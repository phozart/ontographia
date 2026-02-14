// pages/api/admin/users/[userId]/roles.js
// Manage roles for a specific user

import { enrichUserContext, getUserFromRequest } from '../../../../../lib/auth/rbac/middleware.js';
import { hasRole, canAssignRole } from '../../../../../lib/auth/rbac/checker.js';
import { ROLES, isValidRole } from '../../../../../lib/auth/rbac/roles.js';
import { roleRepository } from '../../../../../lib/repositories/RoleRepository.js';
import { userRepository } from '../../../../../lib/repositories/UserRepository.js';

export default async function handler(req, res) {
  const { userId } = req.query;

  // Enrich current user context
  const currentUser = await enrichUserContext(req);

  if (!currentUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check user exists
  const { exists } = await userRepository.userExists(userId);
  if (!exists) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'GET') {
    // Get user's roles
    // Requires at least project admin level
    if (!hasRole(currentUser, ROLES.PROJECT_ADMIN)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    try {
      const roles = await roleRepository.getUserRoles(userId);
      return res.status(200).json({
        userId,
        ...roles,
      });
    } catch (err) {
      console.error('Error getting user roles:', err);
      return res.status(500).json({ error: 'Failed to get user roles' });
    }
  }

  if (req.method === 'POST') {
    // Assign a new role
    const { scope, role, contextId } = req.body;

    if (!scope || !role) {
      return res.status(400).json({ error: 'Scope and role are required' });
    }

    if (!isValidRole(role)) {
      return res.status(400).json({ error: `Invalid role: ${role}` });
    }

    if (['domain', 'project'].includes(scope) && !contextId) {
      return res.status(400).json({ error: 'Context ID required for domain/project scope' });
    }

    // Build context for permission check
    const context = {
      domainId: scope === 'domain' ? contextId : req.body.domainId,
      projectId: scope === 'project' ? contextId : null,
    };

    // Check if current user can assign this role
    const { allowed, reason } = canAssignRole(currentUser, role, context);
    if (!allowed) {
      return res.status(403).json({ error: reason });
    }

    try {
      let result;

      if (scope === 'system') {
        result = await roleRepository.assignSystemRole(userId, role, currentUser.id);
      } else if (scope === 'domain') {
        result = await roleRepository.assignDomainRole(userId, contextId, role, currentUser.id);
      } else if (scope === 'project') {
        result = await roleRepository.assignProjectRole(userId, contextId, role, currentUser.id);
      } else {
        return res.status(400).json({ error: `Invalid scope: ${scope}` });
      }

      return res.status(201).json({
        message: 'Role assigned successfully',
        role: result,
      });
    } catch (err) {
      console.error('Error assigning role:', err);
      return res.status(500).json({ error: 'Failed to assign role' });
    }
  }

  if (req.method === 'DELETE') {
    // Remove a role
    const { scope, contextId } = req.body || req.query;

    if (!scope) {
      return res.status(400).json({ error: 'Scope is required' });
    }

    // Check permissions based on scope
    if (scope === 'system' && !hasRole(currentUser, ROLES.SUPER_ADMIN)) {
      return res.status(403).json({ error: 'Only super admins can remove system roles' });
    }

    if (scope === 'domain' && !hasRole(currentUser, ROLES.DOMAIN_ADMIN, { domainId: contextId })) {
      return res.status(403).json({ error: 'Insufficient permissions for domain role removal' });
    }

    if (scope === 'project' && !hasRole(currentUser, ROLES.PROJECT_ADMIN, { projectId: contextId })) {
      return res.status(403).json({ error: 'Insufficient permissions for project role removal' });
    }

    try {
      const removed = await roleRepository.removeRole(userId, scope, contextId);

      if (!removed) {
        return res.status(404).json({ error: 'Role assignment not found' });
      }

      return res.status(200).json({
        message: 'Role removed successfully',
      });
    } catch (err) {
      console.error('Error removing role:', err);
      return res.status(500).json({ error: 'Failed to remove role' });
    }
  }

  if (req.method === 'PUT') {
    // Bulk update roles
    const { roles } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({ error: 'Roles must be an array' });
    }

    // Validate all roles before applying
    for (const { scope, role, contextId } of roles) {
      if (!isValidRole(role)) {
        return res.status(400).json({ error: `Invalid role: ${role}` });
      }

      const context = {
        domainId: scope === 'domain' ? contextId : null,
        projectId: scope === 'project' ? contextId : null,
      };

      const { allowed, reason } = canAssignRole(currentUser, role, context);
      if (!allowed) {
        return res.status(403).json({ error: `Cannot assign ${role}: ${reason}` });
      }
    }

    try {
      const results = await roleRepository.bulkAssignRoles(userId, roles, currentUser.id);

      return res.status(200).json({
        message: 'Roles updated successfully',
        roles: results,
      });
    } catch (err) {
      console.error('Error bulk updating roles:', err);
      return res.status(500).json({ error: 'Failed to update roles' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
