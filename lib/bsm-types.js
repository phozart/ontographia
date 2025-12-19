/**
 * Business Service Management Studio - Type Definitions
 *
 * Defines artefact types, stages, relationships, and utilities for
 * modeling business services, service levels, consumers, and dependencies.
 *
 * @module lib/bsm-types
 *
 * Design Principles:
 * - Services are WHAT the organization delivers to consumers
 * - Services bridge capabilities to operational delivery
 * - Service levels define quality commitments (SLAs/SLOs)
 * - Dependencies map how services rely on each other
 */

// ============================================================================
// STAGES - Logical groupings of work in service management
// ============================================================================

export const BSM_STAGES = {
  catalog: {
    id: 'catalog',
    name: 'Service Catalog',
    description: 'Define and catalog business services',
    color: '#3b82f6',
    types: ['bsm_service', 'bsm_service_category'],
  },
  levels: {
    id: 'levels',
    name: 'Service Levels',
    description: 'Define SLAs, SLOs, and service commitments',
    color: '#8b5cf6',
    types: ['bsm_service_level', 'bsm_sla', 'bsm_slo'],
  },
  consumers: {
    id: 'consumers',
    name: 'Consumers',
    description: 'Identify and manage service consumers',
    color: '#22c55e',
    types: ['bsm_consumer', 'bsm_consumer_agreement'],
  },
  dependencies: {
    id: 'dependencies',
    name: 'Dependencies',
    description: 'Map service dependencies and integrations',
    color: '#f59e0b',
    types: ['bsm_dependency', 'bsm_integration'],
  },
};

// ============================================================================
// ENUMS AND OPTIONS
// ============================================================================

export const BSM_SERVICE_STATUS = [
  { id: 'draft', label: 'Draft', description: 'Service under design', color: '#6b7280' },
  { id: 'planned', label: 'Planned', description: 'Approved for development', color: '#3b82f6' },
  { id: 'active', label: 'Active', description: 'Service is operational', color: '#22c55e' },
  { id: 'deprecated', label: 'Deprecated', description: 'Being phased out', color: '#f59e0b' },
  { id: 'retired', label: 'Retired', description: 'No longer available', color: '#ef4444' },
];

export const BSM_SERVICE_CRITICALITY = [
  { id: 'low', label: 'Low', description: 'Minimal business impact', color: '#22c55e' },
  { id: 'medium', label: 'Medium', description: 'Moderate business impact', color: '#eab308' },
  { id: 'high', label: 'High', description: 'Significant business impact', color: '#f97316' },
  { id: 'critical', label: 'Critical', description: 'Business critical', color: '#ef4444' },
];

export const BSM_SERVICE_TYPE = [
  { id: 'business', label: 'Business Service', description: 'Delivers business value directly' },
  { id: 'supporting', label: 'Supporting Service', description: 'Enables other services' },
  { id: 'technical', label: 'Technical Service', description: 'Infrastructure or technical capability' },
  { id: 'shared', label: 'Shared Service', description: 'Used across multiple consumers' },
];

export const BSM_CONSUMER_TYPE = [
  { id: 'internal', label: 'Internal', description: 'Within the organization' },
  { id: 'external', label: 'External', description: 'Outside the organization' },
  { id: 'partner', label: 'Partner', description: 'Business partner' },
  { id: 'customer', label: 'Customer', description: 'End customer' },
];

export const BSM_DEPENDENCY_TYPE = [
  { id: 'required', label: 'Required', description: 'Service cannot function without' },
  { id: 'optional', label: 'Optional', description: 'Enhances but not required' },
  { id: 'fallback', label: 'Fallback', description: 'Used when primary unavailable' },
];

export const BSM_SLA_METRIC_TYPE = [
  { id: 'availability', label: 'Availability', description: 'Uptime percentage' },
  { id: 'response_time', label: 'Response Time', description: 'Time to respond' },
  { id: 'resolution_time', label: 'Resolution Time', description: 'Time to resolve issues' },
  { id: 'throughput', label: 'Throughput', description: 'Transactions per period' },
  { id: 'error_rate', label: 'Error Rate', description: 'Percentage of failures' },
  { id: 'custom', label: 'Custom', description: 'Custom metric' },
];

// ============================================================================
// ARTEFACT TYPE DEFINITIONS
// ============================================================================

export const BSM_TYPE_DEFS = {
  // ========== CATALOG STAGE ==========
  bsm_service: {
    id: 'bsm_service',
    name: 'Business Service',
    namePlural: 'Business Services',
    description: 'A service that delivers value to consumers, supported by capabilities',
    color: '#3b82f6',
    icon: 'MiscellaneousServices',
    stage: 'catalog',
    fields: [
      { key: 'service_type', label: 'Service Type', type: 'select', options: BSM_SERVICE_TYPE },
      { key: 'status', label: 'Status', type: 'select', options: BSM_SERVICE_STATUS },
      { key: 'criticality', label: 'Business Criticality', type: 'select', options: BSM_SERVICE_CRITICALITY },
      { key: 'owner', label: 'Service Owner', type: 'text', placeholder: 'Role or person responsible' },
      { key: 'value_proposition', label: 'Value Proposition', type: 'textarea', placeholder: 'What value does this service deliver?' },
      { key: 'capabilities', label: 'Supporting Capabilities', type: 'tags', placeholder: 'Capabilities that enable this service' },
      { key: 'channels', label: 'Delivery Channels', type: 'tags', placeholder: 'How is the service delivered?' },
    ],
    guidance: {
      good: [
        'Describes a discrete unit of value delivery',
        'Has clear consumers and outcomes',
        'Can be independently managed',
        'Maps to business capabilities',
      ],
      poor: [
        'Too granular (individual functions)',
        'Too broad (everything in one service)',
        'Technology-focused rather than value-focused',
        'No clear consumer or outcome',
      ],
      example: {
        good: 'Customer Account Management - Enables customers to view, update, and manage their account details',
        poor: 'Database Service',
      },
    },
  },

  bsm_service_category: {
    id: 'bsm_service_category',
    name: 'Service Category',
    namePlural: 'Service Categories',
    description: 'A logical grouping of related services',
    color: '#6366f1',
    icon: 'Category',
    stage: 'catalog',
    fields: [
      { key: 'purpose', label: 'Purpose', type: 'textarea', placeholder: 'Why does this category exist?' },
      { key: 'scope', label: 'Scope', type: 'textarea', placeholder: 'What types of services belong here?' },
    ],
    guidance: {
      good: [
        'Groups services by business domain',
        'Clear criteria for inclusion',
        'Helps navigation and discovery',
      ],
      poor: [
        'Based on technology',
        'Overlapping with other categories',
        'Too many or too few services',
      ],
    },
  },

  // ========== LEVELS STAGE ==========
  bsm_service_level: {
    id: 'bsm_service_level',
    name: 'Service Level',
    namePlural: 'Service Levels',
    description: 'Quality and performance commitments for a service',
    color: '#8b5cf6',
    icon: 'Speed',
    stage: 'levels',
    fields: [
      { key: 'service_id', label: 'Service', type: 'reference', refType: 'bsm_service' },
      { key: 'metric_type', label: 'Metric Type', type: 'select', options: BSM_SLA_METRIC_TYPE },
      { key: 'target', label: 'Target Value', type: 'text', placeholder: 'e.g., 99.9%, <200ms' },
      { key: 'measurement_period', label: 'Measurement Period', type: 'text', placeholder: 'e.g., Monthly, Weekly' },
      { key: 'measurement_method', label: 'How Measured', type: 'textarea', placeholder: 'How is this metric calculated?' },
      { key: 'consequences', label: 'Breach Consequences', type: 'textarea', placeholder: 'What happens if target is missed?' },
    ],
    guidance: {
      good: [
        'Measurable and objective',
        'Aligned to consumer expectations',
        'Achievable with current capabilities',
        'Has clear measurement method',
      ],
      poor: [
        'Vague or subjective',
        'Unmeasurable',
        'Unrealistic targets',
        'No consequence for breach',
      ],
      example: {
        good: 'Service availability 99.9% measured monthly, excluding planned maintenance',
        poor: 'Service should be fast',
      },
    },
  },

  bsm_sla: {
    id: 'bsm_sla',
    name: 'Service Level Agreement',
    namePlural: 'Service Level Agreements',
    description: 'Formal agreement between provider and consumer',
    color: '#7c3aed',
    icon: 'Handshake',
    stage: 'levels',
    fields: [
      { key: 'service_id', label: 'Service', type: 'reference', refType: 'bsm_service' },
      { key: 'consumer_id', label: 'Consumer', type: 'reference', refType: 'bsm_consumer' },
      { key: 'effective_date', label: 'Effective Date', type: 'date' },
      { key: 'review_date', label: 'Review Date', type: 'date' },
      { key: 'service_hours', label: 'Service Hours', type: 'text', placeholder: 'e.g., 24/7, Business hours' },
      { key: 'support_level', label: 'Support Level', type: 'text', placeholder: 'e.g., Gold, Silver, Bronze' },
      { key: 'escalation_path', label: 'Escalation Path', type: 'textarea' },
    ],
    guidance: {
      good: [
        'Clear scope and boundaries',
        'Specific measurable commitments',
        'Defined escalation process',
        'Regular review schedule',
      ],
      poor: [
        'Vague commitments',
        'No review mechanism',
        'Missing escalation path',
        'Unrealistic expectations',
      ],
    },
  },

  // ========== CONSUMERS STAGE ==========
  bsm_consumer: {
    id: 'bsm_consumer',
    name: 'Service Consumer',
    namePlural: 'Service Consumers',
    description: 'An entity that uses business services',
    color: '#22c55e',
    icon: 'Group',
    stage: 'consumers',
    fields: [
      { key: 'consumer_type', label: 'Consumer Type', type: 'select', options: BSM_CONSUMER_TYPE },
      { key: 'contact', label: 'Primary Contact', type: 'text' },
      { key: 'organization', label: 'Organization/Department', type: 'text' },
      { key: 'services_consumed', label: 'Services Used', type: 'tags' },
      { key: 'usage_volume', label: 'Usage Volume', type: 'text', placeholder: 'e.g., High, ~1000 txn/day' },
      { key: 'special_requirements', label: 'Special Requirements', type: 'textarea' },
    ],
    guidance: {
      good: [
        'Clear identification',
        'Known usage patterns',
        'Documented requirements',
        'Active relationship',
      ],
      poor: [
        'Anonymous or generic',
        'Unknown usage',
        'No contact information',
        'Stale or inactive',
      ],
    },
  },

  bsm_consumer_agreement: {
    id: 'bsm_consumer_agreement',
    name: 'Consumer Agreement',
    namePlural: 'Consumer Agreements',
    description: 'Agreement with a service consumer on service usage',
    color: '#10b981',
    icon: 'Assignment',
    stage: 'consumers',
    fields: [
      { key: 'consumer_id', label: 'Consumer', type: 'reference', refType: 'bsm_consumer' },
      { key: 'service_id', label: 'Service', type: 'reference', refType: 'bsm_service' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'terms', label: 'Key Terms', type: 'textarea' },
      { key: 'status', label: 'Agreement Status', type: 'select', options: [
        { id: 'draft', label: 'Draft' },
        { id: 'active', label: 'Active' },
        { id: 'expired', label: 'Expired' },
        { id: 'terminated', label: 'Terminated' },
      ]},
    ],
    guidance: {
      good: [
        'Clear start and end dates',
        'Documented terms',
        'Linked to SLA',
        'Regular review',
      ],
      poor: [
        'No formal agreement',
        'Expired without review',
        'Missing key terms',
        'No SLA linkage',
      ],
    },
  },

  // ========== DEPENDENCIES STAGE ==========
  bsm_dependency: {
    id: 'bsm_dependency',
    name: 'Service Dependency',
    namePlural: 'Service Dependencies',
    description: 'A dependency between services',
    color: '#f59e0b',
    icon: 'Link',
    stage: 'dependencies',
    fields: [
      { key: 'source_service', label: 'Dependent Service', type: 'reference', refType: 'bsm_service' },
      { key: 'target_service', label: 'Dependency On', type: 'reference', refType: 'bsm_service' },
      { key: 'dependency_type', label: 'Dependency Type', type: 'select', options: BSM_DEPENDENCY_TYPE },
      { key: 'impact', label: 'Impact if Unavailable', type: 'textarea', placeholder: 'What happens if dependency fails?' },
      { key: 'mitigation', label: 'Mitigation Strategy', type: 'textarea', placeholder: 'How to handle failures?' },
    ],
    guidance: {
      good: [
        'Clear impact assessment',
        'Documented mitigation',
        'Regularly reviewed',
        'Part of change management',
      ],
      poor: [
        'Unknown dependencies',
        'No impact analysis',
        'No fallback plan',
        'Stale or unverified',
      ],
    },
  },

  bsm_integration: {
    id: 'bsm_integration',
    name: 'Integration',
    namePlural: 'Integrations',
    description: 'Technical integration between services',
    color: '#ea580c',
    icon: 'SettingsInputComponent',
    stage: 'dependencies',
    fields: [
      { key: 'source_service', label: 'Source Service', type: 'reference', refType: 'bsm_service' },
      { key: 'target_service', label: 'Target Service', type: 'reference', refType: 'bsm_service' },
      { key: 'integration_type', label: 'Integration Type', type: 'select', options: [
        { id: 'api', label: 'API' },
        { id: 'event', label: 'Event/Message' },
        { id: 'file', label: 'File Transfer' },
        { id: 'database', label: 'Database' },
        { id: 'manual', label: 'Manual' },
      ]},
      { key: 'protocol', label: 'Protocol/Technology', type: 'text', placeholder: 'e.g., REST, SOAP, Kafka' },
      { key: 'frequency', label: 'Frequency', type: 'text', placeholder: 'e.g., Real-time, Daily batch' },
      { key: 'data_exchanged', label: 'Data Exchanged', type: 'tags', placeholder: 'What data flows?' },
    ],
    guidance: {
      good: [
        'Documented interface contract',
        'Clear data flow',
        'Error handling defined',
        'Monitored and measured',
      ],
      poor: [
        'Undocumented integration',
        'No error handling',
        'Tight coupling',
        'No monitoring',
      ],
    },
  },
};

// ============================================================================
// DERIVED CONSTANTS
// ============================================================================

export const BSM_ALL_TYPES = Object.keys(BSM_TYPE_DEFS);

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

export const BSM_RELATIONSHIP_TYPES = {
  // Service relationships
  categorized_in: {
    id: 'categorized_in',
    name: 'Categorized In',
    description: 'Service belongs to category',
    fromTypes: ['bsm_service'],
    toTypes: ['bsm_service_category'],
  },
  supports: {
    id: 'supports',
    name: 'Supports',
    description: 'Service supports another service',
    fromTypes: ['bsm_service'],
    toTypes: ['bsm_service'],
  },
  enabled_by: {
    id: 'enabled_by',
    name: 'Enabled By',
    description: 'Service is enabled by capability',
    fromTypes: ['bsm_service'],
    toTypes: ['cap_capability'],
  },

  // Consumer relationships
  consumes: {
    id: 'consumes',
    name: 'Consumes',
    description: 'Consumer uses service',
    fromTypes: ['bsm_consumer'],
    toTypes: ['bsm_service'],
  },
  governed_by: {
    id: 'governed_by',
    name: 'Governed By',
    description: 'Consumer relationship governed by SLA',
    fromTypes: ['bsm_consumer'],
    toTypes: ['bsm_sla'],
  },

  // Dependency relationships
  depends_on: {
    id: 'depends_on',
    name: 'Depends On',
    description: 'Service depends on another',
    fromTypes: ['bsm_service'],
    toTypes: ['bsm_service'],
  },
  integrates_with: {
    id: 'integrates_with',
    name: 'Integrates With',
    description: 'Service integrates with another',
    fromTypes: ['bsm_service'],
    toTypes: ['bsm_service'],
  },
};

// ============================================================================
// WORKSPACE MODULES (UI Organization)
// ============================================================================

export const BSM_WORKSPACE_MODULES = {
  catalog: {
    id: 'catalog',
    name: 'Service Catalog',
    description: 'Define and manage business services',
    icon: 'MiscellaneousServices',
    types: ['bsm_service', 'bsm_service_category'],
    primaryView: 'list',
  },
  levels: {
    id: 'levels',
    name: 'Service Levels',
    description: 'Manage SLAs, SLOs, and commitments',
    icon: 'Speed',
    types: ['bsm_service_level', 'bsm_sla'],
    primaryView: 'list',
  },
  consumers: {
    id: 'consumers',
    name: 'Consumers',
    description: 'Track service consumers and agreements',
    icon: 'Group',
    types: ['bsm_consumer', 'bsm_consumer_agreement'],
    primaryView: 'list',
  },
  dependencies: {
    id: 'dependencies',
    name: 'Dependencies',
    description: 'Map service dependencies and integrations',
    icon: 'Link',
    types: ['bsm_dependency', 'bsm_integration'],
    primaryView: 'map',
  },
};

// ============================================================================
// GUIDANCE CONTENT
// ============================================================================

export const BSM_GUIDANCE = {
  getting_started: {
    title: 'Getting Started with Service Management',
    content: `Start by identifying your key business services - the units of value you deliver to consumers. Then define who consumes each service and what service levels you commit to.

**Tip**: Focus on business services first (what value they deliver), then drill down into technical dependencies.`,
  },
  service_vs_capability: {
    title: 'Service vs Capability',
    content: `A capability is WHAT you can do (an ability). A service is HOW you deliver value using capabilities.

**Example**:
- Capability: "Customer Onboarding"
- Service: "New Customer Registration Service"

Services package capabilities into consumable offerings with defined service levels.`,
  },
  service_levels: {
    title: 'Defining Service Levels',
    content: `Good service levels are SMART:
- **Specific**: Clear metric definition
- **Measurable**: Can be objectively measured
- **Achievable**: Realistic with current capabilities
- **Relevant**: Matters to consumers
- **Time-bound**: Defined measurement period`,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get type definition for a BSM artefact type
 * @param {string} type - The artefact type id
 * @returns {Object|null} The type definition or null
 */
export function getTypeDefinition(type) {
  return BSM_TYPE_DEFS[type] || null;
}

/**
 * Check if a type is a valid BSM type
 * @param {string} type - The type to check
 * @returns {boolean}
 */
export function isBsmType(type) {
  if (!type || typeof type !== 'string') return false;
  return type.startsWith('bsm_') && BSM_ALL_TYPES.includes(type);
}

/**
 * Get the color for a BSM type
 * @param {string} type - The artefact type id
 * @returns {string} The hex color
 */
export function getTypeColor(type) {
  return BSM_TYPE_DEFS[type]?.color || '#6b7280';
}

/**
 * Get the stage for a type
 * @param {string} type - The artefact type id
 * @returns {string|null} The stage id
 */
export function getStageForType(type) {
  return BSM_TYPE_DEFS[type]?.stage || null;
}

/**
 * Get all types for a stage
 * @param {string} stageId - The stage id
 * @returns {string[]} Array of type ids
 */
export function getTypesForStage(stageId) {
  return BSM_STAGES[stageId]?.types || [];
}

/**
 * Calculate service health based on SLAs and dependencies
 * @param {Object} service - The service artefact
 * @param {Array} slas - Related SLAs
 * @param {Array} dependencies - Service dependencies
 * @returns {Object} Health assessment
 */
export function calculateServiceHealth(service, slas = [], dependencies = []) {
  const checks = {
    hasOwner: !!service.custom_fields?.owner,
    hasValueProposition: !!service.custom_fields?.value_proposition,
    hasServiceLevels: slas.length > 0,
    hasDependenciesMapped: dependencies.length > 0 || service.custom_fields?.service_type === 'business',
  };

  const score = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return {
    checks,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    status: score === total ? 'healthy' : score >= total / 2 ? 'warning' : 'critical',
  };
}

// ============================================================================
// DEFAULT PROJECT CONFIGURATION
// ============================================================================

export const BSM_DEFAULT_PROJECT_CONFIG = {
  enabledModules: ['catalog', 'levels', 'consumers', 'dependencies'],
  defaultView: 'list',
  showGuidance: true,
};
