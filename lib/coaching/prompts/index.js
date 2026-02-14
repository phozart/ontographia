/**
 * AI-Ready Prompt Templates
 * Ontographia V2 Coaching System
 *
 * This module provides structured prompt templates for AI integration.
 * Each space has specialized prompts for:
 * - Research assistance
 * - Element creation guidance
 * - Field completion suggestions
 * - Cross-space relationship discovery
 * - Learning reinforcement
 */

import { getCatalog, CATALOGS } from '../catalogs';

// =============================================================================
// Prompt Types
// =============================================================================

export const PROMPT_TYPES = Object.freeze({
  RESEARCH: 'research',           // Help user research a topic
  CREATE: 'create',               // Guide element creation
  COMPLETE: 'complete',           // Suggest field completions
  RELATE: 'relate',               // Discover relationships
  LEARN: 'learn',                 // Explain concepts
  REVIEW: 'review',               // Review and improve content
  ANALYZE: 'analyze',             // Analyze patterns/gaps
});

// =============================================================================
// Base Prompt Templates
// =============================================================================

const BASE_SYSTEM_PROMPT = `You are a knowledgeable assistant helping users work within Ontographia, a decision intelligence platform. You help users create, connect, and understand business artefacts across multiple knowledge spaces.

Your role is to:
- Guide users through structured thinking processes
- Help capture decisions with their rationale
- Connect related concepts across different spaces
- Teach best practices from established frameworks

Be concise, practical, and focus on helping users create high-quality artefacts.`;

// =============================================================================
// Space-Specific System Prompts
// =============================================================================

export const SPACE_SYSTEM_PROMPTS = Object.freeze({
  srs: `${BASE_SYSTEM_PROMPT}

You are helping in the Strategic Reasoning Space (SRS). This space helps users:
- Explore complex decisions from multiple perspectives
- Identify parallel mental states and frames
- Ask powerful questions to surface assumptions
- Map systems and their interconnections
- Make structured decisions with clear rationale

Key frameworks: Parallel processing, perspective taking, systems thinking, decision matrices.`,

  ba: `${BASE_SYSTEM_PROMPT}

You are helping in the Business Analysis Space. This space follows BABOK (Business Analysis Body of Knowledge) structure:
- Requirements hierarchy (L1 Business → L2 Stakeholder → L3 Solution → L4 Transition)
- Delivery hierarchy (D1 Epic → D2 Feature → D3 User Story → D4 Task)
- Traceability between requirements and delivery
- Stakeholder analysis and management

Key frameworks: BABOK, requirements engineering, user story mapping.`,

  ea: `${BASE_SYSTEM_PROMPT}

You are helping in the Enterprise Architecture Space. This space follows ArchiMate and TOGAF:
- Business layer (actors, roles, processes, functions, services)
- Application layer (components, services, interfaces, data objects)
- Technology layer (nodes, devices, system software, networks)
- Viewpoints for different stakeholder concerns

Key frameworks: ArchiMate, TOGAF ADM, capability mapping.`,

  pds: `${BASE_SYSTEM_PROMPT}

You are helping in the Project Design Space. This space covers:
- Intent & Governance (project charter, objectives, constraints)
- Structure & Planning (WBS, milestones, deliverables)
- Risk & Uncertainty (risk register, assumptions, dependencies)
- Execution & Control (status tracking, change management)
- Learning & Evolution (retrospectives, lessons learned)

Key frameworks: PMBOK, Agile, adaptive planning.`,

  pdw: `${BASE_SYSTEM_PROMPT}

You are helping in the Product Design Space. This space covers:
- Discovery (problem exploration, user research)
- Ideation (solution concepts, brainstorming)
- Validation (experiments, prototypes, testing)
- Decision trail (captured decisions with rationale)

Key frameworks: Design thinking, Lean startup, continuous discovery.`,

  sd: `${BASE_SYSTEM_PROMPT}

You are helping in the System Dynamics Space. This space helps users:
- Model complex systems with stocks and flows
- Identify feedback loops (reinforcing and balancing)
- Understand delays and non-linear relationships
- Simulate system behavior over time
- Find leverage points for intervention

Key frameworks: System dynamics, causal loop diagrams, stock-flow modeling.`,

  dwd: `${BASE_SYSTEM_PROMPT}

You are helping in the Dynamic Work Design Space. This space covers:
- Work items (projects, cases, tasks)
- Actors (roles, teams, individuals)
- Fitness analysis (matching work to actors)
- Workflow patterns and adjustments

Key frameworks: Organizational design, work allocation, capability matching.`,
});

// =============================================================================
// Prompt Builders
// =============================================================================

/**
 * Build a research prompt for a specific topic and space
 */
export function buildResearchPrompt(spaceId, topic, context = {}) {
  const systemPrompt = SPACE_SYSTEM_PROMPTS[spaceId] || BASE_SYSTEM_PROMPT;
  const catalog = getCatalog(spaceId);

  let contextInfo = '';
  if (context.existingElements?.length) {
    contextInfo = `\n\nExisting related elements:\n${context.existingElements.map(e => `- ${e.type}: ${e.name}`).join('\n')}`;
  }

  return {
    system: systemPrompt,
    user: `Help me research: "${topic}"

I'm working in the ${catalog?.name || spaceId} space and need to understand this topic better to create relevant artefacts.

Please provide:
1. Key concepts and terminology
2. Important considerations for this context
3. Questions I should be asking
4. Related topics I should explore${contextInfo}`,
  };
}

/**
 * Build a creation guidance prompt for a specific element type
 */
export function buildCreatePrompt(spaceId, elementType, partialData = {}) {
  const systemPrompt = SPACE_SYSTEM_PROMPTS[spaceId] || BASE_SYSTEM_PROMPT;
  const catalog = getCatalog(spaceId);

  // Get field guidance from catalog if available
  const fieldGuidance = catalog?.fieldGuidance?.[elementType] || {};

  let dataContext = '';
  if (Object.keys(partialData).length > 0) {
    dataContext = `\n\nCurrent data provided:\n${JSON.stringify(partialData, null, 2)}`;
  }

  let guidanceContext = '';
  if (Object.keys(fieldGuidance).length > 0) {
    guidanceContext = `\n\nField guidance:\n${Object.entries(fieldGuidance)
      .map(([field, guidance]) => `- ${field}: ${guidance}`)
      .join('\n')}`;
  }

  return {
    system: systemPrompt,
    user: `Help me create a new ${elementType} in the ${catalog?.name || spaceId} space.${dataContext}${guidanceContext}

Please suggest:
1. How to complete any missing required fields
2. Best practices for this element type
3. Common mistakes to avoid
4. Potential relationships to other elements`,
  };
}

/**
 * Build a field completion prompt
 */
export function buildCompletePrompt(spaceId, elementType, fieldName, currentValue, elementContext = {}) {
  const systemPrompt = SPACE_SYSTEM_PROMPTS[spaceId] || BASE_SYSTEM_PROMPT;
  const catalog = getCatalog(spaceId);

  const fieldGuidance = catalog?.fieldGuidance?.[elementType]?.[fieldName] || '';

  return {
    system: systemPrompt,
    user: `Help me complete the "${fieldName}" field for a ${elementType}.

Current value: ${currentValue || '(empty)'}
${fieldGuidance ? `\nGuidance: ${fieldGuidance}` : ''}
${elementContext.name ? `\nElement name: ${elementContext.name}` : ''}
${elementContext.description ? `\nElement description: ${elementContext.description}` : ''}

Please suggest 2-3 options for this field with brief explanations of each.`,
  };
}

/**
 * Build a relationship discovery prompt
 */
export function buildRelatePrompt(spaceId, element, targetSpaces = []) {
  const systemPrompt = SPACE_SYSTEM_PROMPTS[spaceId] || BASE_SYSTEM_PROMPT;
  const catalog = getCatalog(spaceId);

  const crossSpaceInfo = catalog?.crossSpaceConnections || {};

  let targetSpaceContext = '';
  if (targetSpaces.length > 0) {
    targetSpaceContext = `\n\nTarget spaces to explore: ${targetSpaces.join(', ')}`;
  }

  return {
    system: systemPrompt,
    user: `Help me discover relationships for this ${element.type}:

Name: ${element.name}
Description: ${element.description || '(no description)'}
Space: ${catalog?.name || spaceId}${targetSpaceContext}

Please suggest:
1. Potential upstream dependencies (what this element depends on)
2. Potential downstream impacts (what depends on this element)
3. Cross-space relationships that would add value
4. Questions to validate these relationships`,
  };
}

/**
 * Build a learning prompt to explain a concept
 */
export function buildLearnPrompt(spaceId, concept, userLevel = 'intermediate') {
  const systemPrompt = SPACE_SYSTEM_PROMPTS[spaceId] || BASE_SYSTEM_PROMPT;
  const catalog = getCatalog(spaceId);

  return {
    system: systemPrompt,
    user: `Explain the concept of "${concept}" in the context of ${catalog?.name || spaceId}.

User experience level: ${userLevel}

Please provide:
1. A clear definition
2. Why it matters in this context
3. A practical example
4. Common misconceptions
5. How it relates to other concepts in this space`,
  };
}

/**
 * Build a review prompt to improve content
 */
export function buildReviewPrompt(spaceId, element, reviewFocus = 'quality') {
  const systemPrompt = SPACE_SYSTEM_PROMPTS[spaceId] || BASE_SYSTEM_PROMPT;
  const catalog = getCatalog(spaceId);

  // Get examples from catalog for comparison
  const goodExample = catalog?.examples?.[element.type]?.good;
  const poorExample = catalog?.examples?.[element.type]?.poor;

  let exampleContext = '';
  if (goodExample) {
    exampleContext = `\n\nGood example for reference:\n${JSON.stringify(goodExample, null, 2)}`;
  }

  return {
    system: systemPrompt,
    user: `Review this ${element.type} and suggest improvements:

${JSON.stringify(element, null, 2)}

Focus area: ${reviewFocus}${exampleContext}

Please provide:
1. Strengths of the current content
2. Specific improvements suggested
3. Missing information that should be added
4. Quality score (1-10) with justification`,
  };
}

/**
 * Build an analysis prompt for patterns/gaps
 */
export function buildAnalyzePrompt(spaceId, elements, analysisFocus = 'completeness') {
  const systemPrompt = SPACE_SYSTEM_PROMPTS[spaceId] || BASE_SYSTEM_PROMPT;
  const catalog = getCatalog(spaceId);

  const elementSummary = elements.map(e => ({
    type: e.type,
    name: e.name,
    status: e.status,
  }));

  return {
    system: systemPrompt,
    user: `Analyze these ${elements.length} elements in ${catalog?.name || spaceId}:

${JSON.stringify(elementSummary, null, 2)}

Analysis focus: ${analysisFocus}

Please provide:
1. Overall assessment of coverage
2. Gaps or missing elements
3. Patterns observed (good and concerning)
4. Recommendations for next steps
5. Cross-space opportunities`,
  };
}

// =============================================================================
// Exports
// =============================================================================

export default {
  PROMPT_TYPES,
  SPACE_SYSTEM_PROMPTS,
  buildResearchPrompt,
  buildCreatePrompt,
  buildCompletePrompt,
  buildRelatePrompt,
  buildLearnPrompt,
  buildReviewPrompt,
  buildAnalyzePrompt,
};
