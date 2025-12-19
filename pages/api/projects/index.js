// pages/api/projects/index.js
// List and create projects with access control

import { getUserFromRequest, getAccessibleProjects } from '../../../lib/projectAccess';
import { projectRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List projects accessible to user
    try {
      const { domainId } = req.query;
      const projects = await getAccessibleProjects(user, role, domainId);
      return res.status(200).json(projects);
    } catch (err) {
      console.error('Error listing projects:', err);
      return res.status(500).json({ error: 'Failed to list projects' });
    }
  }

  if (req.method === 'POST') {
    // Create new project
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    try {
      const project = await projectRepository.createWithMember(req.body, user);
      return res.status(201).json(project);
    } catch (err) {
      console.error('Error creating project:', err);
      return res.status(500).json({ error: 'Failed to create project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
