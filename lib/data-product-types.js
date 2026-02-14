// lib/data-product-types.js
// Type definitions for Data Product Management in Enterprise Studio
// Follows ODPS 4.1, DPDS, ODCS v3, and Data Contract Specification standards
// This is the strategic differentiator: bridging EA tools and data governance platforms.

// ============================================================================
// DATA PRODUCT LIFECYCLE
// ============================================================================

export const DATA_PRODUCT_STATUS = {
  draft: { id: 'draft', label: 'Draft', color: '#9C9A94', description: 'Being designed' },
  development: { id: 'development', label: 'Development', color: '#3b82f6', description: 'Being built' },
  active: { id: 'active', label: 'Active', color: '#5B8A6A', description: 'In production, serving consumers' },
  deprecated: { id: 'deprecated', label: 'Deprecated', color: '#C9A227', description: 'Still available but not recommended' },
  retired: { id: 'retired', label: 'Retired', color: '#A54D4D', description: 'Decommissioned' },
};

// ============================================================================
// DATA PRODUCT CLASSIFICATION (per Dehghani)
// ============================================================================

export const DATA_PRODUCT_CLASSIFICATION = {
  source_aligned: {
    id: 'source_aligned',
    label: 'Source-Aligned',
    description: 'Close to operational data; represents facts from a single domain',
    icon: '&#128230;',
    color: '#3b82f6',
  },
  aggregate: {
    id: 'aggregate',
    label: 'Aggregate',
    description: 'Combines data from multiple source-aligned products',
    icon: '&#128202;',
    color: '#8b5cf6',
  },
  consumer_aligned: {
    id: 'consumer_aligned',
    label: 'Consumer-Aligned',
    description: 'Optimized for a specific consumer use case',
    icon: '&#127919;',
    color: '#10b981',
  },
};

// ============================================================================
// DATA DOMAIN
// ============================================================================

export const DATA_DOMAIN_STATUS = {
  active: { id: 'active', label: 'Active', color: '#5B8A6A' },
  proposed: { id: 'proposed', label: 'Proposed', color: '#C9A227' },
  dissolved: { id: 'dissolved', label: 'Dissolved', color: '#9C9A94' },
};

// ============================================================================
// PORT TYPES (DPDS)
// ============================================================================

export const INPUT_PORT_TYPES = {
  database: { id: 'database', label: 'Database', icon: '&#128451;' },
  api: { id: 'api', label: 'REST API', icon: '&#128279;' },
  event_stream: { id: 'event_stream', label: 'Event Stream', icon: '&#9889;' },
  file: { id: 'file', label: 'File/Batch', icon: '&#128196;' },
  webhook: { id: 'webhook', label: 'Webhook', icon: '&#128276;' },
};

export const OUTPUT_PORT_TYPES = {
  table: { id: 'table', label: 'Database Table', icon: '&#128451;' },
  api: { id: 'api', label: 'REST API', icon: '&#128279;' },
  graphql: { id: 'graphql', label: 'GraphQL', icon: '&#9679;' },
  event_stream: { id: 'event_stream', label: 'Event Stream', icon: '&#9889;' },
  file: { id: 'file', label: 'File Export', icon: '&#128196;' },
  dashboard: { id: 'dashboard', label: 'Dashboard/BI', icon: '&#128202;' },
};

// ============================================================================
// DATA CONTRACT (ODCS v3 / DCS aligned)
// ============================================================================

export const CONTRACT_STATUS = {
  draft: { id: 'draft', label: 'Draft', color: '#9C9A94' },
  proposed: { id: 'proposed', label: 'Proposed', color: '#C9A227' },
  active: { id: 'active', label: 'Active', color: '#5B8A6A' },
  deprecated: { id: 'deprecated', label: 'Deprecated', color: '#A54D4D' },
};

export const DATA_QUALITY_DIMENSIONS = {
  completeness: { id: 'completeness', label: 'Completeness', description: 'Proportion of non-null values' },
  accuracy: { id: 'accuracy', label: 'Accuracy', description: 'Correctness of values against source of truth' },
  consistency: { id: 'consistency', label: 'Consistency', description: 'Agreement across systems and time' },
  timeliness: { id: 'timeliness', label: 'Timeliness', description: 'How current the data is' },
  uniqueness: { id: 'uniqueness', label: 'Uniqueness', description: 'Absence of duplicate records' },
  validity: { id: 'validity', label: 'Validity', description: 'Conformance to expected formats and ranges' },
};

export const SLA_METRICS = {
  freshness: { id: 'freshness', label: 'Freshness', unit: 'minutes', description: 'Max age of data' },
  availability: { id: 'availability', label: 'Availability', unit: '%', description: 'Uptime percentage' },
  latency: { id: 'latency', label: 'Latency', unit: 'ms', description: 'Response time for API ports' },
  throughput: { id: 'throughput', label: 'Throughput', unit: 'records/s', description: 'Processing capacity' },
};

// ============================================================================
// SCHEMA FIELD TYPES (for contract schema definition)
// ============================================================================

export const SCHEMA_FIELD_TYPES = [
  'string', 'integer', 'number', 'boolean', 'date', 'datetime', 'timestamp',
  'array', 'object', 'uuid', 'email', 'uri', 'enum', 'binary',
];

export const SCHEMA_CLASSIFICATION = {
  pii: { id: 'pii', label: 'PII', color: '#A54D4D', description: 'Personally Identifiable Information' },
  sensitive: { id: 'sensitive', label: 'Sensitive', color: '#C9A227', description: 'Business-sensitive data' },
  internal: { id: 'internal', label: 'Internal', color: '#47453F', description: 'Internal use only' },
  public: { id: 'public', label: 'Public', color: '#5B8A6A', description: 'Publicly available' },
  confidential: { id: 'confidential', label: 'Confidential', color: '#8b5cf6', description: 'Restricted access' },
};

// ============================================================================
// DATA PRODUCT CANVAS (workshop format)
// ============================================================================

export const CANVAS_SECTIONS = [
  { id: 'domain', label: 'Domain', order: 1, description: 'Which data domain owns this product?' },
  { id: 'name', label: 'Name', order: 2, description: 'What is the data product called?' },
  { id: 'purpose', label: 'Purpose', order: 3, description: 'What use cases does this product serve?' },
  { id: 'consumers', label: 'Consumer Expectations', order: 4, description: 'What do consumers expect from this product?' },
  { id: 'outputs', label: 'Output Ports', order: 5, description: 'How will consumers access the data?' },
  { id: 'contracts', label: 'Data Contracts', order: 6, description: 'What are the quality and SLA guarantees?' },
  { id: 'inputs', label: 'Input Sources', order: 7, description: 'Where does the data come from?' },
  { id: 'classification', label: 'Classification', order: 8, description: 'Source-aligned, aggregate, or consumer-aligned?' },
];

// ============================================================================
// ENTERPRISE MODULE DEFINITION (for EnterpriseContext integration)
// ============================================================================

export const DATA_MODULES = {
  data_products: {
    id: 'data_products',
    name: 'Data Products',
    icon: '&#128230;',
    description: 'Data products in the enterprise data mesh',
    color: '#14b8a6',
  },
  data_contracts: {
    id: 'data_contracts',
    name: 'Data Contracts',
    icon: '&#128220;',
    description: 'Interface contracts between producers and consumers',
    color: '#0d9488',
  },
  data_domains: {
    id: 'data_domains',
    name: 'Data Domains',
    icon: '&#127760;',
    description: 'Domain boundaries for data ownership',
    color: '#0f766e',
  },
};

// ============================================================================
// RELATIONSHIP TYPES (between data products and enterprise artifacts)
// ============================================================================

export const DATA_RELATIONSHIP_TYPES = {
  // Data product relationships
  produces: { id: 'produces', label: 'Produces', from: 'application', to: 'data_product' },
  consumes: { id: 'consumes', label: 'Consumes', from: 'application', to: 'data_product' },
  owns: { id: 'owns', label: 'Owns', from: 'data_domain', to: 'data_product' },
  implements_contract: { id: 'implements_contract', label: 'Implements Contract', from: 'data_product', to: 'data_contract' },
  depends_on: { id: 'depends_on', label: 'Depends On', from: 'data_product', to: 'data_product' },
  supports_capability: { id: 'supports_capability', label: 'Supports Capability', from: 'data_product', to: 'capability' },
  governed_by: { id: 'governed_by', label: 'Governed By', from: 'data_product', to: 'governance' },
  // Domain relationships
  domain_aligned_to: { id: 'domain_aligned_to', label: 'Aligned To', from: 'data_domain', to: 'capability' },
  domain_owned_by: { id: 'domain_owned_by', label: 'Owned By', from: 'data_domain', to: 'org_unit' },
};

// ============================================================================
// HEALTH SCORING (cross-studio composite)
// ============================================================================

export const HEALTH_DIMENSIONS = {
  quality: {
    id: 'quality',
    label: 'Data Quality',
    weight: 0.3,
    description: 'Quality rule pass rate across all contracts',
  },
  freshness: {
    id: 'freshness',
    label: 'Freshness',
    weight: 0.2,
    description: 'SLA compliance for data freshness',
  },
  adoption: {
    id: 'adoption',
    label: 'Adoption',
    weight: 0.2,
    description: 'Number of active consumers vs. target',
  },
  documentation: {
    id: 'documentation',
    label: 'Documentation',
    weight: 0.15,
    description: 'Contract completeness and recency',
  },
  governance: {
    id: 'governance',
    label: 'Governance',
    weight: 0.15,
    description: 'Policy compliance and review cadence',
  },
};

/**
 * Calculate composite health score for a data product
 * @param {Object} metrics - { quality: 0-100, freshness: 0-100, adoption: 0-100, documentation: 0-100, governance: 0-100 }
 * @returns {{ score: number, rating: string, color: string }}
 */
export function calculateHealthScore(metrics = {}) {
  let total = 0;
  let weightSum = 0;

  for (const [dim, def] of Object.entries(HEALTH_DIMENSIONS)) {
    const value = metrics[dim];
    if (value != null) {
      total += value * def.weight;
      weightSum += def.weight;
    }
  }

  const score = weightSum > 0 ? Math.round(total / weightSum) : 0;

  let rating, color;
  if (score >= 80) { rating = 'Healthy'; color = '#5B8A6A'; }
  else if (score >= 60) { rating = 'Adequate'; color = '#C9A227'; }
  else if (score >= 40) { rating = 'At Risk'; color = '#f59e0b'; }
  else { rating = 'Critical'; color = '#A54D4D'; }

  return { score, rating, color };
}

/**
 * Validate a data contract has minimum required fields
 * @param {Object} contract
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDataContract(contract) {
  const errors = [];

  if (!contract.name) errors.push('Contract name is required');
  if (!contract.version) errors.push('Contract version is required');
  if (!contract.schema?.fields?.length) errors.push('At least one schema field is required');
  if (!contract.owner) errors.push('Contract owner is required');

  // Check SLAs
  if (!contract.sla || Object.keys(contract.sla).length === 0) {
    errors.push('At least one SLA metric should be defined');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generate a fully qualified name for a data product (DPDS convention)
 * @param {string} org - Organization identifier
 * @param {string} domain - Domain name
 * @param {string} product - Product name
 * @param {string} version - Version string
 * @returns {string}
 */
export function generateFQN(org, domain, product, version = '1.0') {
  const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `urn:dpds:${slug(org)}:${slug(domain)}:${slug(product)}:${version}`;
}
