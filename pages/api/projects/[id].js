// pages/api/projects/[id].js
// Get, update, delete single project with access control

import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { projectRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'GET') {
    // Get single project
    const { hasAccess, error } = await checkProjectAccess(req, id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const project = await projectRepository.findByIdWithStats(id, user);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json(project);
    } catch (err) {
      console.error('Error fetching project:', err);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }
  }

  if (req.method === 'PUT') {
    // Update project
    const { hasAccess, error } = await checkProjectAccess(req, id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const project = await projectRepository.updateProject(id, req.body);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json(project);
    } catch (err) {
      console.error('Error updating project:', err);
      return res.status(500).json({ error: 'Failed to update project' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete project (only creator or admin)
    const { hasAccess, error } = await checkProjectAccess(req, id, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const deleted = await projectRepository.deleteProject(id, user, role);
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      if (err.message.includes('Only project creator')) {
        return res.status(403).json({ error: err.message });
      }
      console.error('Error deleting project:', err);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
