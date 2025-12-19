/**
 * Capability Studio - Statistics API
 *
 * @route GET /api/cap/stats - Get capability statistics
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/cap/stats
 */

import { capRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { CAP_MATURITY_LEVELS, CAP_STRATEGIC_IMPORTANCE, CAP_STAGES } from '../../../lib/cap-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    const stats = await capRepository.getStats(projectId);

    // Calculate maturity health indicators
    const maturityHealth = calculateMaturityHealth(stats.capabilities.byMaturity);

    // Calculate gap health
    const gapHealth = calculateGapHealth(stats.gaps.bySeverity);

    // Calculate stage completion
    const stageCompletion = calculateStageCompletion(stats.countsByType);

    return res.status(200).json({
      ...stats,
      health: {
        maturity: maturityHealth,
        gaps: gapHealth,
        stages: stageCompletion,
        overall: Math.round((maturityHealth.score + gapHealth.score) / 2),
      },
      metadata: {
        maturityLevels: CAP_MATURITY_LEVELS,
        strategicImportance: CAP_STRATEGIC_IMPORTANCE,
        stages: CAP_STAGES,
      },
    });
  } catch (err) {
    console.error('Error fetching capability stats:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
}

/**
 * Calculate maturity health score (0-100)
 */
function calculateMaturityHealth(byMaturity) {
  const weights = {
    initial: 1,
    developing: 2,
    defined: 3,
    managed: 4,
    optimizing: 5,
  };

  let totalScore = 0;
  let count = 0;

  Object.entries(byMaturity || {}).forEach(([level, num]) => {
    if (level !== 'unassessed' && weights[level]) {
      totalScore += weights[level] * num;
      count += num;
    }
  });

  const averageMaturity = count > 0 ? totalScore / count : 0;
  const score = Math.round((averageMaturity / 5) * 100);

  return {
    score,
    averageMaturity: Math.round(averageMaturity * 10) / 10,
    assessedCount: count,
    unassessedCount: byMaturity?.unassessed || 0,
    label: getHealthLabel(score),
  };
}

/**
 * Calculate gap health score (0-100, higher is better = fewer/less severe gaps)
 */
function calculateGapHealth(bySeverity) {
  const weights = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  let totalWeight = 0;
  let count = 0;

  Object.entries(bySeverity || {}).forEach(([severity, num]) => {
    if (weights[severity]) {
      totalWeight += weights[severity] * num;
      count += num;
    }
  });

  // Inverse score - more/severe gaps = lower score
  // Max weight per gap is 4, so 100 gaps at critical = 400
  const maxExpectedWeight = 100; // Assume 100 weight points is very problematic
  const score = count === 0 ? 100 : Math.max(0, Math.round(100 - (totalWeight / maxExpectedWeight * 100)));

  return {
    score,
    totalGaps: count,
    bySeverity,
    label: getHealthLabel(score),
  };
}

/**
 * Calculate stage completion percentages
 */
function calculateStageCompletion(countsByType) {
  const stages = {
    discover: {
      types: ['cap_capability', 'cap_capability_group', 'cap_value_stream'],
      count: 0,
      minRequired: 3, // At least 3 capabilities to start
    },
    assess: {
      types: ['cap_assessment', 'cap_gap'],
      count: 0,
      minRequired: 1,
    },
    design: {
      types: ['cap_operating_model', 'cap_accountability', 'cap_resource'],
      count: 0,
      minRequired: 1,
    },
    plan: {
      types: ['cap_initiative', 'cap_roadmap_item'],
      count: 0,
      minRequired: 0, // Optional
    },
  };

  // Count artefacts per stage
  Object.entries(countsByType || {}).forEach(([type, count]) => {
    Object.values(stages).forEach(stage => {
      if (stage.types.includes(type)) {
        stage.count += count;
      }
    });
  });

  // Calculate completion percentage for each stage
  const result = {};
  Object.entries(stages).forEach(([stageId, stage]) => {
    const completion = stage.minRequired === 0
      ? (stage.count > 0 ? 100 : 0)
      : Math.min(100, Math.round((stage.count / stage.minRequired) * 100));

    result[stageId] = {
      count: stage.count,
      completion,
      status: completion >= 100 ? 'complete' : completion > 0 ? 'in_progress' : 'not_started',
    };
  });

  return result;
}

/**
 * Get health label based on score
 */
function getHealthLabel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 20) return 'needs_attention';
  return 'critical';
}
