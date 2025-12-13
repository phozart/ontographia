// pages/api/ea/elements.js
// CRUD API for EA elements (PostgreSQL-only, separate from Neo4j graph)

import { query } from '../../../lib/pg';

// ArchiMate element types by layer
export const EA_ELEMENT_TYPES = {
  Strategy: [
    { id: 'Resource', name: 'Resource', color: '#4ade80' },
    { id: 'Capability', name: 'Capability', color: '#3b82f6' },
    { id: 'ValueStream', name: 'Value Stream', color: '#8b5cf6' },
    { id: 'CourseOfAction', name: 'Course of Action', color: '#22c55e' },
  ],
  Motivation: [
    { id: 'Stakeholder', name: 'Stakeholder', color: '#fde047' },
    { id: 'Driver', name: 'Driver', color: '#facc15' },
    { id: 'Assessment', name: 'Assessment', color: '#eab308' },
    { id: 'Goal', name: 'Goal', color: '#ca8a04' },
    { id: 'Outcome', name: 'Outcome', color: '#a16207' },
    { id: 'Principle', name: 'Principle', color: '#06b6d4' },
    { id: 'Requirement', name: 'Requirement', color: '#854d0e' },
    { id: 'Constraint', name: 'Constraint', color: '#713f12' },
  ],
  Business: [
    { id: 'BusinessActor', name: 'Business Actor', color: '#fbbf24' },
    { id: 'BusinessRole', name: 'Business Role', color: '#f59e0b' },
    { id: 'BusinessProcess', name: 'Business Process', color: '#fcd34d' },
    { id: 'BusinessFunction', name: 'Business Function', color: '#fde68a' },
    { id: 'BusinessService', name: 'Business Service', color: '#fb923c' },
    { id: 'BusinessObject', name: 'Business Object', color: '#fdba74' },
    { id: 'Product', name: 'Product', color: '#ea580c' },
  ],
  Application: [
    { id: 'ApplicationComponent', name: 'Application Component', color: '#3b82f6' },
    { id: 'ApplicationService', name: 'Application Service', color: '#818cf8' },
    { id: 'ApplicationInterface', name: 'Application Interface', color: '#1d4ed8' },
    { id: 'DataObject', name: 'Data Object', color: '#a5b4fc' },
  ],
  Technology: [
    { id: 'Node', name: 'Node', color: '#475569' },
    { id: 'Device', name: 'Device', color: '#334155' },
    { id: 'SystemSoftware', name: 'System Software', color: '#1e293b' },
    { id: 'TechnologyService', name: 'Technology Service', color: '#64748b' },
    { id: 'Artifact', name: 'Artifact', color: '#94a3b8' },
  ],
  Implementation: [
    { id: 'WorkPackage', name: 'Work Package', color: '#14b8a6' },
    { id: 'Deliverable', name: 'Deliverable', color: '#0d9488' },
    { id: 'Plateau', name: 'Plateau', color: '#115e59' },
    { id: 'Gap', name: 'Gap', color: '#134e4a' },
  ],
};

// Flatten for lookup
export const ALL_EA_TYPES = Object.entries(EA_ELEMENT_TYPES).flatMap(([layer, types]) =>
  types.map(t => ({ ...t, layer }))
);

export default async function handler(req, res) {
  const { domain } = req.query;

  if (req.method === 'GET') {
    try {
      let sql = `
        SELECT e.*,
          u.username as created_by_username,
          p.name as parent_name
        FROM ea_elements e
        LEFT JOIN users u ON u.id = e.created_by
        LEFT JOIN ea_elements p ON p.id = e.parent_id
      `;
      const params = [];

      if (domain) {
        // Get domain ID
        const domainResult = await query('SELECT id FROM domains WHERE name = $1', [domain]);
        if (domainResult.rows.length > 0) {
          sql += ' WHERE e.domain_id = $1';
          params.push(domainResult.rows[0].id);
        }
      }

      sql += ' ORDER BY e.layer, e.element_type, e.name';

      const result = await query(sql, params);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching EA elements:', err);
      return res.status(500).json({ error: 'Failed to fetch EA elements' });
    }
  }

  if (req.method === 'POST') {
    const { elementType, layer, name, description, properties, parentId, domainName, userId } = req.body;

    if (!elementType || !layer || !name) {
      return res.status(400).json({ error: 'elementType, layer, and name are required' });
    }

    try {
      // Get domain ID
      let domainId = null;
      if (domainName) {
        const domainResult = await query('SELECT id FROM domains WHERE name = $1', [domainName]);
        if (domainResult.rows.length > 0) {
          domainId = domainResult.rows[0].id;
        }
      }

      const result = await query(
        `INSERT INTO ea_elements (domain_id, element_type, layer, name, description, properties, parent_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [domainId, elementType, layer, name, description || null, properties ? JSON.stringify(properties) : '{}', parentId || null, userId || null]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating EA element:', err);
      return res.status(500).json({ error: 'Failed to create EA element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
