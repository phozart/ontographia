// lib/events/eventTypes.js
// Constants for the transactional outbox pattern

/**
 * Aggregate types that can emit events
 */
export const AGGREGATE_TYPES = {
  ARTEFACT: 'artefact',
  EA_ELEMENT: 'ea_element',
  EA_RELATIONSHIP: 'ea_relationship',
  KG_NODE: 'kg_node',
  KG_EDGE: 'kg_edge',
};

/**
 * Event types
 */
export const EVENT_TYPES = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  LINKED: 'linked',
  UNLINKED: 'unlinked',
};

/**
 * Source studios that generate events
 */
export const SOURCE_STUDIOS = {
  BLUEPRINT: 'blueprint',
  ANALYSIS: 'analysis',
  ENTERPRISE: 'enterprise',
  PDS: 'pds',
  GTM: 'gtm',
  KNOWLEDGE: 'knowledge',
};

/**
 * Event processing statuses
 */
export const EVENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DEAD_LETTER: 'dead_letter',
};

/**
 * Maximum retries before moving to dead letter
 */
export const MAX_RETRIES = 5;
