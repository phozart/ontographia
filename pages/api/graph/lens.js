// pages/api/graph/lens.js
// Lens Views API — Stakeholder-appropriate views over the knowledge graph
//
// GET /api/graph/lens?type=ea&domain_id=xxx — EA lens
// GET /api/graph/lens?type=solution&domain_id=xxx&project_id=xxx — Solution lens
// GET /api/graph/lens?type=data&domain_id=xxx — Data lens
// GET /api/graph/lens?type=stakeholder&domain_id=xxx — Stakeholder lens

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';

/**
 * Lens definitions — each lens specifies which node types, relationship types,
 * and aggregate queries to use.
 */
const LENS_DEFINITIONS = {
  ea: {
    name: 'Enterprise Architecture',
    description: 'Capabilities, applications, technology landscape, value streams',
    nodeTypes: ['Capability', 'CapabilityMap', 'Application', 'Technology', 'TechnologyRadar', 'BusinessProcess', 'System'],
    relTypes: ['supports', 'uses', 'implements', 'enables', 'DEPENDS_ON', 'CHILD_OF'],
    // Also include artefact types from EA spaces
    artefactTypes: ['ent_capability', 'ent_application', 'ent_technology', 'ent_org_unit', 'ent_role', 'ent_kpi', 'ent_risk', 'ent_product', 'ent_service'],
    aggregates: ['capability_health', 'technology_lifecycle', 'app_portfolio'],
  },
  solution: {
    name: 'Solution Architecture',
    description: 'C4 models, integrations, ADRs, components',
    nodeTypes: ['C4Model', 'Component', 'System', 'ArchitectureDecision', 'QualityAttribute', 'IntegrationPattern'],
    relTypes: ['DEPENDS_ON', 'affects', 'selects', 'addresses', 'connects_via', 'deployed_on'],
    artefactTypes: [],
    aggregates: ['adr_status', 'component_health'],
  },
  data: {
    name: 'Data Architecture',
    description: 'Data products, contracts, domains, lineage',
    nodeTypes: ['DataProduct', 'DataContract', 'DataEntity', 'DataLineage', 'DomainModel', 'GlossaryEntry'],
    relTypes: ['consumes', 'produces', 'SENDS_DATA_TO', 'uses_data', 'participates_in'],
    artefactTypes: ['ent_data_product', 'ent_data_contract', 'ent_data_domain'],
    aggregates: ['data_product_health', 'contract_coverage'],
  },
  stakeholder: {
    name: 'Stakeholder',
    description: 'Portfolio status, initiative health, stakeholder map',
    nodeTypes: ['Stakeholder', 'StakeholderMap', 'Actor', 'Persona', 'blueprint_initiative', 'analysis_project'],
    relTypes: ['RESPONSIBLE_FOR', 'ACCOUNTABLE_FOR', 'CONSULTED_ON', 'INFORMED_OF', 'involves'],
    artefactTypes: [],
    aggregates: ['initiative_status', 'stakeholder_coverage'],
  },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { type, domain_id, project_id, include_artefacts } = req.query;

  if (!type || !LENS_DEFINITIONS[type]) {
    return res.status(400).json({
      error: `Invalid lens type. Available: ${Object.keys(LENS_DEFINITIONS).join(', ')}`,
      available: Object.entries(LENS_DEFINITIONS).map(([id, def]) => ({
        id,
        name: def.name,
        description: def.description,
      })),
    });
  }

  const lens = LENS_DEFINITIONS[type];

  try {
    // 1. Fetch graph nodes matching the lens node types
    let nodeSql = 'SELECT * FROM graph_nodes WHERE type_id = ANY($1::text[])';
    const nodeParams = [lens.nodeTypes];
    let paramIdx = 2;

    if (domain_id) {
      nodeSql += ` AND domain = $${paramIdx}`;
      nodeParams.push(domain_id);
      paramIdx++;
    }

    nodeSql += ' ORDER BY type_id, name LIMIT 500';
    const nodesResult = await query(nodeSql, nodeParams);
    const nodes = nodesResult.rows;
    const nodeIds = nodes.map(n => n.id);

    // 2. Fetch relationships between these nodes
    let edges = [];
    if (nodeIds.length > 0) {
      const edgeSql = lens.relTypes.length > 0
        ? `SELECT * FROM graph_relationships
           WHERE (source_id = ANY($1::text[]) OR target_id = ANY($1::text[]))
             AND (type_id = ANY($2::text[]) OR name = ANY($2::text[]))
           LIMIT 1000`
        : `SELECT * FROM graph_relationships
           WHERE source_id = ANY($1::text[]) AND target_id = ANY($1::text[])
           LIMIT 1000`;

      const edgeParams = lens.relTypes.length > 0 ? [nodeIds, lens.relTypes] : [nodeIds];
      const edgesResult = await query(edgeSql, edgeParams);
      edges = edgesResult.rows;
    }

    // 3. Optionally include artefacts from the artefacts table
    let artefacts = [];
    if (include_artefacts === 'true' && lens.artefactTypes.length > 0) {
      let artSql = 'SELECT id, name, artefact_type, status, priority, custom_fields, domain_id, pipeline_stage FROM artefacts WHERE artefact_type = ANY($1::text[])';
      const artParams = [lens.artefactTypes];
      let artParamIdx = 2;

      if (domain_id) {
        artSql += ` AND domain_id = $${artParamIdx}`;
        artParams.push(domain_id);
        artParamIdx++;
      }

      artSql += ' ORDER BY updated_at DESC LIMIT 200';
      const artResult = await query(artSql, artParams);
      artefacts = artResult.rows;
    }

    // 4. Compute aggregates based on lens type
    const aggregates = await computeAggregates(type, nodes, edges, artefacts, domain_id, project_id);

    // 5. Build type distribution
    const typeCounts = {};
    for (const node of nodes) {
      const t = node.type_id || 'unknown';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }

    return res.status(200).json({
      lens: {
        type,
        name: lens.name,
        description: lens.description,
      },
      nodes,
      edges,
      artefacts,
      aggregates,
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        artefactCount: artefacts.length,
        typeCounts,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to compute lens view', error);
  }
}

/**
 * Compute lens-specific aggregates.
 */
async function computeAggregates(lensType, nodes, edges, artefacts, domainId, projectId) {
  const aggregates = {};

  switch (lensType) {
    case 'ea': {
      // Capability health: count apps per capability
      const capabilities = nodes.filter(n => n.type_id === 'Capability' || n.type_id === 'CapabilityMap');
      const apps = nodes.filter(n => n.type_id === 'Application' || n.type_id === 'System');
      aggregates.capabilityCount = capabilities.length;
      aggregates.applicationCount = apps.length;
      aggregates.technologyCount = nodes.filter(n => n.type_id === 'Technology' || n.type_id === 'TechnologyRadar').length;

      // Technology lifecycle from artefacts
      if (artefacts.length > 0) {
        const techArtefacts = artefacts.filter(a => a.artefact_type === 'ent_technology');
        const lifecycleCounts = { active: 0, sunset: 0, emerging: 0, deprecated: 0 };
        for (const tech of techArtefacts) {
          const lifecycle = tech.custom_fields?.lifecycle || tech.custom_fields?.status || 'active';
          const key = lifecycle.toLowerCase();
          if (lifecycleCounts[key] !== undefined) lifecycleCounts[key]++;
          else lifecycleCounts.active++;
        }
        aggregates.technologyLifecycle = lifecycleCounts;
      }
      break;
    }

    case 'solution': {
      // ADR status distribution
      const adrs = nodes.filter(n => n.type_id === 'ArchitectureDecision');
      const adrStatuses = { Proposed: 0, Accepted: 0, Deprecated: 0, Superseded: 0 };
      for (const adr of adrs) {
        const status = adr.attributes?.adr_status || adr.attributes?.status || 'Proposed';
        if (adrStatuses[status] !== undefined) adrStatuses[status]++;
      }
      aggregates.adrStatuses = adrStatuses;
      aggregates.componentCount = nodes.filter(n => n.type_id === 'Component').length;
      aggregates.integrationCount = edges.filter(e => e.type_id === 'DEPENDS_ON' || e.type_id === 'connects_via').length;
      break;
    }

    case 'data': {
      aggregates.dataProductCount = nodes.filter(n => n.type_id === 'DataProduct').length;
      aggregates.dataContractCount = nodes.filter(n => n.type_id === 'DataContract').length;
      aggregates.dataEntityCount = nodes.filter(n => n.type_id === 'DataEntity' || n.type_id === 'DomainModel').length;
      aggregates.dataFlowCount = edges.filter(e => e.type_id === 'SENDS_DATA_TO' || e.type_id === 'consumes' || e.type_id === 'produces').length;
      break;
    }

    case 'stakeholder': {
      aggregates.stakeholderCount = nodes.filter(n => ['Stakeholder', 'StakeholderMap', 'Actor', 'Persona'].includes(n.type_id)).length;
      aggregates.initiativeCount = nodes.filter(n => n.type_id === 'blueprint_initiative').length;
      aggregates.projectCount = nodes.filter(n => n.type_id === 'analysis_project').length;

      // RACI coverage
      const raciEdgeTypes = ['RESPONSIBLE_FOR', 'ACCOUNTABLE_FOR', 'CONSULTED_ON', 'INFORMED_OF'];
      const raciEdges = edges.filter(e => raciEdgeTypes.includes(e.type_id));
      aggregates.raciAssignments = raciEdges.length;
      aggregates.raciCoverage = {
        R: raciEdges.filter(e => e.type_id === 'RESPONSIBLE_FOR').length,
        A: raciEdges.filter(e => e.type_id === 'ACCOUNTABLE_FOR').length,
        C: raciEdges.filter(e => e.type_id === 'CONSULTED_ON').length,
        I: raciEdges.filter(e => e.type_id === 'INFORMED_OF').length,
      };
      break;
    }
  }

  return aggregates;
}
