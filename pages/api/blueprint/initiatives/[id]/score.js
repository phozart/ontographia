// pages/api/blueprint/initiatives/[id]/score.js
// Scoring API for Blueprint Initiatives
// Task BP-013

import { blueprintRepository } from '../../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../../lib/projectAccess';
import { BPS_SCORING_CRITERIA, calculateOverallScore } from '../../../../../lib/blueprint-types';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Initiative ID is required' });
  }

  // GET - Get current scores and criteria
  if (req.method === 'GET') {
    try {
      const initiative = await blueprintRepository.findById(id);
      if (!initiative) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      // Check domain access
      if (initiative.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, initiative.domain_id, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Access denied' });
        }
      }

      const assessData = initiative.assess_data || {};
      const scores = {};
      let scoredCount = 0;

      // Extract scores for each criterion
      Object.entries(BPS_SCORING_CRITERIA).forEach(([key, criteria]) => {
        const criterionData = assessData[key] || {};
        scores[key] = {
          ...criteria,
          score: criterionData.score ?? null,
          rationale: criterionData.rationale || '',
          scoredBy: criterionData.scored_by || null,
          scoredAt: criterionData.scored_at || null,
        };
        if (criterionData.score !== undefined && criterionData.score !== null) {
          scoredCount++;
        }
      });

      return res.status(200).json({
        initiativeId: initiative.initiative_id,
        stage: initiative.stage,
        scores,
        overallScore: assessData.overall_score ?? null,
        scoredCount,
        totalCriteria: Object.keys(BPS_SCORING_CRITERIA).length,
        isComplete: scoredCount === Object.keys(BPS_SCORING_CRITERIA).length,
      });
    } catch (err) {
      console.error('Error fetching initiative scores:', err);
      return res.status(500).json({ error: 'Failed to fetch scores' });
    }
  }

  // POST/PUT - Update scores
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const initiative = await blueprintRepository.findById(id);
      if (!initiative) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      // Check domain edit access
      if (initiative.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, initiative.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      const { scores } = req.body;

      if (!scores || typeof scores !== 'object') {
        return res.status(400).json({ error: 'scores object is required' });
      }

      // Validate scores
      const validScores = {};
      const errors = [];

      Object.entries(scores).forEach(([criterion, data]) => {
        if (!BPS_SCORING_CRITERIA[criterion]) {
          errors.push(`Invalid criterion: ${criterion}`);
          return;
        }

        const maxScore = BPS_SCORING_CRITERIA[criterion].maxScore;

        if (data.score !== undefined && data.score !== null) {
          const score = Number(data.score);
          if (isNaN(score) || score < 0 || score > maxScore) {
            errors.push(`${criterion}: score must be between 0 and ${maxScore}`);
            return;
          }
          // Validate confidence if provided (1-5 scale)
          let confidence = undefined;
          if (data.confidence !== undefined && data.confidence !== null) {
            confidence = Number(data.confidence);
            if (isNaN(confidence) || confidence < 1 || confidence > 5) {
              errors.push(`${criterion}: confidence must be between 1 and 5`);
              return;
            }
          }
          validScores[criterion] = {
            score,
            confidence,
            rationale: data.rationale || '',
            scoredBy: user,
          };
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation errors', details: errors });
      }

      if (Object.keys(validScores).length === 0) {
        return res.status(400).json({ error: 'No valid scores provided' });
      }

      // Update scores
      const updated = await blueprintRepository.updateScoring(id, validScores);

      if (!updated) {
        return res.status(500).json({ error: 'Failed to update scores' });
      }

      return res.status(200).json({
        initiative: updated,
        overallScore: updated.assess_data?.overall_score,
        message: `Updated ${Object.keys(validScores).length} score(s)`,
      });
    } catch (err) {
      console.error('Error updating initiative scores:', err);
      return res.status(500).json({ error: 'Failed to update scores' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
