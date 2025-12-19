// pages/api/ea/projects/index.js
// CRUD API for EA Projects (TOGAF ADM)

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { domain_id, status } = req.query;

  // GET - List all projects
  if (req.method === 'GET') {
    try {
      const projects = await eaRepository.findAllProjects({ domain_id, status });
      return res.status(200).json(projects);
    } catch (err) {
      console.error('Error fetching EA projects:', err);
      return res.status(500).json({ error: 'Failed to fetch EA projects' });
    }
  }

  // POST - Create new project
  if (req.method === 'POST') {
    const {
      domain_id,
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
      status: projectStatus,
      created_by
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    try {
      const project = await eaRepository.createProject({
        domain_id,
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
        status: projectStatus,
        created_by,
      });
      return res.status(201).json(project);
    } catch (err) {
      console.error('Error creating EA project:', err);
      return res.status(500).json({ error: 'Failed to create EA project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
