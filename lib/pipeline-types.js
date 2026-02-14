// lib/pipeline-types.js
// Pipeline stage definitions and artefact-to-stage mapping.
// Central source of truth for the pipeline-first architecture.

/**
 * Pipeline stages in order.
 * Each artefact belongs to exactly one stage.
 */
export const PIPELINE_STAGES = {
  discovery: {
    id: 'discovery',
    name: 'Discovery',
    description: 'Experiments, ideas, and business cases',
    order: 1,
    color: '#C9A227',
    icon: 'Lightbulb',
  },
  analysis: {
    id: 'analysis',
    name: 'Analysis',
    description: 'Requirements, processes, data, and stakeholders',
    order: 2,
    color: '#0284c7',
    icon: 'Assignment',
  },
  architecture: {
    id: 'architecture',
    name: 'Architecture',
    description: 'System design, data products, capabilities',
    order: 3,
    color: '#6366f1',
    icon: 'Architecture',
  },
  delivery: {
    id: 'delivery',
    name: 'Delivery',
    description: 'Work breakdown, test management, deployment',
    order: 4,
    color: '#0d9488',
    icon: 'AccountTree',
  },
};

/**
 * Ordered array of pipeline stages.
 */
export const PIPELINE_STAGES_ORDERED = Object.values(PIPELINE_STAGES)
  .sort((a, b) => a.order - b.order);

/**
 * Maps artefact_type → pipeline_stage.
 * This is the canonical mapping from the spec (Section 5).
 */
export const ARTEFACT_TYPE_TO_STAGE = {
  // Discovery (Section 5.2)
  experiment: 'discovery',
  idea: 'discovery',
  business_case: 'discovery',
  Experiment: 'discovery',
  Idea: 'discovery',
  BusinessCase: 'discovery',

  // Analysis (Section 5.3)
  process_map: 'analysis',
  raci: 'analysis',
  data_flow: 'analysis',
  requirement: 'analysis',
  domain_model: 'analysis',
  glossary_entry: 'analysis',
  user_journey: 'analysis',
  stakeholder_map: 'analysis',
  ProcessMap: 'analysis',
  RACI: 'analysis',
  DataFlow: 'analysis',
  BusinessRequirement: 'analysis',
  StakeholderRequirement: 'analysis',
  SolutionRequirement: 'analysis',
  NonFunctionalRequirement: 'analysis',
  BusinessRule: 'analysis',
  UseCase: 'analysis',
  DomainModel: 'analysis',
  GlossaryEntry: 'analysis',
  UserJourney: 'analysis',
  StakeholderMap: 'analysis',
  Persona: 'analysis',

  // Architecture (Section 5.4)
  c4_model: 'architecture',
  adr: 'architecture',
  data_product: 'architecture',
  data_contract: 'architecture',
  capability_map: 'architecture',
  technology_radar: 'architecture',
  ADR: 'architecture',
  Component: 'architecture',
  C4Model: 'architecture',
  DataProduct: 'architecture',
  DataContract: 'architecture',
  CapabilityMap: 'architecture',
  TechnologyRadar: 'architecture',
  QualityAttribute: 'architecture',
  DataEntity: 'architecture',
  DataLineage: 'architecture',

  // Work Breakdown (Section 6) — spans analysis→delivery
  epic: 'analysis',
  feature: 'analysis',
  user_story: 'analysis',
  Epic: 'analysis',
  Feature: 'analysis',
  UserStory: 'analysis',

  // Test Management (Section 7) — delivery stage
  test_case: 'delivery',
  test_suite: 'delivery',
  test_run: 'delivery',
  TestCase: 'delivery',
  TestSuite: 'delivery',
  TestRun: 'delivery',

  // Design (UX/UI) — analysis stage
  Wireframe: 'analysis',
  Prototype: 'analysis',
  DesignSystem: 'analysis',
  ResearchInsight: 'analysis',
  ServiceBlueprint: 'analysis',
};

/**
 * Artefact types grouped by pipeline stage.
 */
export const ARTEFACT_TYPES_BY_STAGE = {};
for (const [type, stage] of Object.entries(ARTEFACT_TYPE_TO_STAGE)) {
  if (!ARTEFACT_TYPES_BY_STAGE[stage]) ARTEFACT_TYPES_BY_STAGE[stage] = [];
  ARTEFACT_TYPES_BY_STAGE[stage].push(type);
}

/**
 * Display ID prefixes for auto-incrementing types.
 */
export const DISPLAY_ID_PREFIXES = {
  requirement: 'REQ',
  epic: 'EPIC',
  feature: 'FEAT',
  user_story: 'US',
  test_case: 'TC',
  test_suite: 'TS',
  test_run: 'TR',
};

/**
 * Get the pipeline stage for an artefact type.
 * Returns null if the type is not in the mapping (e.g. legacy types).
 *
 * @param {string} artefactType
 * @returns {string|null}
 */
export function getPipelineStage(artefactType) {
  return ARTEFACT_TYPE_TO_STAGE[artefactType] || null;
}

/**
 * Get all artefact types for a given pipeline stage.
 *
 * @param {string} stage
 * @returns {string[]}
 */
export function getArtefactTypesForStage(stage) {
  return ARTEFACT_TYPES_BY_STAGE[stage] || [];
}
