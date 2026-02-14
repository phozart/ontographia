// lib/services/EAIntegrationConstants.js
// Shared constants for EA aggregation across spaces (client-safe).

/**
 * Space codes and their artefact type prefixes
 */
export const AGGREGATION_SOURCES = Object.freeze({
  CAP: {
    code: 'CAP',
    name: 'Capability Studio',
    prefix: 'cap_',
    eaLayer: 'Business',
    description: 'Capabilities, value streams, operating models',
  },
  BA: {
    code: 'BA',
    name: 'Requirements Studio',
    prefix: 'ba_',
    eaLayer: 'Application',
    description: 'Requirements, use cases, business rules',
  },
  PORTFOLIO: {
    code: 'PORTFOLIO',
    name: 'Portfolio Studio',
    prefix: 'portfolio_',
    eaLayer: 'Implementation',
    description: 'Investment themes, initiatives, portfolio decisions',
  },
  PDS: {
    code: 'PDS',
    name: 'Project Design Studio',
    prefix: 'pds_',
    eaLayer: 'Implementation',
    description: 'Projects, milestones, deliverables',
  },
  PERF: {
    code: 'PERF',
    name: 'Performance Studio',
    prefix: 'perf_',
    eaLayer: 'Strategy',
    description: 'OKRs, KPIs, metrics',
  },
});

/**
 * Mapping of source artefact types to EA element types
 */
export const TYPE_MAPPINGS = Object.freeze({
  // CAP -> EA Business Layer
  cap_capability: { eaType: 'Capability', eaLayer: 'Strategy' },
  cap_value_stream: { eaType: 'ValueStream', eaLayer: 'Strategy' },
  cap_assessment: { eaType: 'Assessment', eaLayer: 'Motivation' },

  // BA -> EA Application Layer
  ba_requirement: { eaType: 'Requirement', eaLayer: 'Application' },
  ba_use_case: { eaType: 'ApplicationComponent', eaLayer: 'Application' },
  ba_business_rule: { eaType: 'BusinessRule', eaLayer: 'Business' },

  // Portfolio -> EA Implementation Layer
  portfolio_initiative: { eaType: 'WorkPackage', eaLayer: 'Implementation' },
  portfolio_dependency: { eaType: 'Plateau', eaLayer: 'Implementation' },
  portfolio_strategy: { eaType: 'Goal', eaLayer: 'Strategy' },
  portfolio_decision: { eaType: 'Assessment', eaLayer: 'Motivation' },

  // PDS -> EA Implementation Layer
  pds_project: { eaType: 'WorkPackage', eaLayer: 'Implementation' },
  pds_milestone: { eaType: 'Deliverable', eaLayer: 'Implementation' },
  pds_dependency: { eaType: 'Plateau', eaLayer: 'Implementation' },
  pds_decision: { eaType: 'Assessment', eaLayer: 'Motivation' },

  // PERF -> EA Strategy/Motivation Layer
  perf_okr: { eaType: 'Goal', eaLayer: 'Strategy' },
  perf_metric: { eaType: 'Outcome', eaLayer: 'Strategy' },
  perf_risk: { eaType: 'Risk', eaLayer: 'Motivation' },
});
