/**
 * Coaching Catalogs Index
 *
 * Central export for all space-specific coaching catalogs.
 * Each catalog contains triggers, examples, guidance, and cross-space links
 * tailored to that space's framework and methodology.
 *
 * @module lib/coaching/catalogs
 */

// Import all catalogs
import BA_CATALOG from './ba';
import PDS_CATALOG from './pds';
import EA_CATALOG from './ea';
import PDW_CATALOG from './pdw';
import SD_CATALOG from './sd';
import CAP_CATALOG from './cap';
import PORTFOLIO_CATALOG from './portfolio';
import DWD_CATALOG from './dwd';

// Registry of all catalogs by space ID
export const CATALOGS = {
  ba: BA_CATALOG,
  pds: PDS_CATALOG,
  ea: EA_CATALOG,
  pdw: PDW_CATALOG,
  sd: SD_CATALOG,
  cap: CAP_CATALOG,
  portfolio: PORTFOLIO_CATALOG,
  dwd: DWD_CATALOG,
  // Additional catalogs will be added as they are created:
  // als: ALS_CATALOG,
  // perf: PERF_CATALOG,
  // ks: KS_CATALOG,
  // diagram: DIAGRAM_CATALOG,
};

/**
 * Get catalog for a specific space
 * @param {string} spaceId - Space identifier
 * @returns {Object|null} Catalog or null if not found
 */
export function getCatalog(spaceId) {
  return CATALOGS[spaceId] || null;
}

/**
 * Get all registered catalogs
 * @returns {Object} All catalogs by space ID
 */
export function getAllCatalogs() {
  return CATALOGS;
}

/**
 * Check if a space has a coaching catalog
 * @param {string} spaceId - Space identifier
 * @returns {boolean}
 */
export function hasCatalog(spaceId) {
  return spaceId in CATALOGS;
}

/**
 * Get list of spaces with coaching catalogs
 * @returns {string[]} Array of space IDs
 */
export function getCoachingEnabledSpaces() {
  return Object.keys(CATALOGS);
}

// Named exports for direct import
export {
  BA_CATALOG,
  PDS_CATALOG,
  EA_CATALOG,
  PDW_CATALOG,
  SD_CATALOG,
  CAP_CATALOG,
  PORTFOLIO_CATALOG,
  DWD_CATALOG,
};

export default CATALOGS;
