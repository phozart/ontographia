// pages/api/ea/analysis/views.js
// EA View Derivation API
// Task EN-092

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { deriveViewElements } from '../../../../lib/ea-business-logic';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // POST - Derive elements for a viewpoint
  if (req.method === 'POST') {
    const { domainId, viewpoint, seedElementIds, depth = 2 } = req.body;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    if (!viewpoint) {
      return res.status(400).json({ error: 'viewpoint is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
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

      // Get seed elements
      let seedElements = [];
      if (seedElementIds && seedElementIds.length > 0) {
        seedElements = seedElementIds.map(id => graphContext.elements[id]).filter(Boolean);
      }

      // Derive view elements
      const derivedIds = deriveViewElements(viewpoint, seedElements, graphContext, {
        maxDepth: Math.min(depth, 4),
        includeRelated: true,
      });

      // Get full element details for derived IDs
      const derivedElements = derivedIds.map(id => graphContext.elements[id]).filter(Boolean);

      // Get relationships between derived elements
      const derivedRelationships = relationships.filter(
        rel => derivedIds.includes(rel.source_element_id) && derivedIds.includes(rel.target_element_id)
      );

      // Group by layer
      const byLayer = {};
      derivedElements.forEach(el => {
        const layer = el.layer || 'other';
        if (!byLayer[layer]) {
          byLayer[layer] = [];
        }
        byLayer[layer].push(el);
      });

      // Group by element type
      const byType = {};
      derivedElements.forEach(el => {
        const type = el.element_type;
        if (!byType[type]) {
          byType[type] = [];
        }
        byType[type].push(el);
      });

      return res.status(200).json({
        domainId,
        viewpoint,
        seedElements: seedElements.map(e => ({ id: e.id, name: e.name, type: e.element_type })),
        derivedElements,
        derivedRelationships,
        summary: {
          totalElements: derivedElements.length,
          totalRelationships: derivedRelationships.length,
          byLayer: Object.fromEntries(Object.entries(byLayer).map(([k, v]) => [k, v.length])),
          byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, v.length])),
        },
        layoutSuggestions: generateLayoutSuggestions(viewpoint, byLayer),
      });
    } catch (err) {
      console.error('Error deriving view elements:', err);
      return res.status(500).json({ error: 'Failed to derive view elements' });
    }
  }

  // GET - List available viewpoints
  if (req.method === 'GET') {
    const viewpoints = [
      { id: 'organization', name: 'Organization', description: 'Business actors, roles, and collaborations', layers: ['business'] },
      { id: 'business-process-cooperation', name: 'Business Process Cooperation', description: 'Business processes and their interactions', layers: ['business'] },
      { id: 'product', name: 'Product', description: 'Products, contracts, and services', layers: ['business'] },
      { id: 'application-cooperation', name: 'Application Cooperation', description: 'Application components and their interactions', layers: ['application'] },
      { id: 'application-usage', name: 'Application Usage', description: 'How applications support business processes', layers: ['application', 'business'] },
      { id: 'implementation-deployment', name: 'Implementation & Deployment', description: 'Technology infrastructure and deployments', layers: ['technology'] },
      { id: 'technology-usage', name: 'Technology Usage', description: 'How technology supports applications', layers: ['technology', 'application'] },
      { id: 'layered', name: 'Layered', description: 'Full architecture across all layers', layers: ['strategy', 'business', 'application', 'technology', 'physical', 'motivation', 'implementation'] },
      { id: 'motivation', name: 'Motivation', description: 'Goals, drivers, and requirements', layers: ['motivation'] },
      { id: 'strategy', name: 'Strategy', description: 'Resources, capabilities, and value streams', layers: ['strategy'] },
      { id: 'capability-map', name: 'Capability Map', description: 'Business capabilities hierarchy', layers: ['strategy'] },
      { id: 'information-structure', name: 'Information Structure', description: 'Data objects and their relationships', layers: ['business', 'application'] },
      { id: 'service-realization', name: 'Service Realization', description: 'How services are realized by processes and applications', layers: ['business', 'application'] },
      { id: 'migration', name: 'Migration', description: 'Plateaus and gaps in architecture transition', layers: ['implementation'] },
    ];

    return res.status(200).json({ viewpoints });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Generate layout suggestions based on viewpoint
function generateLayoutSuggestions(viewpoint, byLayer) {
  const suggestions = {
    layout: 'hierarchical',
    direction: 'top-bottom',
    groupBy: 'layer',
    layerOrder: [],
  };

  switch (viewpoint) {
    case 'layered':
      suggestions.layout = 'hierarchical';
      suggestions.direction = 'top-bottom';
      suggestions.layerOrder = ['motivation', 'strategy', 'business', 'application', 'technology', 'physical', 'implementation'];
      break;
    case 'organization':
      suggestions.layout = 'hierarchical';
      suggestions.direction = 'left-right';
      suggestions.groupBy = 'type';
      break;
    case 'business-process-cooperation':
    case 'application-cooperation':
      suggestions.layout = 'force-directed';
      suggestions.groupBy = 'type';
      break;
    case 'capability-map':
      suggestions.layout = 'treemap';
      suggestions.groupBy = 'parent';
      break;
    case 'migration':
      suggestions.layout = 'timeline';
      suggestions.direction = 'left-right';
      suggestions.groupBy = 'plateau';
      break;
    default:
      suggestions.layout = 'hierarchical';
      suggestions.layerOrder = Object.keys(byLayer);
  }

  return suggestions;
}
