// pages/api/projects/index.js
// List and create projects with access control

import { query } from '../../../lib/pg';
import { getUserFromRequest, getAccessibleProjects, PROJECT_ROLES } from '../../../lib/projectAccess';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_STATUS = ['Draft', 'Active', 'On Hold', 'Closed'];

// Normalize status to match database constraint (case-insensitive)
const normalizeStatus = (value, defaultValue = 'Draft') => {
  if (!value) return defaultValue;
  const lower = String(value).toLowerCase();
  const found = VALID_STATUS.find(v => v.toLowerCase() === lower);
  return found || defaultValue;
};

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
    const {
      name,
      description,
      businessContext,
      startDate,
      endDate,
      status,
      domainId,
      inScope,
      outOfScope,
      objectives,
      successCriteria,
      settings
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Normalize status to valid database value
    const projectStatus = normalizeStatus(status);

    try {
      const result = await query(
        `INSERT INTO projects (
          name, description, business_context, start_date, end_date, status,
          domain_id, in_scope, out_of_scope, objectives, success_criteria, settings,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now())
        RETURNING *`,
        [
          name.trim(),
          description || '',
          businessContext || '',
          startDate || null,
          endDate || null,
          projectStatus,
          domainId || null,
          JSON.stringify(inScope || []),
          JSON.stringify(outOfScope || []),
          JSON.stringify(objectives || []),
          JSON.stringify(successCriteria || []),
          JSON.stringify(settings || {}),
          user
        ]
      );

      const project = result.rows[0];

      // Add creator as Business Analyst member
      await query(
        `INSERT INTO project_members (project_id, user_id, role, added_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (project_id, user_id) DO NOTHING`,
        [project.id, user, 'Business Analyst', user]
      );

      return res.status(201).json({
        ...project,
        user_role: 'Business Analyst',
        artefact_count: 0,
        member_count: 1
      });
    } catch (err) {
      console.error('Error creating project:', err);
      return res.status(500).json({ error: 'Failed to create project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
