/**
 * Analysis Studio Type System
 *
 * Central type definitions for the Analysis Studio traceability engine.
 * Covers 5 co-equal disciplines: Requirements, System Architecture,
 * Data Architecture, UX/UI Design, and Testing.
 *
 * ~35 artefact types, configurable traceability metamodel, coverage rules,
 * and analysis profiles.
 *
 * @module lib/analysis-types
 */

// ============================================================================
// DISCIPLINES
// ============================================================================

export const ANALYSIS_DISCIPLINES = {
  requirements: {
    id: 'requirements',
    name: 'Requirements',
    description: 'Capture and manage functional and non-functional requirements',
    icon: 'clipboard',
    color: '#8b5cf6',
  },
  stories: {
    id: 'stories',
    name: 'User Stories',
    description: 'Plan delivery through epics, features, and stories',
    icon: 'file-text',
    color: '#06b6d4',
  },
  architecture: {
    id: 'architecture',
    name: 'System Architecture',
    description: 'Solution-level architecture: C4 models, ADRs, quality attributes',
    icon: 'layers',
    color: '#f59e0b',
  },
  data: {
    id: 'data',
    name: 'Data Architecture',
    description: 'Conceptual/logical data models, contracts, flows, lineage',
    icon: 'database',
    color: '#14b8a6',
  },
  design: {
    id: 'design',
    name: 'UX/UI Design',
    description: 'Personas, journeys, wireframes, research, service blueprints',
    icon: 'palette',
    color: '#ec4899',
  },
  testing: {
    id: 'testing',
    name: 'Testing',
    description: 'Test cases, suites, usability tests, accessibility audits',
    icon: 'check-square',
    color: '#22c55e',
  },
  crosscutting: {
    id: 'crosscutting',
    name: 'Cross-Cutting',
    description: 'Stakeholders, reviews, and cross-discipline concerns',
    icon: 'link',
    color: '#64748b',
  },
};

// ============================================================================
// ANALYSIS STATUS
// ============================================================================

export const ANALYSIS_STATUS = {
  Draft: { color: '#9C9A94', label: 'Draft', description: 'Initial capture' },
  'In Analysis': { color: '#47453F', label: 'In Analysis', description: 'Being analyzed' },
  'In Review': { color: '#C9A227', label: 'In Review', description: 'Under stakeholder review' },
  Approved: { color: '#5B8A6A', label: 'Approved', description: 'Signed off' },
  'On Hold': { color: '#9C9A94', label: 'On Hold', description: 'Paused' },
  Completed: { color: '#47453F', label: 'Completed', description: 'Finished' },
};

// ============================================================================
// ARTEFACT TYPE DEFINITIONS (~35 types across 7 disciplines)
// ============================================================================

export const ANALYSIS_ARTEFACT_TYPES = {
  // ── Requirements Discipline (9 types) ──────────────────────────────────────
  BusinessRequirement: {
    id: 'BusinessRequirement',
    name: 'Business Requirement',
    prefix: 'BR',
    color: '#8b5cf6',
    icon: 'target',
    discipline: 'requirements',
    module: 'requirements',
    description: 'High-level business need or objective',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Description' },
      rationale: { type: 'text', label: 'Business Rationale' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
      source: { type: 'string', label: 'Source (who raised this)' },
      acceptance_criteria: { type: 'text', label: 'Acceptance Criteria' },
      owner: { type: 'string', label: 'Owner' },
      verified_by: { type: 'string', label: 'Verified By' },
    },
  },
  StakeholderRequirement: {
    id: 'StakeholderRequirement',
    name: 'Stakeholder Requirement',
    prefix: 'SR',
    color: '#a78bfa',
    icon: 'users',
    discipline: 'requirements',
    module: 'requirements',
    description: 'Requirement from a specific stakeholder perspective',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Description' },
      stakeholder: { type: 'string', label: 'Stakeholder' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
      acceptance_criteria: { type: 'text', label: 'Acceptance Criteria' },
      owner: { type: 'string', label: 'Owner' },
      verified_by: { type: 'string', label: 'Verified By' },
    },
  },
  SolutionRequirement: {
    id: 'SolutionRequirement',
    name: 'Solution Requirement',
    prefix: 'SL',
    color: '#c4b5fd',
    icon: 'settings',
    discipline: 'requirements',
    module: 'requirements',
    description: 'Specific requirement for the solution design',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Description' },
      category: { type: 'select', options: ['Functional', 'Interface', 'Data', 'Security', 'Performance'], label: 'Category' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
      acceptance_criteria: { type: 'text', label: 'Acceptance Criteria' },
      owner: { type: 'string', label: 'Owner' },
      verified_by: { type: 'string', label: 'Verified By' },
    },
  },
  BusinessRule: {
    id: 'BusinessRule',
    name: 'Business Rule',
    prefix: 'BRL',
    color: '#34d399',
    icon: 'book-open',
    discipline: 'requirements',
    module: 'requirements',
    description: 'Operational rule or constraint the solution must enforce',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Rule Statement' },
      rule_type: { type: 'select', options: ['Constraint', 'Computation', 'Inference', 'Authorization'], label: 'Rule Type' },
      enforcement: { type: 'select', options: ['Automated', 'Manual', 'Both'], label: 'Enforcement' },
      source_regulation: { type: 'string', label: 'Source Regulation' },
      exceptions: { type: 'text', label: 'Known Exceptions' },
    },
  },
  UseCase: {
    id: 'UseCase',
    name: 'Use Case',
    prefix: 'UC',
    color: '#6ee7b7',
    icon: 'play-circle',
    discipline: 'requirements',
    module: 'requirements',
    description: 'Actor-goal interaction sequence',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Brief Description' },
      primary_actor: { type: 'string', label: 'Primary Actor' },
      preconditions: { type: 'text', label: 'Preconditions' },
      main_flow: { type: 'text', label: 'Main Success Scenario' },
      alternate_flows: { type: 'text', label: 'Alternate Flows' },
      postconditions: { type: 'text', label: 'Postconditions' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
    },
  },
  NonFunctionalRequirement: {
    id: 'NonFunctionalRequirement',
    name: 'Non-Functional Requirement',
    prefix: 'NFR',
    color: '#7c3aed',
    icon: 'gauge',
    discipline: 'requirements',
    module: 'requirements',
    description: 'Performance, security, scalability, or availability target',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Description' },
      category: { type: 'select', options: ['Performance', 'Security', 'Scalability', 'Availability', 'Reliability', 'Maintainability', 'Usability', 'Compliance'], label: 'Category' },
      metric: { type: 'string', label: 'Measurable Metric' },
      target_value: { type: 'string', label: 'Target Value' },
      measurement_method: { type: 'string', label: 'How to Measure' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
    },
  },

  // ── Stories Discipline (3 types) ───────────────────────────────────────────
  Epic: {
    id: 'Epic',
    name: 'Epic',
    prefix: 'EP',
    color: '#06b6d4',
    icon: 'package',
    discipline: 'stories',
    module: 'stories',
    description: 'Large body of work that can be broken down into features/stories',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Description' },
      business_value: { type: 'text', label: 'Business Value' },
      acceptance_criteria: { type: 'text', label: 'Acceptance Criteria' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
    },
  },
  Feature: {
    id: 'Feature',
    name: 'Feature',
    prefix: 'FT',
    color: '#22d3ee',
    icon: 'star',
    discipline: 'stories',
    module: 'stories',
    description: 'Distinct capability that delivers user value',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Description' },
      benefit: { type: 'text', label: 'Benefit Hypothesis' },
      acceptance_criteria: { type: 'text', label: 'Acceptance Criteria' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
    },
  },
  UserStory: {
    id: 'UserStory',
    name: 'User Story',
    prefix: 'US',
    color: '#67e8f9',
    icon: 'file-text',
    discipline: 'stories',
    module: 'stories',
    description: 'As a [role], I want [goal] so that [benefit]',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'User Story (As a... I want... So that...)' },
      acceptance_criteria: { type: 'text', label: 'Acceptance Criteria (Given/When/Then)' },
      story_points: { type: 'number', label: 'Story Points' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
    },
  },

  // ── System Architecture Discipline (7 types) ──────────────────────────────
  ADR: {
    id: 'ADR',
    name: 'Architecture Decision',
    prefix: 'ADR',
    color: '#f59e0b',
    icon: 'scale',
    discipline: 'architecture',
    module: 'architecture',
    description: 'Architecture decision record with context, options, and rationale',
    fields: {
      name: { type: 'string', required: true, label: 'Decision Title' },
      description: { type: 'text', label: 'Context' },
      decision: { type: 'text', label: 'Decision' },
      alternatives: { type: 'text', label: 'Alternatives Considered' },
      consequences: { type: 'text', label: 'Consequences' },
      adr_status: { type: 'select', options: ['Proposed', 'Accepted', 'Deprecated', 'Superseded'], label: 'ADR Status' },
    },
  },
  Component: {
    id: 'Component',
    name: 'Component',
    prefix: 'CMP',
    color: '#fbbf24',
    icon: 'box',
    discipline: 'architecture',
    module: 'architecture',
    description: 'Solution component (system, container, or component in C4 terms)',
    fields: {
      name: { type: 'string', required: true, label: 'Name' },
      description: { type: 'text', label: 'Description' },
      c4_level: { type: 'select', options: ['System', 'Container', 'Component'], label: 'C4 Level' },
      technology: { type: 'string', label: 'Technology / Runtime' },
      owner: { type: 'string', label: 'Owner Team' },
      responsibilities: { type: 'text', label: 'Responsibilities' },
    },
  },
  TechnologyChoice: {
    id: 'TechnologyChoice',
    name: 'Technology Choice',
    prefix: 'TC',
    color: '#fcd34d',
    icon: 'wrench',
    discipline: 'architecture',
    module: 'architecture',
    description: 'Technology selection with evaluation criteria',
    fields: {
      name: { type: 'string', required: true, label: 'Technology Name' },
      description: { type: 'text', label: 'Description' },
      category: { type: 'select', options: ['Language', 'Framework', 'Database', 'Infrastructure', 'Library', 'Service', 'Tool'], label: 'Category' },
      evaluation_score: { type: 'number', label: 'Evaluation Score (1-10)' },
      license: { type: 'string', label: 'License' },
      maturity: { type: 'select', options: ['Emerging', 'Growing', 'Mature', 'Declining'], label: 'Maturity' },
    },
  },
  QualityAttribute: {
    id: 'QualityAttribute',
    name: 'Quality Attribute Scenario',
    prefix: 'QAW',
    color: '#d97706',
    icon: 'shield',
    discipline: 'architecture',
    module: 'architecture',
    description: 'Measurable quality scenario: stimulus, environment, response, measure',
    fields: {
      name: { type: 'string', required: true, label: 'Scenario Name' },
      description: { type: 'text', label: 'Description' },
      attribute: { type: 'select', options: ['Performance', 'Security', 'Availability', 'Modifiability', 'Testability', 'Usability', 'Interoperability'], label: 'Quality Attribute' },
      stimulus: { type: 'text', label: 'Stimulus (what triggers it)' },
      environment: { type: 'string', label: 'Environment (under what conditions)' },
      response: { type: 'text', label: 'Response (desired behavior)' },
      response_measure: { type: 'string', label: 'Response Measure (quantifiable)' },
      importance: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Business Importance' },
      difficulty: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Technical Difficulty' },
    },
  },
  IntegrationPattern: {
    id: 'IntegrationPattern',
    name: 'Integration Pattern',
    prefix: 'INT',
    color: '#b45309',
    icon: 'git-merge',
    discipline: 'architecture',
    module: 'architecture',
    description: 'System boundary connection: API, event, batch, or file-based',
    fields: {
      name: { type: 'string', required: true, label: 'Integration Name' },
      description: { type: 'text', label: 'Description' },
      pattern: { type: 'select', options: ['REST API', 'GraphQL', 'gRPC', 'Event/Message', 'Batch/File', 'Webhook', 'Database Link'], label: 'Pattern' },
      source_system: { type: 'string', label: 'Source System' },
      target_system: { type: 'string', label: 'Target System' },
      protocol: { type: 'string', label: 'Protocol / Transport' },
      data_format: { type: 'string', label: 'Data Format' },
      frequency: { type: 'select', options: ['Real-time', 'Near-real-time', 'Scheduled', 'On-demand'], label: 'Frequency' },
      error_handling: { type: 'text', label: 'Error Handling Strategy' },
    },
  },
  ThreatModel: {
    id: 'ThreatModel',
    name: 'Threat Model',
    prefix: 'THR',
    color: '#a54d4d',
    icon: 'alert-triangle',
    discipline: 'architecture',
    module: 'architecture',
    description: 'STRIDE threat with mitigation strategy',
    fields: {
      name: { type: 'string', required: true, label: 'Threat Name' },
      description: { type: 'text', label: 'Threat Description' },
      stride_category: { type: 'select', options: ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'], label: 'STRIDE Category' },
      affected_component: { type: 'string', label: 'Affected Component' },
      attack_vector: { type: 'text', label: 'Attack Vector' },
      likelihood: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Likelihood' },
      impact: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Impact' },
      mitigation: { type: 'text', label: 'Mitigation Strategy' },
      residual_risk: { type: 'text', label: 'Residual Risk' },
    },
  },
  InfrastructureView: {
    id: 'InfrastructureView',
    name: 'Infrastructure View',
    prefix: 'INF',
    color: '#92400e',
    icon: 'server',
    discipline: 'architecture',
    module: 'architecture',
    description: 'Deployment topology element (node, cluster, service)',
    fields: {
      name: { type: 'string', required: true, label: 'Name' },
      description: { type: 'text', label: 'Description' },
      infra_type: { type: 'select', options: ['Compute', 'Storage', 'Network', 'Container', 'Serverless', 'CDN', 'Load Balancer', 'DNS'], label: 'Infrastructure Type' },
      provider: { type: 'string', label: 'Cloud Provider / Platform' },
      region: { type: 'string', label: 'Region / Zone' },
      sizing: { type: 'string', label: 'Sizing / SKU' },
      cost_estimate: { type: 'string', label: 'Monthly Cost Estimate' },
    },
  },

  // ── Data Architecture Discipline (8 types) ─────────────────────────────────
  ConceptualEntity: {
    id: 'ConceptualEntity',
    name: 'Conceptual Entity',
    prefix: 'CE',
    color: '#14b8a6',
    icon: 'hexagon',
    discipline: 'data',
    module: 'data',
    description: 'Business concept entity in the conceptual data model',
    fields: {
      name: { type: 'string', required: true, label: 'Entity Name' },
      description: { type: 'text', label: 'Business Definition' },
      domain_area: { type: 'string', label: 'Business Domain Area' },
      key_attributes: { type: 'text', label: 'Key Attributes (comma-separated)' },
      example_instances: { type: 'text', label: 'Example Instances' },
    },
  },
  LogicalDataModel: {
    id: 'LogicalDataModel',
    name: 'Logical Data Model',
    prefix: 'LDM',
    color: '#0d9488',
    icon: 'table',
    discipline: 'data',
    module: 'data',
    description: 'Table or document structure with typed attributes',
    fields: {
      name: { type: 'string', required: true, label: 'Table/Document Name' },
      description: { type: 'text', label: 'Description' },
      storage_type: { type: 'select', options: ['Relational Table', 'Document', 'Key-Value', 'Graph', 'Column Family', 'Time Series'], label: 'Storage Type' },
      columns: { type: 'json', label: 'Columns/Fields (JSON array: [{name, type, nullable, description}])' },
      primary_key: { type: 'string', label: 'Primary Key' },
      indexes: { type: 'text', label: 'Indexes' },
      constraints: { type: 'text', label: 'Constraints' },
    },
  },
  DataFlow: {
    id: 'DataFlow',
    name: 'Data Flow',
    prefix: 'DF',
    color: '#2dd4bf',
    icon: 'arrow-right-circle',
    discipline: 'data',
    module: 'data',
    description: 'Data movement path: source, transformation, destination',
    fields: {
      name: { type: 'string', required: true, label: 'Flow Name' },
      description: { type: 'text', label: 'Description' },
      source: { type: 'string', label: 'Source System/Component' },
      destination: { type: 'string', label: 'Destination System/Component' },
      transformation: { type: 'text', label: 'Transformation Logic' },
      frequency: { type: 'select', options: ['Real-time', 'Near-real-time', 'Hourly', 'Daily', 'Weekly', 'On-demand'], label: 'Frequency' },
      volume: { type: 'string', label: 'Expected Volume' },
      format: { type: 'string', label: 'Data Format' },
    },
  },
  DataContract: {
    id: 'DataContract',
    name: 'Data Contract',
    prefix: 'DCO',
    color: '#0f766e',
    icon: 'file-check',
    discipline: 'data',
    module: 'data',
    description: 'Schema + SLA + quality rules between data producer and consumer',
    fields: {
      name: { type: 'string', required: true, label: 'Contract Name' },
      description: { type: 'text', label: 'Description' },
      producer: { type: 'string', label: 'Data Producer (team/system)' },
      consumer: { type: 'string', label: 'Data Consumer (team/system)' },
      schema_definition: { type: 'text', label: 'Schema Definition' },
      sla_freshness: { type: 'string', label: 'SLA: Data Freshness' },
      sla_availability: { type: 'string', label: 'SLA: Availability' },
      quality_rules: { type: 'text', label: 'Quality Rules' },
      version: { type: 'string', label: 'Contract Version' },
    },
  },
  DataDictionaryEntry: {
    id: 'DataDictionaryEntry',
    name: 'Data Dictionary Entry',
    prefix: 'DDE',
    color: '#5eead4',
    icon: 'book',
    discipline: 'data',
    module: 'data',
    description: 'Precise definition of a data element across systems',
    fields: {
      name: { type: 'string', required: true, label: 'Element Name' },
      description: { type: 'text', label: 'Business Definition' },
      data_type: { type: 'string', label: 'Data Type' },
      format: { type: 'string', label: 'Format / Pattern' },
      allowed_values: { type: 'text', label: 'Allowed Values / Domain' },
      source_of_truth: { type: 'string', label: 'Source of Truth System' },
      synonyms: { type: 'string', label: 'Synonyms / Aliases' },
    },
  },
  DataQualityRule: {
    id: 'DataQualityRule',
    name: 'Data Quality Rule',
    prefix: 'DQR',
    color: '#99f6e4',
    icon: 'check-circle',
    discipline: 'data',
    module: 'data',
    description: 'Validation or completeness constraint on data',
    fields: {
      name: { type: 'string', required: true, label: 'Rule Name' },
      description: { type: 'text', label: 'Rule Description' },
      dimension: { type: 'select', options: ['Accuracy', 'Completeness', 'Consistency', 'Timeliness', 'Uniqueness', 'Validity'], label: 'Quality Dimension' },
      expression: { type: 'text', label: 'Validation Expression / Logic' },
      threshold: { type: 'string', label: 'Acceptable Threshold' },
      remediation: { type: 'text', label: 'Remediation Action' },
    },
  },
  DataClassification: {
    id: 'DataClassification',
    name: 'Data Classification',
    prefix: 'DCL',
    color: '#134e4a',
    icon: 'tag',
    discipline: 'data',
    module: 'data',
    description: 'Sensitivity, PII, and retention label for data',
    fields: {
      name: { type: 'string', required: true, label: 'Classification Name' },
      description: { type: 'text', label: 'Description' },
      sensitivity: { type: 'select', options: ['Public', 'Internal', 'Confidential', 'Restricted', 'Top Secret'], label: 'Sensitivity Level' },
      contains_pii: { type: 'select', options: ['Yes', 'No', 'Possible'], label: 'Contains PII' },
      retention_period: { type: 'string', label: 'Retention Period' },
      encryption_required: { type: 'select', options: ['At Rest', 'In Transit', 'Both', 'None'], label: 'Encryption Required' },
      regulatory_frameworks: { type: 'string', label: 'Regulatory Frameworks (GDPR, HIPAA, etc.)' },
    },
  },
  DataLineage: {
    id: 'DataLineage',
    name: 'Data Lineage',
    prefix: 'DLN',
    color: '#115e59',
    icon: 'git-branch',
    discipline: 'data',
    module: 'data',
    description: 'Origin, transformations, and consumers of a data element',
    fields: {
      name: { type: 'string', required: true, label: 'Lineage Name' },
      description: { type: 'text', label: 'Description' },
      origin_system: { type: 'string', label: 'Origin System' },
      transformations: { type: 'text', label: 'Transformation Steps' },
      consumers: { type: 'text', label: 'Consuming Systems' },
      refresh_frequency: { type: 'string', label: 'Refresh Frequency' },
    },
  },

  // ── UX/UI Design Discipline (9 types) ──────────────────────────────────────
  Persona: {
    id: 'Persona',
    name: 'Persona',
    prefix: 'PER',
    color: '#ec4899',
    icon: 'user',
    discipline: 'design',
    module: 'design',
    description: 'Archetype representing a key user group',
    fields: {
      name: { type: 'string', required: true, label: 'Persona Name' },
      description: { type: 'text', label: 'Bio / Background' },
      role: { type: 'string', label: 'Role / Job Title' },
      goals: { type: 'text', label: 'Goals' },
      frustrations: { type: 'text', label: 'Pain Points / Frustrations' },
      behaviors: { type: 'text', label: 'Key Behaviors' },
      tech_savviness: { type: 'select', options: ['Low', 'Medium', 'High', 'Expert'], label: 'Tech Savviness' },
    },
  },
  Journey: {
    id: 'Journey',
    name: 'User Journey',
    prefix: 'JRN',
    color: '#f472b6',
    icon: 'map',
    discipline: 'design',
    module: 'design',
    description: 'End-to-end experience map with stages and touchpoints',
    fields: {
      name: { type: 'string', required: true, label: 'Journey Name' },
      description: { type: 'text', label: 'Scenario Description' },
      stages: { type: 'json', label: 'Stages (JSON array: [{name, actions, thoughts, emotions, touchpoints}])' },
      overall_sentiment: { type: 'select', options: ['Positive', 'Mixed', 'Negative'], label: 'Overall Sentiment' },
      opportunities: { type: 'text', label: 'Key Opportunities' },
    },
  },
  Wireframe: {
    id: 'Wireframe',
    name: 'Wireframe',
    prefix: 'WF',
    color: '#f9a8d4',
    icon: 'layout',
    discipline: 'design',
    module: 'design',
    description: 'Visual representation of a screen or page layout',
    fields: {
      name: { type: 'string', required: true, label: 'Screen Name' },
      description: { type: 'text', label: 'Description' },
      fidelity: { type: 'select', options: ['Low', 'Medium', 'High'], label: 'Fidelity Level' },
      device: { type: 'select', options: ['Desktop', 'Tablet', 'Mobile', 'Responsive'], label: 'Device Type' },
      screen_type: { type: 'select', options: ['Dashboard', 'Form', 'List', 'Detail', 'Navigation', 'Modal', 'Settings', 'Other'], label: 'Screen Type' },
      annotations: { type: 'text', label: 'Design Annotations' },
    },
  },
  DesignDecision: {
    id: 'DesignDecision',
    name: 'Design Decision',
    prefix: 'DD',
    color: '#fbcfe8',
    icon: 'pen-tool',
    discipline: 'design',
    module: 'design',
    description: 'UX/UI design choice with rationale',
    fields: {
      name: { type: 'string', required: true, label: 'Decision Title' },
      description: { type: 'text', label: 'Context' },
      decision: { type: 'text', label: 'Decision Made' },
      alternatives: { type: 'text', label: 'Alternatives Considered' },
      rationale: { type: 'text', label: 'Rationale' },
    },
  },
  ResearchFinding: {
    id: 'ResearchFinding',
    name: 'Research Finding',
    prefix: 'RF',
    color: '#db2777',
    icon: 'search',
    discipline: 'design',
    module: 'design',
    description: 'Atomic UX research nugget: observation + evidence',
    fields: {
      name: { type: 'string', required: true, label: 'Finding Title' },
      description: { type: 'text', label: 'Observation' },
      evidence: { type: 'text', label: 'Evidence / Quotes' },
      research_method: { type: 'select', options: ['Interview', 'Survey', 'Usability Test', 'Analytics', 'Field Study', 'Diary Study', 'Card Sort', 'A/B Test'], label: 'Research Method' },
      participant_count: { type: 'number', label: 'Participant Count' },
      confidence: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Confidence Level' },
      tags: { type: 'string', label: 'Tags (comma-separated)' },
    },
  },
  EmpathyMap: {
    id: 'EmpathyMap',
    name: 'Empathy Map',
    prefix: 'EM',
    color: '#be185d',
    icon: 'heart',
    discipline: 'design',
    module: 'design',
    description: 'Thinks/Feels/Says/Does quadrant for a persona',
    fields: {
      name: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Context' },
      thinks: { type: 'text', label: 'Thinks (internal thoughts)' },
      feels: { type: 'text', label: 'Feels (emotions)' },
      says: { type: 'text', label: 'Says (quotes, statements)' },
      does: { type: 'text', label: 'Does (actions, behaviors)' },
      pains: { type: 'text', label: 'Pains' },
      gains: { type: 'text', label: 'Gains' },
    },
  },
  ServiceBlueprint: {
    id: 'ServiceBlueprint',
    name: 'Service Blueprint',
    prefix: 'SBP',
    color: '#9d174d',
    icon: 'layers',
    discipline: 'design',
    module: 'design',
    description: 'Frontstage/backstage/support process for a service',
    fields: {
      name: { type: 'string', required: true, label: 'Service Name' },
      description: { type: 'text', label: 'Description' },
      customer_actions: { type: 'text', label: 'Customer Actions (frontstage)' },
      frontstage_actions: { type: 'text', label: 'Employee Actions (frontstage)' },
      backstage_actions: { type: 'text', label: 'Employee Actions (backstage)' },
      support_processes: { type: 'text', label: 'Support Processes' },
      physical_evidence: { type: 'text', label: 'Physical Evidence' },
      pain_points: { type: 'text', label: 'Pain Points' },
    },
  },
  InformationArchitecture: {
    id: 'InformationArchitecture',
    name: 'Information Architecture',
    prefix: 'IA',
    color: '#831843',
    icon: 'sitemap',
    discipline: 'design',
    module: 'design',
    description: 'Site map or navigation structure element',
    fields: {
      name: { type: 'string', required: true, label: 'Page / Section Name' },
      description: { type: 'text', label: 'Description' },
      page_type: { type: 'select', options: ['Home', 'Landing', 'Category', 'Detail', 'Form', 'Dashboard', 'Settings', 'Help'], label: 'Page Type' },
      parent_page: { type: 'string', label: 'Parent Page' },
      navigation_label: { type: 'string', label: 'Navigation Label' },
      content_types: { type: 'string', label: 'Content Types Displayed' },
    },
  },
  InteractionFlow: {
    id: 'InteractionFlow',
    name: 'Interaction Flow',
    prefix: 'IF',
    color: '#701a75',
    icon: 'git-commit',
    discipline: 'design',
    module: 'design',
    description: 'Sequence of wireframe states showing navigation path',
    fields: {
      name: { type: 'string', required: true, label: 'Flow Name' },
      description: { type: 'text', label: 'Description' },
      trigger: { type: 'string', label: 'Trigger Event' },
      steps: { type: 'json', label: 'Steps (JSON array: [{screen, action, result}])' },
      happy_path: { type: 'text', label: 'Happy Path Description' },
      error_paths: { type: 'text', label: 'Error / Edge Case Paths' },
    },
  },

  // ── Testing Discipline (4 types) ───────────────────────────────────────────
  TestCase: {
    id: 'TestCase',
    name: 'Test Case',
    prefix: 'TST',
    color: '#22c55e',
    icon: 'check-square',
    discipline: 'testing',
    module: 'testing',
    description: 'Structured test: preconditions, steps, expected results',
    fields: {
      name: { type: 'string', required: true, label: 'Test Case Title' },
      description: { type: 'text', label: 'Description' },
      test_type: { type: 'select', options: ['Functional', 'Integration', 'Regression', 'Smoke', 'Performance', 'Security'], label: 'Test Type' },
      preconditions: { type: 'text', label: 'Preconditions' },
      steps: { type: 'json', label: 'Test Steps (JSON array: [{step, action, expected}])' },
      expected_result: { type: 'text', label: 'Overall Expected Result' },
      actual_result: { type: 'text', label: 'Actual Result' },
      pass_fail: { type: 'select', options: ['Not Run', 'Pass', 'Fail', 'Blocked', 'Skipped'], label: 'Result' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Priority' },
    },
  },
  TestSuite: {
    id: 'TestSuite',
    name: 'Test Suite',
    prefix: 'TSS',
    color: '#16a34a',
    icon: 'folder-check',
    discipline: 'testing',
    module: 'testing',
    description: 'Grouped test cases by feature, release, or regression',
    fields: {
      name: { type: 'string', required: true, label: 'Suite Name' },
      description: { type: 'text', label: 'Description' },
      suite_type: { type: 'select', options: ['Feature', 'Release', 'Regression', 'Smoke', 'Integration'], label: 'Suite Type' },
      execution_order: { type: 'select', options: ['Sequential', 'Parallel', 'Any'], label: 'Execution Order' },
      environment: { type: 'string', label: 'Target Environment' },
    },
  },
  TestRun: {
    id: 'TestRun',
    name: 'Test Run',
    prefix: 'TR',
    color: '#059669',
    icon: 'play-circle',
    discipline: 'testing',
    module: 'testing',
    description: 'Execution record of a test suite against a specific build/environment',
    fields: {
      name: { type: 'string', required: true, label: 'Run Name' },
      description: { type: 'text', label: 'Description' },
      suite_id: { type: 'string', label: 'Test Suite ID' },
      environment: { type: 'string', label: 'Environment' },
      build_version: { type: 'string', label: 'Build / Version' },
      run_date: { type: 'date', label: 'Run Date' },
      run_status: { type: 'select', options: ['Planned', 'In Progress', 'Completed', 'Aborted'], label: 'Run Status' },
      total_cases: { type: 'number', label: 'Total Cases' },
      passed: { type: 'number', label: 'Passed' },
      failed: { type: 'number', label: 'Failed' },
      blocked: { type: 'number', label: 'Blocked' },
      skipped: { type: 'number', label: 'Skipped' },
      pass_rate: { type: 'number', label: 'Pass Rate (%)' },
      notes: { type: 'text', label: 'Execution Notes' },
    },
  },
  UsabilityTest: {
    id: 'UsabilityTest',
    name: 'Usability Test',
    prefix: 'UT',
    color: '#15803d',
    icon: 'eye',
    discipline: 'testing',
    module: 'testing',
    description: 'Structured usability test plan and results',
    fields: {
      name: { type: 'string', required: true, label: 'Test Plan Title' },
      description: { type: 'text', label: 'Test Objective' },
      methodology: { type: 'select', options: ['Moderated Remote', 'Unmoderated Remote', 'In-Person', 'Guerrilla', 'A/B Test'], label: 'Methodology' },
      tasks: { type: 'json', label: 'Tasks (JSON array: [{task, success_criteria, time_limit}])' },
      participant_criteria: { type: 'text', label: 'Participant Criteria' },
      participant_count: { type: 'number', label: 'Number of Participants' },
      success_rate: { type: 'number', label: 'Success Rate (%)' },
      key_findings: { type: 'text', label: 'Key Findings' },
    },
  },
  AccessibilityAudit: {
    id: 'AccessibilityAudit',
    name: 'Accessibility Audit',
    prefix: 'AA',
    color: '#166534',
    icon: 'accessibility',
    discipline: 'testing',
    module: 'testing',
    description: 'WCAG compliance check with findings and remediation',
    fields: {
      name: { type: 'string', required: true, label: 'Audit Title' },
      description: { type: 'text', label: 'Scope of Audit' },
      wcag_level: { type: 'select', options: ['A', 'AA', 'AAA'], label: 'WCAG Target Level' },
      criteria_checked: { type: 'number', label: 'Criteria Checked' },
      criteria_passed: { type: 'number', label: 'Criteria Passed' },
      critical_issues: { type: 'text', label: 'Critical Issues' },
      recommendations: { type: 'text', label: 'Remediation Recommendations' },
      tools_used: { type: 'string', label: 'Tools Used (axe, WAVE, etc.)' },
    },
  },

  // ── Cross-Cutting (2 types) ────────────────────────────────────────────────
  Stakeholder: {
    id: 'Stakeholder',
    name: 'Stakeholder',
    prefix: 'STK',
    color: '#64748b',
    icon: 'user-check',
    discipline: 'crosscutting',
    module: 'crosscutting',
    description: 'Person or role with interest in the analysis project',
    fields: {
      name: { type: 'string', required: true, label: 'Name / Role' },
      description: { type: 'text', label: 'Description' },
      organization: { type: 'string', label: 'Organization' },
      influence: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Influence Level' },
      interest: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Interest Level' },
      communication_preference: { type: 'select', options: ['Email', 'Meeting', 'Report', 'Dashboard'], label: 'Communication Preference' },
    },
  },
  ReviewRecord: {
    id: 'ReviewRecord',
    name: 'Review Record',
    prefix: 'RR',
    color: '#475569',
    icon: 'clipboard-check',
    discipline: 'crosscutting',
    module: 'crosscutting',
    description: 'Formal review with decision, conditions, and sign-off',
    fields: {
      name: { type: 'string', required: true, label: 'Review Title' },
      description: { type: 'text', label: 'Review Scope' },
      review_type: { type: 'select', options: ['Requirements Review', 'Architecture Review', 'Design Review', 'Data Review', 'Test Review', 'Gate Review'], label: 'Review Type' },
      reviewers: { type: 'string', label: 'Reviewers (comma-separated)' },
      decision: { type: 'select', options: ['Approved', 'Approved with Conditions', 'Revisions Required', 'Rejected'], label: 'Decision' },
      conditions: { type: 'text', label: 'Conditions / Action Items' },
      review_date: { type: 'date', label: 'Review Date' },
    },
  },
};

// ============================================================================
// PREFIX LOOKUP MAP (for API route number generation)
// ============================================================================

export const ARTEFACT_PREFIX_MAP = Object.fromEntries(
  Object.entries(ANALYSIS_ARTEFACT_TYPES).map(([key, val]) => [key, val.prefix])
);

// ============================================================================
// MODULE DEFINITIONS (groups for navigation)
// ============================================================================

export const ANALYSIS_MODULES = {
  requirements: {
    id: 'requirements',
    name: 'Requirements',
    description: 'Capture and manage functional and non-functional requirements',
    icon: 'clipboard',
    color: '#8b5cf6',
    artefactTypes: ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'NonFunctionalRequirement', 'BusinessRule', 'UseCase'],
  },
  stories: {
    id: 'stories',
    name: 'User Stories',
    description: 'Plan delivery through epics, features, and stories',
    icon: 'file-text',
    color: '#06b6d4',
    artefactTypes: ['Epic', 'Feature', 'UserStory'],
  },
  architecture: {
    id: 'architecture',
    name: 'System Architecture',
    description: 'Solution-level C4 models, ADRs, quality attributes, threats',
    icon: 'layers',
    color: '#f59e0b',
    artefactTypes: ['ADR', 'Component', 'TechnologyChoice', 'QualityAttribute', 'IntegrationPattern', 'ThreatModel', 'InfrastructureView'],
  },
  data: {
    id: 'data',
    name: 'Data Architecture',
    description: 'Conceptual/logical models, contracts, flows, lineage',
    icon: 'database',
    color: '#14b8a6',
    artefactTypes: ['ConceptualEntity', 'LogicalDataModel', 'DataFlow', 'DataContract', 'DataDictionaryEntry', 'DataQualityRule', 'DataClassification', 'DataLineage'],
  },
  design: {
    id: 'design',
    name: 'UX/UI Design',
    description: 'Personas, journeys, wireframes, research, service blueprints',
    icon: 'palette',
    color: '#ec4899',
    artefactTypes: ['Persona', 'Journey', 'Wireframe', 'DesignDecision', 'ResearchFinding', 'EmpathyMap', 'ServiceBlueprint', 'InformationArchitecture', 'InteractionFlow'],
  },
  testing: {
    id: 'testing',
    name: 'Testing',
    description: 'Test cases, suites, usability tests, accessibility audits',
    icon: 'check-square',
    color: '#22c55e',
    artefactTypes: ['TestCase', 'TestSuite', 'TestRun', 'UsabilityTest', 'AccessibilityAudit'],
  },
  crosscutting: {
    id: 'crosscutting',
    name: 'Cross-Cutting',
    description: 'Stakeholders, reviews, and governance',
    icon: 'link',
    color: '#64748b',
    artefactTypes: ['Stakeholder', 'ReviewRecord'],
  },
};

// ============================================================================
// ANALYSIS PROJECT TYPE
// ============================================================================

export const ANALYSIS_PROJECT_TYPE = {
  id: 'AnalysisProject',
  name: 'Analysis Project',
  prefix: 'AN',
  description: 'Bridges initiatives (what we want to achieve) with delivery projects (how we deliver it)',
  color: '#47453F',
  icon: 'clipboard',
  fields: {
    name: { type: 'string', required: true },
    description: { type: 'text' },
    status: { type: 'select', options: ['Draft', 'In Analysis', 'In Review', 'Approved', 'On Hold', 'Completed'] },
    priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
    analysis_profile: { type: 'select', options: ['Full', 'Standard', 'Lite'] },
    linkedInitiatives: { type: 'relation', target: 'Initiative' },
    linkedProjects: { type: 'relation', target: 'PDSProject' },
    businessOwner: { type: 'stakeholder' },
    technicalOwner: { type: 'stakeholder' },
    startDate: { type: 'date' },
    targetDate: { type: 'date' },
  },
};

// ============================================================================
// TRACEABILITY METAMODEL
// ============================================================================
// Defines which artefact types can relate to which, with typed directional
// relationships. Format: { fromType: { toType: [relationshipTypes] } }

export const ANALYSIS_METAMODEL = {
  // ── Requirements → Other Disciplines ───────────────────────────────────────
  BusinessRequirement: {
    StakeholderRequirement: ['decomposes_to', 'traces_to'],
    SolutionRequirement: ['traces_to'],
    NonFunctionalRequirement: ['includes'],
    UserStory: ['traces_to'],
    BusinessRule: ['governed_by'],
    ADR: ['informs'],
    QualityAttribute: ['quantified_by'],
    TestCase: ['verified_by'],
    Stakeholder: ['owned_by'],
  },
  StakeholderRequirement: {
    SolutionRequirement: ['decomposes_to', 'traces_to'],
    UserStory: ['traces_to'],
    Persona: ['associated_with'],
    TestCase: ['verified_by'],
  },
  SolutionRequirement: {
    UserStory: ['implemented_by'],
    Component: ['realized_by'],
    ADR: ['drives'],
    LogicalDataModel: ['specifies_data'],
    TestCase: ['verified_by'],
  },
  NonFunctionalRequirement: {
    QualityAttribute: ['quantifies'],
    Component: ['constrains'],
    TestCase: ['verified_by'],
  },
  BusinessRule: {
    SolutionRequirement: ['constrains'],
    Component: ['enforced_by'],
    TestCase: ['verified_by'],
  },
  UseCase: {
    UserStory: ['implemented_by'],
    Wireframe: ['visualized_by'],
    Persona: ['involves'],
    InteractionFlow: ['detailed_by'],
    TestCase: ['verified_by'],
  },

  // ── Stories → Other Disciplines ────────────────────────────────────────────
  Epic: {
    Feature: ['contains'],
    UserStory: ['contains'],
    Component: ['touches'],
  },
  Feature: {
    UserStory: ['contains'],
    Component: ['touches'],
    TestSuite: ['tested_by'],
  },
  UserStory: {
    ADR: ['informs'],
    Component: ['touches'],
    Wireframe: ['visualized_by'],
    TestCase: ['verified_by'],
    DataDictionaryEntry: ['uses_data'],
  },

  // ── Architecture → Other Disciplines ───────────────────────────────────────
  ADR: {
    Component: ['affects'],
    TechnologyChoice: ['selects'],
    QualityAttribute: ['addresses'],
  },
  Component: {
    DataContract: ['consumes', 'produces'],
    IntegrationPattern: ['connects_via'],
    ThreatModel: ['threatened_by'],
    InfrastructureView: ['deployed_on'],
    DataFlow: ['participates_in'],
  },
  QualityAttribute: {
    ADR: ['drives'],
    Component: ['constrains'],
    TestCase: ['verified_by'],
  },
  ThreatModel: {
    QualityAttribute: ['threatens'],
    ADR: ['mitigated_by'],
    Component: ['targets'],
  },
  IntegrationPattern: {
    Component: ['connects'],
    DataContract: ['governed_by'],
    DataFlow: ['implements'],
  },
  TechnologyChoice: {
    Component: ['used_by'],
  },
  InfrastructureView: {
    Component: ['hosts'],
  },

  // ── Data Architecture → Other Disciplines ──────────────────────────────────
  ConceptualEntity: {
    LogicalDataModel: ['implemented_by'],
    DataDictionaryEntry: ['defined_by'],
    ConceptualEntity: ['relates_to'],
  },
  LogicalDataModel: {
    DataDictionaryEntry: ['contains_element'],
    DataContract: ['governed_by'],
    Component: ['stored_in'],
  },
  DataFlow: {
    Component: ['connects'],
    DataContract: ['governed_by'],
    LogicalDataModel: ['moves_data_from'],
  },
  DataContract: {
    LogicalDataModel: ['defines_schema'],
    DataQualityRule: ['enforces'],
    DataDictionaryEntry: ['references'],
  },
  DataDictionaryEntry: {
    DataClassification: ['classified_as'],
    DataQualityRule: ['validated_by'],
    Wireframe: ['displayed_on'],
  },
  DataQualityRule: {
    LogicalDataModel: ['applies_to'],
  },
  DataClassification: {
    LogicalDataModel: ['applies_to'],
    ConceptualEntity: ['classifies'],
  },
  DataLineage: {
    DataFlow: ['composed_of'],
    ConceptualEntity: ['tracks'],
    Component: ['passes_through'],
  },

  // ── UX/UI Design → Other Disciplines ───────────────────────────────────────
  Persona: {
    Journey: ['experiences'],
    UserStory: ['benefits_from'],
    EmpathyMap: ['profiled_in'],
  },
  Journey: {
    Wireframe: ['includes'],
    UserStory: ['contains_step'],
    ServiceBlueprint: ['detailed_by'],
    DataFlow: ['produces'],
    UsabilityTest: ['tested_by'],
  },
  Wireframe: {
    DataDictionaryEntry: ['displays'],
    InteractionFlow: ['part_of'],
    AccessibilityAudit: ['audited_by'],
  },
  DesignDecision: {
    Wireframe: ['affects'],
    Journey: ['affects'],
    ADR: ['related_to'],
  },
  ResearchFinding: {
    Persona: ['informs'],
    Journey: ['informs'],
    DesignDecision: ['supports'],
  },
  EmpathyMap: {
    Persona: ['profiles'],
    ResearchFinding: ['synthesizes'],
  },
  ServiceBlueprint: {
    Component: ['implemented_by'],
    Wireframe: ['frontstage_includes'],
    Journey: ['extends'],
  },
  InformationArchitecture: {
    Wireframe: ['implemented_by'],
    DataDictionaryEntry: ['displays'],
    ConceptualEntity: ['navigates_to'],
  },
  InteractionFlow: {
    Wireframe: ['transitions_between'],
    UserStory: ['implements'],
    UseCase: ['details'],
  },

  // ── Testing → Other Disciplines ────────────────────────────────────────────
  TestCase: {
    SolutionRequirement: ['verifies'],
    UserStory: ['verifies'],
    Component: ['exercises'],
    DataContract: ['validates'],
  },
  TestSuite: {
    TestCase: ['contains'],
    Feature: ['covers'],
  },
  TestRun: {
    TestSuite: ['executes'],
    TestCase: ['includes_result_for'],
  },
  UsabilityTest: {
    Journey: ['tests'],
    Wireframe: ['evaluates'],
    ResearchFinding: ['produces'],
  },
  AccessibilityAudit: {
    Wireframe: ['audits'],
    SolutionRequirement: ['generates_requirement'],
  },

  // ── Cross-Cutting → Other Disciplines ──────────────────────────────────────
  Stakeholder: {
    BusinessRequirement: ['owns'],
    ReviewRecord: ['participates_in'],
  },
  ReviewRecord: {
    // ReviewRecords link to any artefact type — validated separately
  },
};

// ============================================================================
// ALL RELATIONSHIP TYPES (for validation and UI dropdowns)
// ============================================================================

export const RELATIONSHIP_TYPE_LABELS = {
  decomposes_to: 'Decomposes To',
  traces_to: 'Traces To',
  includes: 'Includes',
  governed_by: 'Governed By',
  informs: 'Informs',
  quantified_by: 'Quantified By',
  verified_by: 'Verified By',
  owned_by: 'Owned By',
  associated_with: 'Associated With',
  implemented_by: 'Implemented By',
  realized_by: 'Realized By',
  drives: 'Drives',
  specifies_data: 'Specifies Data',
  quantifies: 'Quantifies',
  constrains: 'Constrains',
  enforced_by: 'Enforced By',
  involves: 'Involves',
  visualized_by: 'Visualized By',
  detailed_by: 'Detailed By',
  contains: 'Contains',
  touches: 'Touches',
  tested_by: 'Tested By',
  uses_data: 'Uses Data',
  affects: 'Affects',
  selects: 'Selects',
  addresses: 'Addresses',
  consumes: 'Consumes',
  produces: 'Produces',
  connects_via: 'Connects Via',
  threatened_by: 'Threatened By',
  deployed_on: 'Deployed On',
  participates_in: 'Participates In',
  threatens: 'Threatens',
  mitigated_by: 'Mitigated By',
  targets: 'Targets',
  connects: 'Connects',
  implements: 'Implements',
  used_by: 'Used By',
  hosts: 'Hosts',
  relates_to: 'Relates To',
  defined_by: 'Defined By',
  contains_element: 'Contains Element',
  stored_in: 'Stored In',
  moves_data_from: 'Moves Data From',
  defines_schema: 'Defines Schema',
  enforces: 'Enforces',
  references: 'References',
  classified_as: 'Classified As',
  validated_by: 'Validated By',
  displayed_on: 'Displayed On',
  applies_to: 'Applies To',
  classifies: 'Classifies',
  composed_of: 'Composed Of',
  tracks: 'Tracks',
  passes_through: 'Passes Through',
  experiences: 'Experiences',
  benefits_from: 'Benefits From',
  profiled_in: 'Profiled In',
  contains_step: 'Contains Step',
  part_of: 'Part Of',
  audited_by: 'Audited By',
  related_to: 'Related To',
  supports: 'Supports',
  synthesizes: 'Synthesizes',
  frontstage_includes: 'Frontstage Includes',
  extends: 'Extends',
  navigates_to: 'Navigates To',
  transitions_between: 'Transitions Between',
  details: 'Details',
  verifies: 'Verifies',
  exercises: 'Exercises',
  validates: 'Validates',
  covers: 'Covers',
  tests: 'Tests',
  evaluates: 'Evaluates',
  owns: 'Owns',
  generates_requirement: 'Generates Requirement',
  profiles: 'Profiles',
  displayed: 'Displayed',
};

// ============================================================================
// COVERAGE RULES (what "covered" means per artefact type)
// ============================================================================

export const COVERAGE_RULES = {
  // Requirements: covered if decomposed to SL AND has at least 1 test
  BusinessRequirement: {
    rules: [
      { id: 'has_solution_req', label: 'Has Solution Requirement', check: (rels) => rels.some(r => r.toType === 'SolutionRequirement') },
      { id: 'has_test', label: 'Has Test Case', check: (rels) => rels.some(r => r.toType === 'TestCase') },
    ],
    minimumRules: 2,
  },
  StakeholderRequirement: {
    rules: [
      { id: 'has_solution_req', label: 'Has Solution Requirement', check: (rels) => rels.some(r => r.toType === 'SolutionRequirement') },
    ],
    minimumRules: 1,
  },
  SolutionRequirement: {
    rules: [
      { id: 'has_story', label: 'Has User Story', check: (rels) => rels.some(r => r.toType === 'UserStory') },
      { id: 'has_test', label: 'Has Test Case', check: (rels) => rels.some(r => r.toType === 'TestCase') },
      { id: 'has_component', label: 'Has Component', check: (rels) => rels.some(r => r.toType === 'Component') },
    ],
    minimumRules: 2,
  },
  NonFunctionalRequirement: {
    rules: [
      { id: 'has_qaw', label: 'Has Quality Attribute', check: (rels) => rels.some(r => r.toType === 'QualityAttribute') },
      { id: 'has_test', label: 'Has Test Case', check: (rels) => rels.some(r => r.toType === 'TestCase') },
    ],
    minimumRules: 1,
  },
  UserStory: {
    rules: [
      { id: 'has_test', label: 'Has Test Case', check: (rels) => rels.some(r => r.toType === 'TestCase') },
      { id: 'has_wireframe', label: 'Has Wireframe', check: (rels) => rels.some(r => r.toType === 'Wireframe') },
    ],
    minimumRules: 1,
  },

  // Architecture: covered if connected to requirements and data
  Component: {
    rules: [
      { id: 'has_adr', label: 'Has ADR', check: (rels) => rels.some(r => r.fromType === 'ADR' || r.toType === 'ADR') },
      { id: 'has_threat', label: 'Has Threat Model', check: (rels) => rels.some(r => r.fromType === 'ThreatModel' || r.toType === 'ThreatModel') },
    ],
    minimumRules: 1,
  },
  QualityAttribute: {
    rules: [
      { id: 'has_nfr', label: 'Linked to NFR', check: (rels) => rels.some(r => r.fromType === 'NonFunctionalRequirement') },
      { id: 'has_test', label: 'Has Test Case', check: (rels) => rels.some(r => r.toType === 'TestCase') },
    ],
    minimumRules: 1,
  },

  // Data: covered if defined and quality-checked
  ConceptualEntity: {
    rules: [
      { id: 'has_ldm', label: 'Has Logical Model', check: (rels) => rels.some(r => r.toType === 'LogicalDataModel') },
      { id: 'has_dde', label: 'Has Dictionary Entry', check: (rels) => rels.some(r => r.toType === 'DataDictionaryEntry') },
    ],
    minimumRules: 1,
  },
  DataContract: {
    rules: [
      { id: 'has_schema', label: 'Has Schema (LDM)', check: (rels) => rels.some(r => r.toType === 'LogicalDataModel') },
      { id: 'has_quality', label: 'Has Quality Rule', check: (rels) => rels.some(r => r.toType === 'DataQualityRule') },
    ],
    minimumRules: 1,
  },

  // Design: covered if linked to requirements and tested
  Persona: {
    rules: [
      { id: 'has_journey', label: 'Has Journey', check: (rels) => rels.some(r => r.toType === 'Journey') },
    ],
    minimumRules: 1,
  },
  Journey: {
    rules: [
      { id: 'has_wireframe', label: 'Has Wireframe', check: (rels) => rels.some(r => r.toType === 'Wireframe') },
      { id: 'has_usability', label: 'Has Usability Test', check: (rels) => rels.some(r => r.toType === 'UsabilityTest') },
    ],
    minimumRules: 1,
  },
  Wireframe: {
    rules: [
      { id: 'has_story', label: 'Linked to Story', check: (rels) => rels.some(r => r.fromType === 'UserStory') },
      { id: 'has_accessibility', label: 'Has Accessibility Audit', check: (rels) => rels.some(r => r.toType === 'AccessibilityAudit') },
    ],
    minimumRules: 1,
  },
};

// ============================================================================
// ANALYSIS PROFILES (activate different subsets of disciplines)
// ============================================================================

export const ANALYSIS_PROFILES = {
  Full: {
    id: 'Full',
    name: 'Full Analysis',
    description: 'All 5 disciplines active — for complex, high-risk initiatives',
    disciplines: ['requirements', 'stories', 'architecture', 'data', 'design', 'testing', 'crosscutting'],
    requiredTypes: ['BusinessRequirement', 'SolutionRequirement', 'UserStory', 'ADR', 'Component', 'ConceptualEntity', 'Persona', 'Journey', 'TestCase'],
  },
  Standard: {
    id: 'Standard',
    name: 'Standard Analysis',
    description: 'Requirements + Stories + Architecture + Testing — for typical projects',
    disciplines: ['requirements', 'stories', 'architecture', 'testing', 'crosscutting'],
    requiredTypes: ['BusinessRequirement', 'SolutionRequirement', 'UserStory', 'ADR', 'TestCase'],
  },
  Lite: {
    id: 'Lite',
    name: 'Lite Analysis',
    description: 'Requirements + Stories only — for small changes or spikes',
    disciplines: ['requirements', 'stories', 'crosscutting'],
    requiredTypes: ['BusinessRequirement', 'UserStory'],
  },
};

// ============================================================================
// COMPLETENESS RULES (per-project scoring)
// ============================================================================

export const COMPLETENESS_RULES = {
  analysisProject: [
    { id: 'hasBusinessRequirements', check: (p, a) => a.filter(x => x.artefactType === 'BusinessRequirement').length > 0, weight: 15, message: 'Define at least one business requirement' },
    { id: 'hasStakeholders', check: (p, a) => a.filter(x => x.artefactType === 'Stakeholder').length > 0, weight: 10, message: 'Identify key stakeholders' },
    { id: 'hasSolutionRequirements', check: (p, a) => a.filter(x => x.artefactType === 'SolutionRequirement').length > 0, weight: 15, message: 'Define solution requirements' },
    { id: 'hasUserStories', check: (p, a) => a.filter(x => x.artefactType === 'UserStory').length > 0, weight: 10, message: 'Create user stories for delivery' },
    { id: 'hasADR', check: (p, a) => a.filter(x => x.artefactType === 'ADR').length > 0, weight: 10, message: 'Document key architecture decisions' },
    { id: 'hasPersona', check: (p, a) => a.filter(x => x.artefactType === 'Persona').length > 0, weight: 5, message: 'Define user personas' },
    { id: 'hasTestCase', check: (p, a) => a.filter(x => x.artefactType === 'TestCase').length > 0, weight: 10, message: 'Create test cases for verification' },
    { id: 'hasDataModel', check: (p, a) => a.filter(x => x.artefactType === 'ConceptualEntity' || x.artefactType === 'LogicalDataModel').length > 0, weight: 10, message: 'Define data model' },
    { id: 'hasLinkedInitiative', check: (p, _) => p.linkedInitiatives?.length > 0, weight: 10, message: 'Link to strategic initiative' },
    { id: 'hasLinkedProject', check: (p, _) => p.linkedProjects?.length > 0, weight: 5, message: 'Link to delivery project' },
  ],
};

// ============================================================================
// QUALITY GATES (per-discipline)
// ============================================================================

export const QUALITY_GATES = {
  requirements: {
    name: 'Requirements Gate',
    checks: [
      { id: 'all_brs_have_ids', label: 'All BRs have reference numbers', severity: 'error' },
      { id: 'all_brs_classified', label: 'All BRs have priority', severity: 'error' },
      { id: 'all_srs_have_acceptance', label: 'All SRs have acceptance criteria', severity: 'warning' },
      { id: 'all_brs_traced_to_sr', label: 'All BRs traced to at least one SR', severity: 'error' },
      { id: 'quality_checks_pass', label: 'No ambiguous requirements flagged', severity: 'warning' },
    ],
  },
  architecture: {
    name: 'Architecture Gate',
    checks: [
      { id: 'has_c4_context', label: 'C4 Context diagram complete', severity: 'error' },
      { id: 'all_components_have_adr', label: 'Key components have ADRs', severity: 'warning' },
      { id: 'qaw_scenarios_defined', label: 'Quality attribute scenarios defined', severity: 'warning' },
      { id: 'threat_model_complete', label: 'Threat model covers all boundaries', severity: 'warning' },
    ],
  },
  data: {
    name: 'Data Architecture Gate',
    checks: [
      { id: 'conceptual_model_exists', label: 'Conceptual data model defined', severity: 'error' },
      { id: 'dictionary_entries_exist', label: 'Data dictionary has entries', severity: 'warning' },
      { id: 'data_flows_documented', label: 'Data flows documented', severity: 'warning' },
      { id: 'contracts_defined', label: 'Data contracts defined for integrations', severity: 'warning' },
    ],
  },
  design: {
    name: 'UX/UI Design Gate',
    checks: [
      { id: 'personas_with_journeys', label: 'All personas have journeys', severity: 'error' },
      { id: 'stories_have_wireframes', label: 'Key stories have wireframes', severity: 'warning' },
      { id: 'accessibility_reviewed', label: 'Accessibility audit completed', severity: 'warning' },
    ],
  },
  testing: {
    name: 'Testing Gate',
    checks: [
      { id: 'coverage_threshold', label: 'Requirements test coverage > 80%', severity: 'error' },
      { id: 'all_critical_tested', label: 'All Critical requirements have tests', severity: 'error' },
      { id: 'usability_tested', label: 'Key journeys have usability tests', severity: 'warning' },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get artefact types for a discipline
 * @param {string} disciplineId - Discipline ID
 * @returns {Object[]} Array of artefact type definitions
 */
export function getTypesByDiscipline(disciplineId) {
  return Object.values(ANALYSIS_ARTEFACT_TYPES).filter(t => t.discipline === disciplineId);
}

/**
 * Get artefact types for a module
 * @param {string} moduleId - Module ID
 * @returns {string[]} Array of artefact type IDs
 */
export function getTypeIdsByModule(moduleId) {
  const module = ANALYSIS_MODULES[moduleId];
  return module ? module.artefactTypes : [];
}

/**
 * Get valid relationship types between two artefact types
 * @param {string} fromType - Source artefact type ID
 * @param {string} toType - Target artefact type ID
 * @returns {string[]} Array of valid relationship type names
 */
export function getValidRelationships(fromType, toType) {
  const fromRules = ANALYSIS_METAMODEL[fromType];
  if (!fromRules) return [];
  return fromRules[toType] || [];
}

/**
 * Check if a relationship is valid per the metamodel
 * @param {string} fromType - Source artefact type ID
 * @param {string} toType - Target artefact type ID
 * @param {string} relationshipType - Relationship type name
 * @returns {{valid: boolean, error?: string}}
 */
export function validateMetamodelRelationship(fromType, toType, relationshipType) {
  const validTypes = getValidRelationships(fromType, toType);

  if (validTypes.length === 0) {
    return {
      valid: false,
      error: `No relationships allowed from ${fromType} to ${toType} in the metamodel`,
    };
  }

  if (!validTypes.includes(relationshipType)) {
    return {
      valid: false,
      error: `Relationship '${relationshipType}' is not valid between ${fromType} and ${toType}. Valid: ${validTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Check coverage for an artefact based on its relationships
 * @param {string} artefactType - Artefact type ID
 * @param {Object[]} relationships - Relationships involving this artefact
 * @returns {{covered: boolean, score: number, results: Object[]}}
 */
export function checkCoverage(artefactType, relationships) {
  const rules = COVERAGE_RULES[artefactType];
  if (!rules) return { covered: true, score: 100, results: [] };

  const results = rules.rules.map(rule => ({
    ...rule,
    passed: rule.check(relationships),
  }));

  const passedCount = results.filter(r => r.passed).length;
  const score = Math.round((passedCount / rules.rules.length) * 100);
  const covered = passedCount >= rules.minimumRules;

  return { covered, score, results };
}

/**
 * Get disciplines active for a given analysis profile
 * @param {string} profileId - Profile ID (Full, Standard, Lite)
 * @returns {string[]} Active discipline IDs
 */
export function getActiveDisciplines(profileId) {
  const profile = ANALYSIS_PROFILES[profileId];
  return profile ? profile.disciplines : ANALYSIS_PROFILES.Full.disciplines;
}

/**
 * Get modules active for a given analysis profile
 * @param {string} profileId - Profile ID
 * @returns {Object} Filtered ANALYSIS_MODULES
 */
export function getActiveModules(profileId) {
  const disciplines = getActiveDisciplines(profileId);
  const result = {};
  for (const [key, mod] of Object.entries(ANALYSIS_MODULES)) {
    if (disciplines.includes(key)) {
      result[key] = mod;
    }
  }
  return result;
}
