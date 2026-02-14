// pages/api/domains/[id]/access.js
// Manage access to a domain (members and permissions)

import { enrichUserContext } from '../../../../lib/auth/rbac/middleware.js';
import { hasPermission, canAssignRole, canAccessDomain } from '../../../../lib/auth/rbac/checker.js';
import { ROLES, isValidRole, getRoleMetadata, isRoleAtLeast } from '../../../../lib/auth/rbac/roles.js';
import { PERMISSIONS } from '../../../../lib/auth/rbac/permissions.js';
import { roleRepository } from '../../../../lib/repositories/RoleRepository.js';
import { domainRepository, userRepository } from '../../../../lib/repositories/index.js';
import { query } from '../../../../lib/pg.js';

export default async function handler(req, res) {
  const { id: domainId } = req.query;

  // Enrich current user context
  const currentUser = await enrichUserContext(req);

  if (!currentUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Get domain info
  let domain;
  try {
    domain = await domainRepository.findById(domainId);
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
  } catch (err) {
    console.error('Error fetching domain:', err);
    return res.status(500).json({ error: 'Failed to fetch domain' });
  }

  // Check if user can access this domain at all
  if (!canAccessDomain(currentUser, domainId)) {
    return res.status(403).json({ error: 'Access to domain denied' });
  }

  if (req.method === 'GET') {
    // List who has access to the domain
    if (!hasPermission(currentUser, PERMISSIONS.DOMAIN_VIEW, { domainId })) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    try {
      // Get domain roles from user_roles table
      const domainRoles = await roleRepository.getDomainRoles(domainId);

      // Also get from domain_members for legacy data
      const membersResult = await query(
        `SELECT dm.*, u.username
         FROM domain_members dm
         JOIN users u ON dm.user_id = u.id
         WHERE dm.domain_id = $1
         ORDER BY dm.role, u.username`,
        [domainId]
      );

      // Merge and deduplicate
      const accessMap = new Map();

      // Add from user_roles
      for (const role of domainRoles) {
        accessMap.set(role.user_id, {
          userId: role.user_id,
          username: role.username,
          role: role.role,
          roleMetadata: getRoleMetadata(role.role),
          assignedAt: role.assigned_at,
          source: 'rbac',
        });
      }

      // Add from domain_members (if not already present)
      for (const member of membersResult.rows) {
        if (!accessMap.has(member.user_id)) {
          // Map legacy role to new role
          const mappedRole = roleRepository.mapLegacyRole(member.role, 'domain');
          accessMap.set(member.user_id, {
            userId: member.user_id,
            username: member.username,
            role: mappedRole,
            legacyRole: member.role,
            roleMetadata: getRoleMetadata(mappedRole),
            source: 'legacy',
          });
        }
      }

      // Mark domain owner
      const ownerUserId = domain.owner;
      if (accessMap.has(ownerUserId)) {
        accessMap.get(ownerUserId).isOwner = true;
      } else {
        const owner = await userRepository.findById(ownerUserId);
        if (owner) {
          accessMap.set(ownerUserId, {
            userId: ownerUserId,
            username: owner.username,
            role: ROLES.DOMAIN_ADMIN,
            roleMetadata: getRoleMetadata(ROLES.DOMAIN_ADMIN),
            isOwner: true,
            source: 'owner',
          });
        }
      }

      const accessList = Array.from(accessMap.values());

      return res.status(200).json({
        domainId,
        domainName: domain.name,
        owner: domain.owner,
        members: accessList,
        availableRoles: [
          { id: ROLES.DOMAIN_ADMIN, ...getRoleMetadata(ROLES.DOMAIN_ADMIN) },
          { id: ROLES.PROJECT_ADMIN, ...getRoleMetadata(ROLES.PROJECT_ADMIN) },
          { id: ROLES.EDITOR, ...getRoleMetadata(ROLES.EDITOR) },
          { id: ROLES.VIEWER, ...getRoleMetadata(ROLES.VIEWER) },
        ],
      });
    } catch (err) {
      console.error('Error getting domain access:', err);
      return res.status(500).json({ error: 'Failed to get domain access' });
    }
  }

  if (req.method === 'POST') {
    // Grant access to the domain
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    // Check if current user can manage domain
    if (!hasPermission(currentUser, PERMISSIONS.DOMAIN_MANAGE, { domainId })) {
      return res.status(403).json({ error: 'You do not have permission to manage domain access' });
    }

    // Check if user exists
    const { exists } = await userRepository.userExists(userId);
    if (!exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user can assign this role
    const { allowed, reason } = canAssignRole(currentUser, role, { domainId });
    if (!allowed) {
      return res.status(403).json({ error: reason });
    }

    try {
      await roleRepository.assignDomainRole(userId, domainId, role, currentUser.id);

      return res.status(201).json({
        message: 'Access granted successfully',
        userId,
        role,
      });
    } catch (err) {
      console.error('Error granting access:', err);
      return res.status(500).json({ error: 'Failed to grant access' });
    }
  }

  if (req.method === 'PUT') {
    // Update access (change role)
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    // Check if current user can manage domain
    if (!hasPermission(currentUser, PERMISSIONS.DOMAIN_MANAGE, { domainId })) {
      return res.status(403).json({ error: 'You do not have permission to manage domain access' });
    }

    // Cannot change owner's role
    if (userId === domain.owner) {
      return res.status(400).json({ error: 'Cannot change domain owner role' });
    }

    const { allowed, reason } = canAssignRole(currentUser, role, { domainId });
    if (!allowed) {
      return res.status(403).json({ error: reason });
    }

    try {
      await roleRepository.assignDomainRole(userId, domainId, role, currentUser.id);

      return res.status(200).json({
        message: 'Access updated successfully',
        userId,
        role,
      });
    } catch (err) {
      console.error('Error updating access:', err);
      return res.status(500).json({ error: 'Failed to update access' });
    }
  }

  if (req.method === 'DELETE') {
    // Revoke access
    const { userId } = req.body || req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Cannot remove the domain owner
    if (userId === domain.owner) {
      return res.status(400).json({ error: 'Cannot remove domain owner' });
    }

    // Check if current user can manage domain
    if (!hasPermission(currentUser, PERMISSIONS.DOMAIN_MANAGE, { domainId })) {
      return res.status(403).json({ error: 'You do not have permission to manage domain access' });
    }

    try {
      await roleRepository.removeRole(userId, 'domain', domainId);

      return res.status(200).json({
        message: 'Access revoked successfully',
        userId,
      });
    } catch (err) {
      console.error('Error revoking access:', err);
      return res.status(500).json({ error: 'Failed to revoke access' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
