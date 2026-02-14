// pages/api/ea/analysis/gaps.js
// EA Roadmap Gap Analysis API
// Task EN-095

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { analyzeRoadmapGaps } from '../../../../lib/ea-business-logic';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - Analyze gaps between architecture plateaus
  if (req.method === 'GET') {
    const { domainId, baselineId, targetId } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Get all elements with their architecture states
      const elementsResult = await query(
        `SELECT * FROM ea_elements WHERE domain_id = $1 ORDER BY element_type, name`,
        [domainId]
      );

      const elements = elementsResult.rows;

      // Group elements by architecture state
      const byState = {
        baseline: elements.filter(e => e.architecture_state === 'Baseline' || e.architecture_state === 'baseline'),
        target: elements.filter(e => e.architecture_state === 'Target' || e.architecture_state === 'target'),
        transition: elements.filter(e => e.architecture_state === 'Transition' || e.architecture_state === 'transition'),
      };

      // If specific baseline/target IDs provided, use those
      let baselineElements = byState.baseline;
      let targetElements = byState.target;

      if (baselineId) {
        // Get elements linked to baseline plateau
        const baselineLinked = await query(
          `SELECT e.* FROM ea_elements e
           JOIN ea_relationships r ON r.source_element_id = e.id OR r.target_element_id = e.id
           WHERE (r.source_element_id = $1 OR r.target_element_id = $1)
           AND e.domain_id = $2`,
          [baselineId, domainId]
        );
        if (baselineLinked.rows.length > 0) {
          baselineElements = baselineLinked.rows;
        }
      }

      if (targetId) {
        const targetLinked = await query(
          `SELECT e.* FROM ea_elements e
           JOIN ea_relationships r ON r.source_element_id = e.id OR r.target_element_id = e.id
           WHERE (r.source_element_id = $1 OR r.target_element_id = $1)
           AND e.domain_id = $2`,
          [targetId, domainId]
        );
        if (targetLinked.rows.length > 0) {
          targetElements = targetLinked.rows;
        }
      }

      // Run gap analysis
      const gaps = analyzeRoadmapGaps(baselineElements, targetElements);

      // Categorize gaps by type
      const categorizedGaps = {
        additions: gaps.filter(g => g.type === 'addition'),
        removals: gaps.filter(g => g.type === 'removal'),
        modifications: gaps.filter(g => g.type === 'modification'),
        dependencies: gaps.filter(g => g.type === 'dependency'),
      };

      // Group by layer
      const byLayer = {};
      gaps.forEach(gap => {
        const layer = gap.element?.layer || 'unknown';
        if (!byLayer[layer]) {
          byLayer[layer] = [];
        }
        byLayer[layer].push(gap);
      });

      return res.status(200).json({
        domainId,
        baselineCount: baselineElements.length,
        targetCount: targetElements.length,
        transitionCount: byState.transition.length,
        totalGaps: gaps.length,
        gaps,
        categorized: categorizedGaps,
        byLayer,
        summary: {
          additions: categorizedGaps.additions.length,
          removals: categorizedGaps.removals.length,
          modifications: categorizedGaps.modifications.length,
          dependencies: categorizedGaps.dependencies.length,
        },
        workPackageSuggestions: generateWorkPackageSuggestions(categorizedGaps),
      });
    } catch (err) {
      console.error('Error analyzing gaps:', err);
      return res.status(500).json({ error: 'Failed to analyze gaps' });
    }
  }

  // POST - Analyze gaps between two specific element sets
  if (req.method === 'POST') {
    const { domainId, baselineElementIds, targetElementIds } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let baselineElements = [];
      let targetElements = [];

      if (baselineElementIds && baselineElementIds.length > 0) {
        const result = await query(
          `SELECT * FROM ea_elements WHERE id = ANY($1) AND domain_id = $2`,
          [baselineElementIds, domainId]
        );
        baselineElements = result.rows;
      }

      if (targetElementIds && targetElementIds.length > 0) {
        const result = await query(
          `SELECT * FROM ea_elements WHERE id = ANY($1) AND domain_id = $2`,
          [targetElementIds, domainId]
        );
        targetElements = result.rows;
      }

      const gaps = analyzeRoadmapGaps(baselineElements, targetElements);

      return res.status(200).json({
        domainId,
        baselineCount: baselineElements.length,
        targetCount: targetElements.length,
        gaps,
        totalGaps: gaps.length,
      });
    } catch (err) {
      console.error('Error analyzing element gaps:', err);
      return res.status(500).json({ error: 'Failed to analyze element gaps' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Helper to suggest work packages based on gaps
function generateWorkPackageSuggestions(categorized) {
  const suggestions = [];

  if (categorized.additions.length > 0) {
    // Group additions by layer
    const byLayer = {};
    categorized.additions.forEach(gap => {
      const layer = gap.element?.layer || 'unknown';
      if (!byLayer[layer]) {
        byLayer[layer] = [];
      }
      byLayer[layer].push(gap);
    });

    Object.entries(byLayer).forEach(([layer, gaps]) => {
      suggestions.push({
        type: 'implementation',
        name: `Implement ${layer} capabilities`,
        description: `Add ${gaps.length} new ${layer} elements to target architecture`,
        elements: gaps.map(g => g.element?.name || g.elementId),
        priority: layer === 'business' ? 'high' : layer === 'application' ? 'medium' : 'low',
      });
    });
  }

  if (categorized.removals.length > 0) {
    suggestions.push({
      type: 'decommission',
      name: 'Decommission legacy components',
      description: `Retire ${categorized.removals.length} elements from baseline architecture`,
      elements: categorized.removals.map(g => g.element?.name || g.elementId),
      priority: 'medium',
    });
  }

  if (categorized.modifications.length > 0) {
    suggestions.push({
      type: 'enhancement',
      name: 'Enhance existing components',
      description: `Modify ${categorized.modifications.length} elements to meet target requirements`,
      elements: categorized.modifications.map(g => g.element?.name || g.elementId),
      priority: 'high',
    });
  }

  return suggestions;
}
