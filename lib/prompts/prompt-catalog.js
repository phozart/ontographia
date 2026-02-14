/**
 * Research Prompt Catalog
 *
 * Core philosophy: "AI generates prompts, humans do the thinking"
 *
 * This catalog contains all prompt templates organized by space and trigger.
 * Templates use {{variable}} placeholders that get interpolated with artefact data.
 *
 * @module lib/prompts/prompt-catalog
 */

// =============================================================================
// SUGGESTED AI SOURCES
// =============================================================================

export const AI_SOURCES = {
  claude: {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai',
    icon: 'AutoAwesomeIcon',
    description: 'Best for nuanced analysis and reasoning',
    color: '#D97757'
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    icon: 'SmartToyIcon',
    description: 'Good for broad knowledge and synthesis',
    color: '#10A37F'
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    url: 'https://perplexity.ai',
    icon: 'SearchIcon',
    description: 'Best for researching current information',
    color: '#1FB8CD'
  },
  scholar: {
    id: 'scholar',
    name: 'Google Scholar',
    url: 'https://scholar.google.com',
    icon: 'SchoolIcon',
    description: 'Academic papers and citations',
    color: '#4285F4'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com',
    icon: 'AutoFixHighIcon',
    description: 'Good for technical analysis',
    color: '#8E75B2'
  }
};

// =============================================================================
// TRIGGER TYPES
// =============================================================================

export const TRIGGER_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  LINK: 'link',
  REVIEW: 'review',
  COMPLETE: 'complete',
  STUCK: 'stuck',
  VALIDATE: 'validate',
  ANALYZE: 'analyze'
};

// =============================================================================
// BA (BUSINESS ANALYSIS) PROMPTS - BABOK 3.0
// =============================================================================

export const BA_PROMPTS = [
  // Requirements Validation
  {
    id: 'ba-req-validation',
    space: 'ba',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['business_requirement', 'stakeholder_requirement', 'solution_requirement'],
    title: 'Validate Requirement Quality',
    template: `I'm defining a {{artefactType}} for a {{projectContext}}.

Requirement: "{{name}}"
Description: {{description}}
{{#if rationale}}Rationale: {{rationale}}{{/if}}

Please help me validate this requirement against BABOK quality criteria:

1. Is this requirement atomic (single testable condition)?
2. Is it complete (no TBDs or assumptions hidden)?
3. Is it consistent (no conflicts with other requirements)?
4. Is it feasible (technically and organizationally achievable)?
5. Is it necessary (traces to business value)?
6. Is it prioritizable (can be ranked against others)?
7. Is it unambiguous (single interpretation)?
8. Is it verifiable (can be tested/measured)?

For any gaps, suggest specific improvements.`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['name', 'description', 'rationale', 'artefactType', 'projectContext']
  },

  // Stakeholder Analysis
  {
    id: 'ba-stakeholder-analysis',
    space: 'ba',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['stakeholder'],
    title: 'Stakeholder Analysis Research',
    template: `I'm analyzing a stakeholder for {{projectContext}}.

Stakeholder: {{name}}
Role: {{role}}
{{#if category}}Category: {{category}}{{/if}}
{{#if influence}}Current Influence Assessment: {{influence}}{{/if}}
{{#if interest}}Current Interest Assessment: {{interest}}{{/if}}

Help me think through:

1. What are this stakeholder's likely concerns and priorities?
2. What information do they need and in what format?
3. What decisions do they influence or make?
4. Who else in the organization might share their perspective?
5. What resistance or support might they provide?
6. How should engagement be tailored to their communication style?

Also suggest questions I should ask to validate these assumptions.`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['name', 'role', 'category', 'influence', 'interest', 'projectContext']
  },

  // Acceptance Criteria
  {
    id: 'ba-acceptance-criteria',
    space: 'ba',
    trigger: TRIGGER_TYPES.UPDATE,
    artefactTypes: ['user_story', 'feature'],
    title: 'Generate Acceptance Criteria',
    template: `I need to define acceptance criteria for this user story:

{{#if asA}}As a {{asA}}{{/if}}
{{#if iWant}}I want {{iWant}}{{/if}}
{{#if soThat}}So that {{soThat}}{{/if}}

{{#if description}}Additional context: {{description}}{{/if}}

Help me create comprehensive acceptance criteria using the Given-When-Then format:

1. What are the happy path scenarios?
2. What edge cases should be covered?
3. What error conditions need handling?
4. What validation rules apply?
5. What are the performance expectations?
6. What accessibility requirements exist?

Format each criterion as: "Given [context], When [action], Then [outcome]"`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['asA', 'iWant', 'soThat', 'description', 'name']
  },

  // Business Rule Research
  {
    id: 'ba-business-rules',
    space: 'ba',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['business_rule'],
    title: 'Business Rule Completeness',
    template: `I'm documenting a business rule:

Rule: {{name}}
{{#if description}}Description: {{description}}{{/if}}
{{#if source}}Source: {{source}}{{/if}}

Help me ensure this rule is complete:

1. What exceptions or special cases exist?
2. Who has authority to override this rule?
3. How is this rule enforced today?
4. What happens when the rule is violated?
5. Are there regulatory or compliance drivers?
6. How might this rule change over time?
7. What data is needed to evaluate this rule?

Also identify any implicit assumptions that should be made explicit.`,
    suggestedSources: ['claude', 'perplexity'],
    contextFields: ['name', 'description', 'source']
  },

  // Process Analysis
  {
    id: 'ba-process-analysis',
    space: 'ba',
    trigger: TRIGGER_TYPES.ANALYZE,
    artefactTypes: ['business_process', 'workflow'],
    title: 'Process Improvement Analysis',
    template: `Analyzing business process: {{name}}

{{#if description}}Current state: {{description}}{{/if}}
{{#if steps}}Steps: {{steps}}{{/if}}

Help me identify improvement opportunities:

1. Where are the bottlenecks and delays?
2. Which handoffs create risk or rework?
3. What activities add no value?
4. Where is automation possible?
5. What metrics should track this process?
6. How does this compare to industry best practices?

Consider Lean principles (eliminate waste) and process mining insights.`,
    suggestedSources: ['claude', 'perplexity', 'scholar'],
    contextFields: ['name', 'description', 'steps']
  }
];

// =============================================================================
// EA (ENTERPRISE ARCHITECTURE) PROMPTS - ArchiMate 3.2 + TOGAF
// =============================================================================

export const EA_PROMPTS = [
  // Architecture Decision
  {
    id: 'ea-decision-analysis',
    space: 'ea',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['decision', 'adr'],
    title: 'Architecture Decision Analysis',
    template: `I'm making an architecture decision:

Decision: {{name}}
{{#if context}}Context: {{context}}{{/if}}
{{#if alternatives}}Alternatives considered: {{alternatives}}{{/if}}

Help me think through this decision:

1. What are the key quality attributes affected (performance, security, scalability, maintainability)?
2. What are the long-term implications of each alternative?
3. What constraints should I be aware of?
4. How reversible is this decision?
5. Who are the stakeholders most affected?
6. What similar decisions have been made in comparable organizations?

Also suggest criteria for evaluating the alternatives objectively.`,
    suggestedSources: ['claude', 'perplexity', 'scholar'],
    contextFields: ['name', 'context', 'alternatives']
  },

  // Technology Evaluation
  {
    id: 'ea-tech-evaluation',
    space: 'ea',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['technology_component', 'application_component', 'system_software'],
    title: 'Technology Evaluation Research',
    template: `Evaluating technology: {{name}}

{{#if description}}Description: {{description}}{{/if}}
{{#if vendor}}Vendor: {{vendor}}{{/if}}
{{#if category}}Category: {{category}}{{/if}}

Research questions:

1. What is the technology's maturity and market position?
2. What are the Total Cost of Ownership considerations?
3. What integration challenges are common?
4. What skills are required to implement and maintain?
5. What are the security considerations?
6. What is the vendor's roadmap and support model?
7. What alternatives exist and how do they compare?
8. What reference architectures or case studies are available?

Focus on credible sources and recent information.`,
    suggestedSources: ['perplexity', 'gemini', 'scholar'],
    contextFields: ['name', 'description', 'vendor', 'category']
  },

  // Integration Pattern
  {
    id: 'ea-integration-pattern',
    space: 'ea',
    trigger: TRIGGER_TYPES.LINK,
    artefactTypes: ['application_interface', 'integration', 'service'],
    title: 'Integration Pattern Selection',
    template: `Designing integration between systems:

Integration: {{name}}
{{#if sourceSystem}}Source: {{sourceSystem}}{{/if}}
{{#if targetSystem}}Target: {{targetSystem}}{{/if}}
{{#if dataFlow}}Data flow: {{dataFlow}}{{/if}}

Help me select the right integration pattern:

1. Should this be synchronous or asynchronous?
2. What are the data consistency requirements?
3. How should errors and retries be handled?
4. What is the expected volume and latency?
5. How will this scale?
6. What security measures are needed?
7. How will this be monitored?

Consider patterns like: API Gateway, Event-Driven, Saga, CQRS, etc.`,
    suggestedSources: ['claude', 'perplexity'],
    contextFields: ['name', 'sourceSystem', 'targetSystem', 'dataFlow']
  },

  // Capability Assessment
  {
    id: 'ea-capability-assessment',
    space: 'ea',
    trigger: TRIGGER_TYPES.ANALYZE,
    artefactTypes: ['capability', 'business_capability'],
    title: 'Capability Maturity Assessment',
    template: `Assessing capability: {{name}}

{{#if description}}Description: {{description}}{{/if}}
{{#if currentMaturity}}Current maturity: {{currentMaturity}}{{/if}}
{{#if targetMaturity}}Target maturity: {{targetMaturity}}{{/if}}

Help me assess this capability:

1. What does maturity look like at each level (1-5)?
2. What are the indicators of the current state?
3. What investments are needed to improve?
4. How does this compare to industry benchmarks?
5. What is the strategic importance?
6. What are the dependencies with other capabilities?
7. Who should own improvement initiatives?

Use a capability maturity model lens (CMM/CMMI principles).`,
    suggestedSources: ['claude', 'scholar', 'perplexity'],
    contextFields: ['name', 'description', 'currentMaturity', 'targetMaturity']
  },

  // ArchiMate Modeling
  {
    id: 'ea-archimate-modeling',
    space: 'ea',
    trigger: TRIGGER_TYPES.VALIDATE,
    artefactTypes: ['*'],
    title: 'ArchiMate Best Practices',
    template: `I'm modeling in ArchiMate:

Element: {{name}}
Type: {{elementType}}
Layer: {{layer}}
{{#if relationships}}Relationships: {{relationships}}{{/if}}

Help me validate against ArchiMate best practices:

1. Is this the right element type for what I'm modeling?
2. Are the relationships correctly typed (composition, aggregation, assignment, etc.)?
3. What other elements should this connect to?
4. Does this follow naming conventions?
5. Am I mixing abstraction levels inappropriately?
6. What viewpoints would best show this element?

Reference ArchiMate 3.2 specification.`,
    suggestedSources: ['claude', 'perplexity'],
    contextFields: ['name', 'elementType', 'layer', 'relationships']
  }
];

// =============================================================================
// SRS (STRATEGIC REASONING) PROMPTS
// =============================================================================
// PDS (PROJECT DESIGN) PROMPTS - PMBOK + PRINCE2
// =============================================================================

export const PDS_PROMPTS = [
  // Risk Identification
  {
    id: 'pds-risk-identification',
    space: 'pds',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['risk'],
    title: 'Risk Analysis Deep Dive',
    template: `Analyzing project risk:

Risk: {{name}}
{{#if description}}Description: {{description}}{{/if}}
{{#if probability}}Probability: {{probability}}{{/if}}
{{#if impact}}Impact: {{impact}}{{/if}}
{{#if category}}Category: {{category}}{{/if}}

Help me understand this risk better:

1. What are the root causes that could trigger this risk?
2. What early warning signs should I watch for?
3. What response strategies are appropriate (avoid, mitigate, transfer, accept)?
4. What contingency plans should be ready?
5. Are there related risks that could compound this one?
6. Who should own this risk and why?
7. What's the secondary risk from the response strategy?

Consider both threats and opportunities in this category.`,
    suggestedSources: ['claude', 'chatgpt', 'perplexity'],
    contextFields: ['name', 'description', 'probability', 'impact', 'category']
  },

  // Stakeholder Mapping
  {
    id: 'pds-stakeholder-mapping',
    space: 'pds',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['stakeholder'],
    title: 'Project Stakeholder Strategy',
    template: `Mapping project stakeholder:

Stakeholder: {{name}}
{{#if role}}Role: {{role}}{{/if}}
{{#if influence}}Influence: {{influence}}{{/if}}
{{#if interest}}Interest: {{interest}}{{/if}}

Help me develop an engagement strategy:

1. What does this stakeholder need from the project?
2. What can they contribute to project success?
3. What might cause them to resist or support changes?
4. How should communication be tailored for them?
5. What decisions do they need to make or influence?
6. Are there relationships with other stakeholders I should consider?
7. How might their position change through the project lifecycle?

Suggest specific engagement tactics based on their profile.`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['name', 'role', 'influence', 'interest']
  },

  // Scope Validation
  {
    id: 'pds-scope-validation',
    space: 'pds',
    trigger: TRIGGER_TYPES.VALIDATE,
    artefactTypes: ['deliverable', 'work_package', 'scope_item'],
    title: 'Scope Item Validation',
    template: `Validating scope item:

Item: {{name}}
{{#if description}}Description: {{description}}{{/if}}
{{#if acceptanceCriteria}}Acceptance criteria: {{acceptanceCriteria}}{{/if}}

Help me validate this scope item:

1. Is this clearly defined with measurable completion criteria?
2. Are the boundaries clear (what's in vs. out)?
3. What dependencies exist with other scope items?
4. Is the effort estimate realistic?
5. What risks are associated with this item?
6. Who needs to accept this deliverable?
7. What quality standards apply?
8. Could this be descoped if needed without losing project value?

Challenge any vague or optimistic assumptions.`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['name', 'description', 'acceptanceCriteria']
  },

  // Lesson Application
  {
    id: 'pds-lesson-application',
    space: 'pds',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['lesson', 'retrospective'],
    title: 'Lessons Learned Analysis',
    template: `Capturing lessons learned:

Lesson: {{name}}
{{#if context}}Context: {{context}}{{/if}}
{{#if whatHappened}}What happened: {{whatHappened}}{{/if}}

Help me make this lesson valuable:

1. What's the underlying principle, not just the specific incident?
2. In what situations should this lesson be applied?
3. What behavior change does this suggest?
4. How can this be embedded in process/checklist/template?
5. Who else should know about this lesson?
6. How will we know if the lesson was actually learned?
7. What would have had to be different to prevent this?

Make this actionable, not just a story.`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['name', 'context', 'whatHappened']
  },

  // Milestone Planning
  {
    id: 'pds-milestone-planning',
    space: 'pds',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['milestone', 'governance_gate'],
    title: 'Milestone Criteria Research',
    template: `Planning milestone:

Milestone: {{name}}
{{#if plannedDate}}Planned date: {{plannedDate}}{{/if}}
{{#if stage}}Project stage: {{stage}}{{/if}}

Help me define this milestone well:

1. What tangible outputs must exist to achieve this milestone?
2. What decisions need to be made at this point?
3. Who needs to approve or sign off?
4. What criteria will be used to assess readiness?
5. What are the consequences of missing this milestone?
6. What buffer exists if things slip?
7. How does this connect to dependent activities?

Make the milestone a meaningful checkpoint, not just a date.`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['name', 'plannedDate', 'stage']
  }
];

// =============================================================================
// CAP (CAPABILITY) PROMPTS
// =============================================================================

export const CAP_PROMPTS = [
  // Capability Assessment
  {
    id: 'cap-capability-assessment',
    space: 'cap',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['capability'],
    title: 'Capability Definition Research',
    template: `Defining organizational capability:

Capability: {{name}}
{{#if description}}Description: {{description}}{{/if}}
{{#if level}}Hierarchy level: {{level}}{{/if}}

Help me define this capability well:

1. What outcomes does this capability enable?
2. How is this distinct from related capabilities?
3. What resources (people, process, technology) support this capability?
4. How do leading organizations approach this capability?
5. What maturity levels make sense for this capability?
6. What are the metrics that indicate capability performance?
7. How does this capability connect to value streams?

Ensure the definition is business-focused, not technology-focused.`,
    suggestedSources: ['claude', 'perplexity', 'scholar'],
    contextFields: ['name', 'description', 'level']
  },

  // Maturity Evaluation
  {
    id: 'cap-maturity-evaluation',
    space: 'cap',
    trigger: TRIGGER_TYPES.ANALYZE,
    artefactTypes: ['capability'],
    title: 'Capability Maturity Evaluation',
    template: `Evaluating capability maturity:

Capability: {{name}}
{{#if currentMaturity}}Current maturity: {{currentMaturity}}{{/if}}
{{#if targetMaturity}}Target maturity: {{targetMaturity}}{{/if}}
{{#if strategicImportance}}Strategic importance: {{strategicImportance}}{{/if}}

Help me evaluate and improve maturity:

1. What are the characteristics of each maturity level?
2. What evidence supports the current assessment?
3. What gaps exist between current and target state?
4. What investments are needed to improve?
5. What quick wins could improve maturity?
6. What organizational changes are required?
7. How long does maturity improvement typically take?

Use industry capability maturity frameworks as reference.`,
    suggestedSources: ['claude', 'perplexity', 'scholar'],
    contextFields: ['name', 'currentMaturity', 'targetMaturity', 'strategicImportance']
  },

  // Gap Analysis
  {
    id: 'cap-gap-analysis',
    space: 'cap',
    trigger: TRIGGER_TYPES.ANALYZE,
    artefactTypes: ['capability', 'gap'],
    title: 'Capability Gap Analysis',
    template: `Analyzing capability gap:

Capability: {{name}}
{{#if currentState}}Current state: {{currentState}}{{/if}}
{{#if desiredState}}Desired state: {{desiredState}}{{/if}}
{{#if gap}}Identified gap: {{gap}}{{/if}}

Help me understand and close this gap:

1. What is the root cause of this gap?
2. What is the business impact of not closing it?
3. What options exist to close the gap (build, buy, partner)?
4. What's the realistic timeline for improvement?
5. What dependencies or prerequisites exist?
6. What resources are required?
7. How will we measure progress?

Prioritize based on strategic importance and feasibility.`,
    suggestedSources: ['claude', 'perplexity'],
    contextFields: ['name', 'currentState', 'desiredState', 'gap']
  }
];

// =============================================================================
// DWD (DYNAMIC WORK DESIGN) PROMPTS
// =============================================================================

export const DWD_PROMPTS = [
  // Work Item Analysis
  {
    id: 'dwd-work-analysis',
    space: 'dwd',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['work_item', 'activity'],
    title: 'Work Design Analysis',
    template: `Analyzing work item:

Work: {{name}}
{{#if description}}Description: {{description}}{{/if}}
{{#if actors}}Actors involved: {{actors}}{{/if}}
{{#if volatility}}Volatility: {{volatility}}{{/if}}

Help me design this work well:

1. What type of work is this (routine, variable, unique)?
2. What skills and capabilities are required?
3. How much autonomy should the worker have?
4. What coordination is needed with others?
5. How should success be measured?
6. What learning opportunities exist in this work?
7. How might this work change over time?

Apply Dynamic Work Design principles.`,
    suggestedSources: ['claude', 'scholar'],
    contextFields: ['name', 'description', 'actors', 'volatility']
  },

  // Actor-Work Fit
  {
    id: 'dwd-fit-analysis',
    space: 'dwd',
    trigger: TRIGGER_TYPES.ANALYZE,
    artefactTypes: ['actor', 'work_item'],
    title: 'Actor-Work Fit Assessment',
    template: `Assessing fit between actor and work:

Actor: {{actorName}}
Work: {{workName}}
{{#if currentFit}}Current fit assessment: {{currentFit}}{{/if}}

Help me assess and improve fit:

1. What capabilities does this work require vs. what the actor has?
2. What motivates this actor and does the work align?
3. What growth opportunities does this provide?
4. What support systems are needed?
5. How can the work be shaped to improve fit?
6. What risks come from misalignment?
7. How should performance be supported and measured?

Consider both immediate fit and development potential.`,
    suggestedSources: ['claude', 'scholar'],
    contextFields: ['actorName', 'workName', 'currentFit']
  }
];

// =============================================================================
// UNIVERSAL PROMPTS (ALL SPACES)
// =============================================================================

export const UNIVERSAL_PROMPTS = [
  // Getting Started
  {
    id: 'universal-getting-started',
    space: 'all',
    trigger: TRIGGER_TYPES.CREATE,
    artefactTypes: ['*'],
    title: 'Research Starting Point',
    template: `I'm working on: {{name}}

Context: {{description}}

Help me get started with good research questions:

1. What do I need to understand first?
2. What are the key decisions I'll need to make?
3. What expertise should I consult?
4. What similar problems have others solved?
5. What are the common pitfalls to avoid?
6. What frameworks or methodologies apply?

Give me a structured approach to learning about this topic.`,
    suggestedSources: ['perplexity', 'claude', 'scholar'],
    contextFields: ['name', 'description']
  },

  // Cross-Space Link
  {
    id: 'universal-cross-space',
    space: 'all',
    trigger: TRIGGER_TYPES.LINK,
    artefactTypes: ['*'],
    title: 'Cross-Domain Connection Research',
    template: `I'm connecting elements across domains:

Source: {{sourceName}} ({{sourceSpace}})
Target: {{targetName}} ({{targetSpace}})
{{#if relationshipType}}Relationship: {{relationshipType}}{{/if}}

Help me understand this connection:

1. What does this relationship imply?
2. What are the dependencies and impacts?
3. What changes in one would affect the other?
4. Who needs to know about this connection?
5. How should this be documented?
6. What other connections should exist?

Consider traceability and impact analysis needs.`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['sourceName', 'sourceSpace', 'targetName', 'targetSpace', 'relationshipType']
  },

  // Stuck Point
  {
    id: 'universal-stuck',
    space: 'all',
    trigger: TRIGGER_TYPES.STUCK,
    artefactTypes: ['*'],
    title: 'Getting Unstuck',
    template: `I'm stuck on: {{name}}

What I've tried: {{attemptedApproaches}}
Where I'm blocked: {{blockingPoint}}

Help me get unstuck:

1. What am I assuming that might not be true?
2. Is this actually the right problem to solve?
3. Who might have faced similar challenges?
4. What would I do if I had unlimited resources?
5. What's the minimum viable next step?
6. Should I set this aside and return with fresh eyes?

Challenge my framing and suggest new angles.`,
    suggestedSources: ['claude', 'chatgpt'],
    contextFields: ['name', 'attemptedApproaches', 'blockingPoint']
  }
];

// =============================================================================
// CATALOG AGGREGATION
// =============================================================================

export const PROMPT_CATALOG = {
  ba: BA_PROMPTS,
  ea: EA_PROMPTS,
  pds: PDS_PROMPTS,
  cap: CAP_PROMPTS,
  dwd: DWD_PROMPTS,
  all: UNIVERSAL_PROMPTS
};

/**
 * Get all prompts for a space
 */
export function getPromptsForSpace(spaceId) {
  return [...(PROMPT_CATALOG[spaceId] || []), ...UNIVERSAL_PROMPTS];
}

/**
 * Get prompts by trigger type for a space
 */
export function getPromptsByTrigger(spaceId, trigger) {
  const spacePrompts = getPromptsForSpace(spaceId);
  return spacePrompts.filter(p => p.trigger === trigger);
}

/**
 * Get prompts applicable to an artefact type
 */
export function getPromptsForArtefactType(spaceId, artefactType) {
  const spacePrompts = getPromptsForSpace(spaceId);
  return spacePrompts.filter(p =>
    p.artefactTypes.includes('*') ||
    p.artefactTypes.includes(artefactType)
  );
}

/**
 * Get a specific prompt by ID
 */
export function getPromptById(promptId) {
  for (const [space, prompts] of Object.entries(PROMPT_CATALOG)) {
    const found = prompts.find(p => p.id === promptId);
    if (found) return found;
  }
  return null;
}

export default PROMPT_CATALOG;
