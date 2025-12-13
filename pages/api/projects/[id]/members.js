// pages/api/projects/[id]/members.js
// Manage project members with role-based access control

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess, PROJECT_ROLES } from '../../../../lib/projectAccess';

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
      // Get all members including creator
      const result = await query(
        `SELECT
          pm.user_id,
          pm.role,
          pm.added_at,
          pm.added_by,
          u.username,
          p.created_by,
          CASE WHEN pm.user_id = p.created_by THEN true ELSE false END as is_creator
        FROM project_members pm
        JOIN users u ON u.id = pm.user_id
        JOIN projects p ON p.id = pm.project_id
        WHERE pm.project_id = $1
        ORDER BY pm.added_at ASC`,
        [projectId]
      );

      // Also add creator if not already a member
      const members = result.rows;

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
    // Add member to project
    // Only BA or admin can add members
    const { hasAccess, projectRole, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Check if user has permission to manage members (BA only)
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
      const userResult = await query(`SELECT id, username FROM users WHERE id = $1`, [userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add or update member
      const result = await query(
        `INSERT INTO project_members (project_id, user_id, role, added_by, added_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (project_id, user_id)
         DO UPDATE SET role = $3
         RETURNING *`,
        [projectId, userId, memberRole, user]
      );

      return res.status(201).json({
        ...result.rows[0],
        username: userResult.rows[0].username
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

    // Check if user has permission to manage members (BA only)
    if (projectRole !== 'Business Analyst' && projectRole !== 'admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Only Business Analysts can manage project members' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    try {
      // Don't allow removing project creator
      const projectResult = await query(`SELECT created_by FROM projects WHERE id = $1`, [projectId]);
      if (projectResult.rows.length > 0 && projectResult.rows[0].created_by === userId) {
        return res.status(400).json({ error: 'Cannot remove project creator from members' });
      }

      await query(
        `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId]
      );

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

    // Check if user has permission to manage members (BA only)
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
      const result = await query(
        `UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *`,
        [newRole, projectId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating member:', err);
      return res.status(500).json({ error: 'Failed to update member' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
