// lib/events/kgMappings.js
// Maps studio artefact types to knowledge graph node types and determines
// how outbox events should be projected into the kg_nodes / kg_edges tables.

/**
 * Map artefact types to graph node type IDs.
 * The node type must exist in graph_node_types before sync can work.
 * If no mapping exists, the artefact type string is used as-is.
 */
export const ARTEFACT_TYPE_TO_NODE_TYPE = {
  // Blueprint
  Initiative: 'Initiative',
  Opportunity: 'Opportunity',
  // Analysis
  Requirement: 'Requirement',
  UserStory: 'UserStory',
  UseCase: 'UseCase',
  ArchitectureDecision: 'ArchitectureDecision',
  Persona: 'Persona',
  // Enterprise
  Capability: 'Capability',
  Application: 'Application',
  Technology: 'Technology',
  BusinessProcess: 'BusinessProcess',
  // PDS
  WorkPackage: 'WorkPackage',
  Milestone: 'Milestone',
  Risk: 'Risk',
  // GTM
  Campaign: 'Campaign',
  LaunchPlan: 'LaunchPlan',
  // Generic
  Ticket: 'Ticket',
  Document: 'Document',
};

/**
 * Build a graph node from an artefact event.
 * Returns the data shape needed for INSERT INTO graph_nodes.
 */
export function artefactToGraphNode(artefact) {
  const nodeTypeId = ARTEFACT_TYPE_TO_NODE_TYPE[artefact.artefact_type] || artefact.artefact_type;

  return {
    id: `artefact_${artefact.id}`,
    type_id: nodeTypeId,
    name: artefact.name,
    description: artefact.description || '',
    domain: artefact.domain_id || null,
    attributes: {
      source: 'artefact',
      artefact_id: artefact.id,
      artefact_type: artefact.artefact_type,
      status: artefact.status,
      priority: artefact.priority,
      project_id: artefact.project_id,
    },
  };
}

/**
 * Build a graph node from an EA element event.
 */
export function eaElementToGraphNode(element) {
  return {
    id: `ea_${element.id}`,
    type_id: element.element_type || 'EAElement',
    name: element.name,
    description: element.description || '',
    domain: element.domain_id || null,
    layer: element.layer || null,
    attributes: {
      source: 'ea_element',
      ea_id: element.id,
      element_type: element.element_type,
      archimate_layer: element.layer,
    },
  };
}

/**
 * Build a graph edge from an artefact relationship event.
 */
export function artefactRelationshipToGraphEdge(rel) {
  return {
    id: `arel_${rel.id}`,
    source_id: `artefact_${rel.from_artefact_id}`,
    target_id: `artefact_${rel.to_artefact_id}`,
    type_id: rel.relationship_type || 'related_to',
    name: rel.relationship_type,
    domain: rel.domain_id || null,
    properties: {
      source: 'artefact_relationship',
      relationship_id: rel.id,
    },
  };
}
