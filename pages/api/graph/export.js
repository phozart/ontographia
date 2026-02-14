// pages/api/graph/export.js
// Graph Export API — JSON-LD, GraphRAG-compatible, and Jira export formats
//
// GET /api/graph/export?format=jsonld&domain_id=xxx — Full graph in JSON-LD
// GET /api/graph/export?format=graphrag&domain_id=xxx — GraphRAG-compatible
// GET /api/graph/export?format=jira&project_id=xxx — Jira-compatible WBS export

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';

const SUPPORTED_FORMATS = ['jsonld', 'graphrag', 'jira'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { format, domain_id, project_id } = req.query;

  if (!format || !SUPPORTED_FORMATS.includes(format)) {
    return res.status(400).json({
      error: `Format required. Supported: ${SUPPORTED_FORMATS.join(', ')}`,
    });
  }

  try {
    switch (format) {
      case 'jsonld':
        return handleJsonLd(req, res, domain_id);
      case 'graphrag':
        return handleGraphRag(req, res, domain_id);
      case 'jira':
        return handleJiraExport(req, res, project_id, domain_id);
      default:
        return res.status(400).json({ error: 'Unknown format' });
    }
  } catch (error) {
    return errorResponse(res, 500, 'Failed to export graph', error);
  }
}

/**
 * JSON-LD export — semantic web format for the knowledge graph.
 */
async function handleJsonLd(req, res, domainId) {
  const nodes = await getNodes(domainId);
  const edges = await getEdges(domainId);

  const jsonLd = {
    '@context': {
      '@vocab': 'https://ontographia.io/schema/',
      name: 'https://schema.org/name',
      description: 'https://schema.org/description',
      type: '@type',
      domain: 'https://ontographia.io/schema/domain',
      pipelineStage: 'https://ontographia.io/schema/pipelineStage',
      source: 'https://ontographia.io/schema/sourceNode',
      target: 'https://ontographia.io/schema/targetNode',
      relationType: 'https://ontographia.io/schema/relationType',
    },
    '@graph': [
      ...nodes.map(n => ({
        '@id': `urn:ontographia:node:${n.id}`,
        '@type': n.type_id || 'Node',
        name: n.name,
        description: n.description || '',
        domain: n.domain,
        pipelineStage: n.attributes?.pipeline_stage || null,
        ...(n.attributes || {}),
      })),
      ...edges.map(e => ({
        '@id': `urn:ontographia:edge:${e.id}`,
        '@type': 'Relationship',
        relationType: e.type_id || e.name,
        source: `urn:ontographia:node:${e.source_id}`,
        target: `urn:ontographia:node:${e.target_id}`,
        ...(e.properties || {}),
      })),
    ],
  };

  res.setHeader('Content-Type', 'application/ld+json');
  return res.status(200).json(jsonLd);
}

/**
 * GraphRAG-compatible export — nodes, edges, and community summaries.
 */
async function handleGraphRag(req, res, domainId) {
  const nodes = await getNodes(domainId);
  const edges = await getEdges(domainId);

  // Build community structure by type
  const communities = {};
  for (const node of nodes) {
    const type = node.type_id || 'other';
    if (!communities[type]) {
      communities[type] = {
        id: type,
        title: type,
        nodes: [],
        summary: '',
      };
    }
    communities[type].nodes.push(node.id);
  }

  // Generate community summaries
  for (const [type, community] of Object.entries(communities)) {
    const nodeNames = nodes
      .filter(n => (n.type_id || 'other') === type)
      .map(n => n.name)
      .slice(0, 20);
    community.summary = `${type} community with ${community.nodes.length} entities: ${nodeNames.join(', ')}${community.nodes.length > 20 ? '...' : ''}`;
  }

  return res.status(200).json({
    format: 'graphrag',
    version: '1.0',
    entities: nodes.map(n => ({
      id: n.id,
      name: n.name,
      type: n.type_id,
      description: n.description || '',
      attributes: n.attributes || {},
    })),
    relationships: edges.map(e => ({
      id: e.id,
      source: e.source_id,
      target: e.target_id,
      type: e.type_id || e.name,
      weight: e.weight || 1,
      properties: e.properties || {},
    })),
    communities: Object.values(communities),
    stats: {
      entityCount: nodes.length,
      relationshipCount: edges.length,
      communityCount: Object.keys(communities).length,
    },
  });
}

/**
 * Jira export — work breakdown items formatted for Jira import.
 * Preserves Epic → Feature → Story hierarchy.
 */
async function handleJiraExport(req, res, projectId, domainId) {
  if (!projectId && !domainId) {
    return res.status(400).json({ error: 'project_id or domain_id required for Jira export' });
  }

  // Fetch work breakdown artefacts
  const WBS_TYPES = ['Epic', 'Feature', 'UserStory'];
  let sql = 'SELECT * FROM analysis_artefacts WHERE artefact_type = ANY($1::text[])';
  const params = [WBS_TYPES];
  let paramIdx = 2;

  if (projectId) {
    sql += ` AND project_id = $${paramIdx}`;
    params.push(projectId);
    paramIdx++;
  }
  if (domainId) {
    sql += ` AND domain_id = $${paramIdx}`;
    params.push(domainId);
    paramIdx++;
  }

  sql += ' ORDER BY artefact_type, number';
  const artefactResult = await query(sql, params);
  const artefacts = artefactResult.rows;
  const artefactIds = artefacts.map(a => a.id);

  // Fetch hierarchy relationships
  let relationships = [];
  if (artefactIds.length > 0) {
    const relResult = await query(`
      SELECT from_artefact_id, to_artefact_id, relationship_type
      FROM analysis_relationships
      WHERE relationship_type = 'contains'
        AND from_artefact_id = ANY($1::uuid[])
        AND to_artefact_id = ANY($1::uuid[])
    `, [artefactIds]);
    relationships = relResult.rows;
  }

  // Build parent map
  const parentMap = {};
  for (const rel of relationships) {
    parentMap[rel.to_artefact_id] = rel.from_artefact_id;
  }

  // Map to Jira format
  const STATUS_MAP = {
    Draft: 'To Do',
    InReview: 'In Progress',
    Approved: 'Done',
    InProgress: 'In Progress',
    Blocked: 'Blocked',
  };

  const PRIORITY_MAP = {
    Critical: 'Highest',
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
  };

  const TYPE_MAP = {
    Epic: 'Epic',
    Feature: 'Story', // Jira uses Story for features
    UserStory: 'Story',
  };

  const jiraIssues = artefacts.map(a => {
    const parentId = parentMap[a.id];
    const parent = parentId ? artefacts.find(p => p.id === parentId) : null;
    const meta = a.metadata || {};

    // Build Jira description
    let description = a.description || '';
    if (meta.acceptance_criteria) {
      description += `\n\n*Acceptance Criteria:*\n${meta.acceptance_criteria}`;
    }
    if (meta.business_value) {
      description += `\n\n*Business Value:*\n${meta.business_value}`;
    }
    description += `\n\n---\n_Exported from Ontographia: ${a.display_id || `${a.prefix}-${String(a.number).padStart(3, '0')}`}_`;

    return {
      // Jira fields
      summary: `[${a.display_id || `${a.prefix}-${String(a.number).padStart(3, '0')}`}] ${a.name}`,
      description,
      issuetype: TYPE_MAP[a.artefact_type] || 'Task',
      priority: PRIORITY_MAP[meta.priority || a.priority || 'Medium'] || 'Medium',
      status: STATUS_MAP[a.status] || 'To Do',
      labels: [
        'ontographia-export',
        a.artefact_type.toLowerCase(),
      ],
      storyPoints: meta.story_points || meta.estimated_story_points || null,

      // Hierarchy
      epicLink: a.artefact_type !== 'Epic' && parent?.artefact_type === 'Epic'
        ? `[${parent.display_id || parent.prefix + '-' + String(parent.number).padStart(3, '0')}] ${parent.name}`
        : null,
      parentKey: parent
        ? (parent.metadata?.jira_key || null)
        : null,

      // Ontographia metadata for round-trip
      _ontographia: {
        id: a.id,
        display_id: a.display_id || `${a.prefix}-${String(a.number).padStart(3, '0')}`,
        artefact_type: a.artefact_type,
        project_id: a.project_id,
      },
    };
  });

  return res.status(200).json({
    format: 'jira',
    version: '1.0',
    exportDate: new Date().toISOString(),
    issues: jiraIssues,
    hierarchy: relationships.map(r => ({
      parent: r.from_artefact_id,
      child: r.to_artefact_id,
    })),
    stats: {
      epics: artefacts.filter(a => a.artefact_type === 'Epic').length,
      features: artefacts.filter(a => a.artefact_type === 'Feature').length,
      stories: artefacts.filter(a => a.artefact_type === 'UserStory').length,
    },
  });
}

// Helpers
async function getNodes(domainId) {
  if (domainId) {
    const result = await query('SELECT * FROM graph_nodes WHERE domain = $1 ORDER BY type_id, name LIMIT 2000', [domainId]);
    return result.rows;
  }
  const result = await query('SELECT * FROM graph_nodes ORDER BY type_id, name LIMIT 2000');
  return result.rows;
}

async function getEdges(domainId) {
  if (domainId) {
    const result = await query('SELECT * FROM graph_relationships WHERE domain = $1 LIMIT 5000', [domainId]);
    return result.rows;
  }
  const result = await query('SELECT * FROM graph_relationships LIMIT 5000');
  return result.rows;
}
