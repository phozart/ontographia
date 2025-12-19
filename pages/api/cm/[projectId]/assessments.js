// pages/api/cm/[projectId]/assessments.js
// Change Management - PCT Assessments CRUD endpoint

import { cmRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { projectId } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'GET') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { stakeholderGroupId } = req.query;

    try {
      const assessments = await cmRepository.findAssessments(projectId, { stakeholderGroupId });
      return res.status(200).json({ assessments });
    } catch (err) {
      console.error('Error listing PCT assessments:', err);
      return res.status(500).json({ error: 'Failed to list PCT assessments' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      name,
      stakeholderGroupId,
      responses,
      leadershipScore,
      projectScore,
      changeScore,
      successScore,
      purposeScore,
      purposeNotes,
      capacityScore,
      capacityNotes,
      trustScore,
      trustNotes,
      assessedDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const assessment = await cmRepository.createAssessment(projectId, {
        name,
        stakeholderGroupId,
        responses,
        leadershipScore,
        projectScore,
        changeScore,
        successScore,
        purposeScore,
        purposeNotes,
        capacityScore,
        capacityNotes,
        trustScore,
        trustNotes,
        assessedDate,
      }, user);

      return res.status(201).json(assessment);
    } catch (err) {
      console.error('Error creating PCT assessment:', err);
      return res.status(500).json({ error: 'Failed to create PCT assessment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
