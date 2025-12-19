// pages/api/cross-studio/search.js
// Cross-studio search API - searches artefacts across all studios

import { getUserFromRequest } from '../../../lib/projectAccess';
import { query } from '../../../lib/db/postgres';

// Define searchable studios and their artefact types
const STUDIO_CONFIGS = {
  ea: {
    name: 'EA Studio',
    icon: 'Architecture',
    types: [
      { type: 'archimate_element', label: 'ArchiMate Element' },
      { type: 'ea_capability', label: 'Capability' },
      { type: 'ea_process', label: 'Business Process' },
      { type: 'ea_application', label: 'Application' },
    ],
  },
  requirements: {
    name: 'Requirements Studio',
    icon: 'Assignment',
    types: [
      { type: 'requirement', label: 'Requirement' },
      { type: 'user_story', label: 'User Story' },
      { type: 'use_case', label: 'Use Case' },
    ],
  },
  portfolio: {
    name: 'Portfolio Studio',
    icon: 'Dashboard',
    types: [
      { type: 'portfolio_initiative', label: 'Initiative' },
      { type: 'portfolio_epic', label: 'Epic' },
      { type: 'portfolio_project', label: 'Project' },
    ],
  },
  knowledge: {
    name: 'Knowledge Graph',
    icon: 'Hub',
    types: [
      { type: 'concept', label: 'Concept' },
      { type: 'node', label: 'Node' },
    ],
  },
  dwd: {
    name: 'Dynamic Work Design',
    icon: 'Psychology',
    types: [
      { type: 'dwd_case', label: 'Work Situation' },
      { type: 'dwd_work_item', label: 'Work Item' },
      { type: 'dwd_actor', label: 'Actor' },
      { type: 'dwd_adjustment', label: 'Adjustment' },
    ],
  },
};

// Get all searchable types
function getAllSearchableTypes() {
  const types = [];
  Object.entries(STUDIO_CONFIGS).forEach(([studioId, config]) => {
    config.types.forEach(t => {
      types.push({
        ...t,
        studioId,
        studioName: config.name,
        studioIcon: config.icon,
      });
    });
  });
  return types;
}

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, studios, types, projectId, limit = 50 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Build filter for types
    let typeFilter = [];
    if (types) {
      typeFilter = types.split(',');
    } else if (studios) {
      // Get all types for specified studios
      const studioList = studios.split(',');
      studioList.forEach(studioId => {
        const config = STUDIO_CONFIGS[studioId];
        if (config) {
          typeFilter.push(...config.types.map(t => t.type));
        }
      });
    }

    // Build the SQL query
    let sql = `
      SELECT
        a.id,
        a.name,
        a.description,
        a.artefact_type,
        a.status,
        a.project_id,
        p.name as project_name,
        a.created_at,
        a.updated_at
      FROM artefacts a
      LEFT JOIN projects p ON p.id = a.project_id
      WHERE (a.name ILIKE $1 OR a.description ILIKE $1)
    `;
    const params = [`%${q}%`];
    let paramIndex = 2;

    // Add type filter
    if (typeFilter.length > 0) {
      sql += ` AND a.artefact_type = ANY($${paramIndex})`;
      params.push(typeFilter);
      paramIndex++;
    }

    // Add project filter
    if (projectId) {
      sql += ` AND a.project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }

    sql += ` ORDER BY
      CASE WHEN a.name ILIKE $1 THEN 0 ELSE 1 END,
      a.updated_at DESC
      LIMIT $${paramIndex}`;
    params.push(parseInt(limit, 10));

    const result = await query(sql, params);

    // Group results by studio
    const searchableTypes = getAllSearchableTypes();
    const results = result.rows.map(row => {
      const typeInfo = searchableTypes.find(t => t.type === row.artefact_type);
      return {
        ...row,
        studioId: typeInfo?.studioId || 'other',
        studioName: typeInfo?.studioName || 'Other',
        studioIcon: typeInfo?.studioIcon || 'Folder',
        typeLabel: typeInfo?.label || row.artefact_type,
      };
    });

    // Group by studio for display
    const groupedResults = {};
    results.forEach(item => {
      if (!groupedResults[item.studioId]) {
        groupedResults[item.studioId] = {
          studioId: item.studioId,
          studioName: item.studioName,
          studioIcon: item.studioIcon,
          items: [],
        };
      }
      groupedResults[item.studioId].items.push(item);
    });

    return res.status(200).json({
      query: q,
      total: results.length,
      results,
      grouped: Object.values(groupedResults),
      studios: STUDIO_CONFIGS,
    });
  } catch (err) {
    console.error('Cross-studio search error:', err);
    return res.status(500).json({ error: 'Search failed' });
  }
}
