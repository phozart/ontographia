// pages/api/ea/projects/[id].js
// Single EA Project operations

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  // GET - Get single project with related data
  if (req.method === 'GET') {
    try {
      const project = await eaRepository.findProjectById(id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.status(200).json(project);
    } catch (err) {
      console.error('Error fetching EA project:', err);
      return res.status(500).json({ error: 'Failed to fetch EA project' });
    }
  }

  // PUT - Update project
  if (req.method === 'PUT') {
    const {
      name,
      description,
      current_phase,
      scope,
      vision,
      baseline_date,
      target_date,
      stakeholders,
      principles,
      constraints,
      settings,
      status
    } = req.body;

    try {
      const project = await eaRepository.updateProject(id, {
        name,
        description,
        current_phase,
        scope,
        vision,
        baseline_date,
        target_date,
        stakeholders,
        principles,
        constraints,
        settings,
        status,
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.status(200).json(project);
    } catch (err) {
      console.error('Error updating EA project:', err);
      return res.status(500).json({ error: 'Failed to update EA project' });
    }
  }

  // DELETE - Delete project
  if (req.method === 'DELETE') {
    try {
      const deleted = await eaRepository.deleteProject(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting EA project:', err);
      return res.status(500).json({ error: 'Failed to delete EA project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
