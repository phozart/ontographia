// pages/api/projects/[id]/access.js
// Manage access to a project (members and permissions)

import { enrichUserContext } from '../../../../lib/auth/rbac/middleware.js';
import { hasPermission, canAssignRole, canAccessProject } from '../../../../lib/auth/rbac/checker.js';
import { ROLES, isValidRole, getRoleMetadata } from '../../../../lib/auth/rbac/roles.js';
import { PERMISSIONS } from '../../../../lib/auth/rbac/permissions.js';
import { roleRepository } from '../../../../lib/repositories/RoleRepository.js';
import { projectRepository, userRepository } from '../../../../lib/repositories/index.js';
import { query } from '../../../../lib/pg.js';

export default async function handler(req, res) {
  const { id: projectId } = req.query;

  // Enrich current user context
  const currentUser = await enrichUserContext(req);

  if (!currentUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Get project info
  let project;
  try {
    project = await projectRepository.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
  } catch (err) {
    console.error('Error fetching project:', err);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }

  const projectInfo = {
    domainId: project.domain_id,
    createdBy: project.created_by,
  };

  // Check if user can access this project at all
  if (!canAccessProject(currentUser, projectId, projectInfo)) {
    return res.status(403).json({ error: 'Access to project denied' });
  }

  if (req.method === 'GET') {
    // List who has access to the project
    // Requires at least view permission
    if (!hasPermission(currentUser, PERMISSIONS.PROJECT_VIEW, { projectId, domainId: project.domain_id })) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    try {
      // Get project roles from user_roles table
      const projectRoles = await roleRepository.getProjectRoles(projectId);

      // Also get from project_members for legacy data
      const membersResult = await query(
        `SELECT pm.*, u.username
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = $1
         ORDER BY pm.role, u.username`,
        [projectId]
      );

      // Merge and deduplicate
      const accessMap = new Map();

      // Add from user_roles
      for (const role of projectRoles) {
        accessMap.set(role.user_id, {
          userId: role.user_id,
          username: role.username,
          role: role.role,
          roleMetadata: getRoleMetadata(role.role),
          assignedAt: role.assigned_at,
          source: 'rbac',
        });
      }

      // Add from project_members (if not already present)
      for (const member of membersResult.rows) {
        if (!accessMap.has(member.user_id)) {
          // Map legacy role to new role
          const mappedRole = roleRepository.mapLegacyRole(member.role, 'project');
          accessMap.set(member.user_id, {
            userId: member.user_id,
            username: member.username,
            role: mappedRole,
            legacyRole: member.role,
            roleMetadata: getRoleMetadata(mappedRole),
            assignedAt: member.added_at,
            source: 'legacy',
          });
        }
      }

      // Add project creator if not already present
      if (!accessMap.has(project.created_by)) {
        const creator = await userRepository.findById(project.created_by);
        if (creator) {
          accessMap.set(project.created_by, {
            userId: project.created_by,
            username: creator.username,
            role: ROLES.PROJECT_ADMIN,
            roleMetadata: getRoleMetadata(ROLES.PROJECT_ADMIN),
            isCreator: true,
            source: 'creator',
          });
        }
      }

      // Get space access overrides
      const spaceAccessResult = await query(
        `SELECT * FROM space_access WHERE project_id = $1`,
        [projectId]
      );

      const spaceAccessByUser = {};
      for (const row of spaceAccessResult.rows) {
        if (!spaceAccessByUser[row.user_id]) {
          spaceAccessByUser[row.user_id] = {};
        }
        spaceAccessByUser[row.user_id][row.space_code] = row.access_level;
      }

      // Combine access list with space access
      const accessList = Array.from(accessMap.values()).map((member) => ({
        ...member,
        spaceAccess: spaceAccessByUser[member.userId] || {},
      }));

      return res.status(200).json({
        projectId,
        projectName: project.name,
        domainId: project.domain_id,
        createdBy: project.created_by,
        members: accessList,
        availableRoles: [
          { id: ROLES.PROJECT_ADMIN, ...getRoleMetadata(ROLES.PROJECT_ADMIN) },
          { id: ROLES.EDITOR, ...getRoleMetadata(ROLES.EDITOR) },
          { id: ROLES.VIEWER, ...getRoleMetadata(ROLES.VIEWER) },
        ],
      });
    } catch (err) {
      console.error('Error getting project access:', err);
      return res.status(500).json({ error: 'Failed to get project access' });
    }
  }

  if (req.method === 'POST') {
    // Grant access to the project
    const { userId, role, spaceAccess } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    // Check if current user can invite
    if (!hasPermission(currentUser, PERMISSIONS.USER_INVITE, { projectId, domainId: project.domain_id })) {
      return res.status(403).json({ error: 'You do not have permission to invite users' });
    }

    // Check if user exists
    const { exists } = await userRepository.userExists(userId);
    if (!exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user can assign this role
    const { allowed, reason } = canAssignRole(currentUser, role, { projectId, domainId: project.domain_id });
    if (!allowed) {
      return res.status(403).json({ error: reason });
    }

    try {
      // Assign the project role
      await roleRepository.assignProjectRole(userId, projectId, role, currentUser.id);

      // Set space access if provided
      if (spaceAccess && typeof spaceAccess === 'object') {
        for (const [spaceCode, accessLevel] of Object.entries(spaceAccess)) {
          await roleRepository.setSpaceAccess(userId, spaceCode, accessLevel, projectId, currentUser.id);
        }
      }

      return res.status(201).json({
        message: 'Access granted successfully',
        userId,
        role,
        spaceAccess,
      });
    } catch (err) {
      console.error('Error granting access:', err);
      return res.status(500).json({ error: 'Failed to grant access' });
    }
  }

  if (req.method === 'PUT') {
    // Update access (change role or space access)
    const { userId, role, spaceAccess } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if current user can manage project
    if (!hasPermission(currentUser, PERMISSIONS.PROJECT_MANAGE, { projectId, domainId: project.domain_id })) {
      return res.status(403).json({ error: 'You do not have permission to manage project access' });
    }

    try {
      // Update role if provided
      if (role) {
        const { allowed, reason } = canAssignRole(currentUser, role, { projectId, domainId: project.domain_id });
        if (!allowed) {
          return res.status(403).json({ error: reason });
        }
        await roleRepository.assignProjectRole(userId, projectId, role, currentUser.id);
      }

      // Update space access if provided
      if (spaceAccess && typeof spaceAccess === 'object') {
        for (const [spaceCode, accessLevel] of Object.entries(spaceAccess)) {
          if (accessLevel === null || accessLevel === 'none') {
            await roleRepository.removeSpaceAccess(userId, spaceCode, projectId);
          } else {
            await roleRepository.setSpaceAccess(userId, spaceCode, accessLevel, projectId, currentUser.id);
          }
        }
      }

      return res.status(200).json({
        message: 'Access updated successfully',
        userId,
        role,
        spaceAccess,
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

    // Cannot remove the project creator
    if (userId === project.created_by) {
      return res.status(400).json({ error: 'Cannot remove project creator' });
    }

    // Check if current user can remove users
    if (!hasPermission(currentUser, PERMISSIONS.USER_REMOVE, { projectId, domainId: project.domain_id })) {
      return res.status(403).json({ error: 'You do not have permission to remove users' });
    }

    try {
      // Remove project role
      await roleRepository.removeRole(userId, 'project', projectId);

      // Remove all space access for this project
      await query(
        `DELETE FROM space_access WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId]
      );

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
