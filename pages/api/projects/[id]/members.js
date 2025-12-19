// pages/api/projects/[id]/members.js
// Manage project members with role-based access control

import { getUserFromRequest, checkProjectAccess, PROJECT_ROLES } from '../../../../lib/projectAccess';
import { projectRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id: projectId } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'GET') {
    // List project members
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const members = await projectRepository.getMembersWithDetails(projectId);
      return res.status(200).json({
        members,
        roles: PROJECT_ROLES
      });
    } catch (err) {
      console.error('Error listing members:', err);
      return res.status(500).json({ error: 'Failed to list members' });
    }
  }

  if (req.method === 'POST') {
    // Add member to project - only BA or admin can add members
    const { hasAccess, projectRole, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    if (projectRole !== 'Business Analyst' && projectRole !== 'admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Only Business Analysts can manage project members' });
    }

    const { userId, memberRole } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!memberRole || !PROJECT_ROLES[memberRole]) {
      return res.status(400).json({ error: 'Valid role required', validRoles: Object.keys(PROJECT_ROLES) });
    }

    try {
      // Check if user exists
      const { exists, username } = await projectRepository.userExists(userId);
      if (!exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add or update member
      const member = await projectRepository.addMember(projectId, userId, memberRole, user);

      return res.status(201).json({
        ...member,
        username
      });
    } catch (err) {
      console.error('Error adding member:', err);
      return res.status(500).json({ error: 'Failed to add member' });
    }
  }

  if (req.method === 'DELETE') {
    // Remove member from project
    const { hasAccess, projectRole, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    if (projectRole !== 'Business Analyst' && projectRole !== 'admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Only Business Analysts can manage project members' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    try {
      // Don't allow removing project creator
      const creatorId = await projectRepository.getCreatorId(projectId);
      if (creatorId === userId) {
        return res.status(400).json({ error: 'Cannot remove project creator from members' });
      }

      await projectRepository.removeMember(projectId, userId);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error removing member:', err);
      return res.status(500).json({ error: 'Failed to remove member' });
    }
  }

  if (req.method === 'PATCH') {
    // Update member role
    const { hasAccess, projectRole, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    if (projectRole !== 'Business Analyst' && projectRole !== 'admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Only Business Analysts can manage project members' });
    }

    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({ error: 'User ID and new role required' });
    }

    if (!PROJECT_ROLES[newRole]) {
      return res.status(400).json({ error: 'Invalid role', validRoles: Object.keys(PROJECT_ROLES) });
    }

    try {
      const member = await projectRepository.updateMemberRole(projectId, userId, newRole);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
      return res.status(200).json(member);
    } catch (err) {
      console.error('Error updating member:', err);
      return res.status(500).json({ error: 'Failed to update member' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
