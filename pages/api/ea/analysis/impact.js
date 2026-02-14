// pages/api/ea/analysis/impact.js
// EA Impact Analysis API
// Task EN-094

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { analyzeImpact } from '../../../../lib/ea-business-logic';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // POST - Analyze impact of proposed changes
  if (req.method === 'POST') {
    const { domainId, elementId, proposedChange, depth = 3, includeIndirect = true } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    if (!elementId) {
      return res.status(400).json({ error: 'elementId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Verify element exists
      const elementResult = await query(
        `SELECT * FROM ea_elements WHERE id = $1 AND domain_id = $2`,
        [elementId, domainId]
      );

      if (elementResult.rows.length === 0) {
        return res.status(404).json({ error: 'Element not found' });
      }

      const element = elementResult.rows[0];

      // Get all elements and relationships for the domain
      const [elementsResult, relationshipsResult] = await Promise.all([
        query(`SELECT * FROM ea_elements WHERE domain_id = $1`, [domainId]),
        query(`SELECT * FROM ea_relationships WHERE domain_id = $1`, [domainId]),
      ]);

      const elements = elementsResult.rows;
      const relationships = relationshipsResult.rows;

      // Build graph context
      const graphContext = {
        elements: elements.reduce((acc, el) => {
          acc[el.id] = el;
          return acc;
        }, {}),
        relationships,
        getRelated: (id, direction = 'both') => {
          const related = [];
          relationships.forEach(rel => {
            if (direction !== 'outbound' && rel.target_element_id === id) {
              related.push({ elementId: rel.source_element_id, relationship: rel, direction: 'inbound' });
            }
            if (direction !== 'inbound' && rel.source_element_id === id) {
              related.push({ elementId: rel.target_element_id, relationship: rel, direction: 'outbound' });
            }
          });
          return related;
        },
      };

      // Run impact analysis
      const impact = analyzeImpact(element, proposedChange || { type: 'modify' }, graphContext, {
        maxDepth: Math.min(depth, 5),
        includeIndirect,
      });

      // Enrich impact results with element details
      const enrichedUpstream = impact.upstream.map(id => ({
        id,
        element: graphContext.elements[id],
      }));

      const enrichedDownstream = impact.downstream.map(id => ({
        id,
        element: graphContext.elements[id],
      }));

      const enrichedCrossLayer = impact.crossLayer.map(id => ({
        id,
        element: graphContext.elements[id],
      }));

      return res.status(200).json({
        elementId,
        elementName: element.name,
        elementType: element.element_type,
        proposedChange: proposedChange || { type: 'modify' },
        impact: {
          ...impact,
          upstream: enrichedUpstream,
          downstream: enrichedDownstream,
          crossLayer: enrichedCrossLayer,
        },
        summary: {
          totalAffected: impact.upstream.length + impact.downstream.length + impact.crossLayer.length,
          upstreamCount: impact.upstream.length,
          downstreamCount: impact.downstream.length,
          crossLayerCount: impact.crossLayer.length,
          riskLevel: impact.riskAssessment?.level || 'low',
        },
      });
    } catch (err) {
      console.error('Error analyzing impact:', err);
      return res.status(500).json({ error: 'Failed to analyze impact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
