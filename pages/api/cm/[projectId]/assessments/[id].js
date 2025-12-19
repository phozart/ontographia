// pages/api/cm/[projectId]/assessments/[id].js
// Change Management - Individual PCT Assessment CRUD endpoint

import { cmRepository } from '../../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { projectId, id } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId || !id) {
    return res.status(400).json({ error: 'Project ID and Assessment ID required' });
  }

  if (req.method === 'GET') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const assessment = await cmRepository.findAssessmentById(projectId, id);

      if (!assessment) {
        return res.status(404).json({ error: 'PCT assessment not found' });
      }

      return res.status(200).json(assessment);
    } catch (err) {
      console.error('Error fetching PCT assessment:', err);
      return res.status(500).json({ error: 'Failed to fetch PCT assessment' });
    }
  }

  if (req.method === 'PUT') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      name,
      stakeholderGroupId,
      status,
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

    try {
      const assessment = await cmRepository.updateAssessment(projectId, id, {
        name,
        stakeholderGroupId,
        status,
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
      });

      if (!assessment) {
        return res.status(404).json({ error: 'PCT assessment not found' });
      }

      return res.status(200).json(assessment);
    } catch (err) {
      console.error('Error updating PCT assessment:', err);
      return res.status(500).json({ error: 'Failed to update PCT assessment' });
    }
  }

  if (req.method === 'DELETE') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const deleted = await cmRepository.deleteAssessment(projectId, id);

      if (!deleted) {
        return res.status(404).json({ error: 'PCT assessment not found' });
      }

      return res.status(200).json({ success: true, message: 'PCT assessment deleted' });
    } catch (err) {
      console.error('Error deleting PCT assessment:', err);
      return res.status(500).json({ error: 'Failed to delete PCT assessment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
