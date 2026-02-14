// lib/urlUtils.js
// URL utilities for hierarchical routing with domain context

import { getSpace, isValidView, getDefaultView } from './spaceRegistry';

// ============ Display ID Patterns ============

/**
 * Pattern for domain display IDs (DOM-0001)
 */
export const DOMAIN_ID_PATTERN = /^DOM-\d{4}$/;

/**
 * Pattern for project display IDs (PRJ-0001)
 */
export const PROJECT_ID_PATTERN = /^PRJ-\d{4}$/;

/**
 * Pattern for session display IDs (SRS-0001, ALS-0001, etc.)
 * Supports 2-4 letter prefixes followed by 4 digits
 */
export const SESSION_ID_PATTERN = /^[A-Z]{2,4}-\d{4}$/;

/**
 * Pattern for initiative display IDs (INI-0001 or BPS-001)
 */
export const INITIATIVE_ID_PATTERN = /^(INI-\d{4}|BPS-\d{3})$/;

/**
 * Pattern for product idea display IDs (PI-001)
 */
export const PRODUCT_IDEA_ID_PATTERN = /^PI-\d{3}$/;

/**
 * Validate a domain display ID
 * @param {string} id
 * @returns {boolean}
 */
export function isValidDomainDisplayId(id) {
  return DOMAIN_ID_PATTERN.test(id);
}

/**
 * Validate a project display ID
 * @param {string} id
 * @returns {boolean}
 */
export function isValidProjectDisplayId(id) {
  return PROJECT_ID_PATTERN.test(id);
}

/**
 * Validate a session display ID
 * @param {string} id - The display ID to validate
 * @param {string} [spacePrefix] - Optional specific prefix (e.g., 'SRS')
 * @returns {boolean}
 */
export function isValidSessionDisplayId(id, spacePrefix = null) {
  if (!SESSION_ID_PATTERN.test(id)) return false;
  if (spacePrefix) {
    return id.startsWith(spacePrefix.toUpperCase() + '-');
  }
  return true;
}

/**
 * Validate an initiative display ID
 * @param {string} id
 * @returns {boolean}
 */
export function isValidInitiativeDisplayId(id) {
  return INITIATIVE_ID_PATTERN.test(id);
}

/**
 * Validate a product idea display ID
 * @param {string} id
 * @returns {boolean}
 */
export function isValidProductIdeaDisplayId(id) {
  return PRODUCT_IDEA_ID_PATTERN.test(id);
}

/**
 * Get the space code from a session display ID
 * @param {string} id - e.g., 'EA-0001'
 * @returns {string|null} - e.g., 'ea' or null
 */
export function getSpaceFromSessionId(id) {
  if (!SESSION_ID_PATTERN.test(id)) return null;
  const prefix = id.split('-')[0].toLowerCase();
  return prefix;
}

// ============ Space URL Utilities ============

/**
 * Parse URL params for space routes
 * @param {Object} query - Next.js router query
 * @returns {Object} Parsed params
 */
export function parseSpaceParams(query) {
  const { space, view, params = [] } = query;

  const result = {
    space: space || null,
    view: view || null,
    domainId: null,
    projectId: null,
    sessionId: null,
    initiativeId: null,
    isValid: false,
  };

  // Validate space
  const spaceConfig = getSpace(space);
  if (!spaceConfig) {
    return result;
  }

  // Validate or set default view
  if (view) {
    if (!isValidView(space, view)) {
      return result;
    }
    result.view = view;
  } else {
    result.view = getDefaultView(space);
  }

  // Parse optional params (domainId, projectId, initiativeId, or sessionId)
  if (params.length > 0) {
    const firstParam = params[0];

    // Check if it's a session ID (space-prefixed like SRS-0001)
    if (isValidSessionDisplayId(firstParam, space.toUpperCase())) {
      result.sessionId = firstParam;
    } else if (isValidDomainDisplayId(firstParam)) {
      result.domainId = firstParam;
    } else {
      return result; // Invalid ID format
    }
  }

  if (params.length > 1 && result.domainId) {
    // Could be project ID (PRJ-XXXX) or initiative ID (BPS-XXX/INI-XXXX)
    if (isValidProjectDisplayId(params[1])) {
      result.projectId = params[1];
    } else if (isValidInitiativeDisplayId(params[1])) {
      // Initiative directly after domain (no project)
      result.initiativeId = params[1];
    } else {
      return result; // Invalid ID format
    }
  }

  // Check for initiative ID as third param (after domain and project)
  if (params.length > 2 && result.domainId && result.projectId) {
    if (isValidInitiativeDisplayId(params[2])) {
      result.initiativeId = params[2];
    }
    // Don't fail if initiative ID is invalid - it's optional
  }

  result.isValid = true;
  return result;
}

/**
 * Build a space URL
 * @param {string} space - Space code
 * @param {string} [view] - View code (optional, uses default)
 * @param {string} [domainId] - Domain display ID (DOM-XXXX format, optional)
 * @param {string} [projectId] - Project display ID (PRJ-XXXX format, optional)
 * @param {string} [initiativeId] - Initiative display ID (INI-XXXX format, optional)
 * @returns {string} URL path
 */
export function buildSpaceUrl(space, view = null, domainId = null, projectId = null, initiativeId = null) {
  const spaceConfig = getSpace(space);
  if (!spaceConfig) {
    return '/app/spaces';
  }

  const viewPath = view || spaceConfig.defaultView;

  // Check for custom URL (some spaces use custom routing paths)
  if (spaceConfig.customUrl) {
    let url = spaceConfig.customUrl;
    // Append view if not the default
    if (view && view !== spaceConfig.defaultView) {
      url += `/${viewPath}`;
    }
    return url;
  }

  let url = `/app/spaces/${space}/${viewPath}`;

  // Append domain display ID as path segment (e.g., /app/spaces/ks/navigator/DOM-0001)
  if (domainId) {
    url += `/${domainId}`;
  }

  // Append project display ID as path segment if provided
  if (projectId) {
    url += `/${projectId}`;
  }

  // Append initiative display ID as path segment if provided
  if (initiativeId) {
    url += `/${initiativeId}`;
  }

  return url;
}

/**
 * Build a session URL
 * @param {string} space - Space code (e.g., 'ea')
 * @param {string} sessionId - Session display ID (e.g., 'EA-0001')
 * @param {string} [view] - Optional view within session
 * @returns {string} URL path
 */
export function buildSessionUrl(space, sessionId, view = null) {
  const spaceConfig = getSpace(space);
  if (!spaceConfig) {
    return '/app/spaces';
  }

  const viewPath = view || spaceConfig.defaultView;
  return `/app/spaces/${space}/${viewPath}/${sessionId}`;
}

/**
 * Get breadcrumb items for a space URL
 * @param {Object} params - Parsed params from parseSpaceParams
 * @param {Object} [context] - Additional context (domain name, project name)
 * @returns {Array} Breadcrumb items
 */
export function getSpaceBreadcrumbs(params, context = {}) {
  const { space, view, domainId, projectId } = params;
  const spaceConfig = getSpace(space);

  const breadcrumbs = [
    { label: 'Spaces', href: '/app/spaces' },
  ];

  if (spaceConfig) {
    breadcrumbs.push({
      label: spaceConfig.name,
      href: buildSpaceUrl(space),
    });

    if (view && view !== spaceConfig.defaultView) {
      breadcrumbs.push({
        label: view.charAt(0).toUpperCase() + view.slice(1).replace(/-/g, ' '),
        href: buildSpaceUrl(space, view),
      });
    }

    if (domainId) {
      breadcrumbs.push({
        label: context.domainName || domainId,
        href: buildSpaceUrl(space, view, domainId),
      });

      if (projectId) {
        breadcrumbs.push({
          label: context.projectName || projectId,
          href: buildSpaceUrl(space, view, domainId, projectId),
        });
      }
    }
  }

  return breadcrumbs;
}

// ============ Legacy URL Utilities ============

// Build URLs with domain context
export function buildAppUrl(domainId, section, page, subpage = null) {
  if (!domainId) return null;
  const base = `/${domainId}/app/${section}/${page}`;
  return subpage ? `${base}/${subpage}` : base;
}

export function buildNavUrl(domainId, page) {
  if (!domainId) return null;
  return `/${domainId}/navigation/${page}`;
}

// Parse URL to extract domain and path info
export function parseAppUrl(pathname) {
  if (!pathname) return { domainId: null, type: null, section: null, page: null, subpage: null };

  const parts = pathname.split('/').filter(Boolean);

  // Handle URLs without domain prefix (admin pages, login, etc.)
  if (parts.length === 0) {
    return { domainId: null, type: null, section: null, page: null, subpage: null };
  }

  // Check if first part is a known non-domain route
  const nonDomainRoutes = ['admin', 'login', 'help', 'api', '_next', 'home', 'projects-overview'];
  if (nonDomainRoutes.includes(parts[0])) {
    return { domainId: null, type: null, section: parts[0], page: parts[1] || null, subpage: parts[2] || null };
  }

  // Assume first part is domain ID
  return {
    domainId: parts[0],
    type: parts[1] || null, // 'navigation' or 'app'
    section: parts[2] || null,
    page: parts[3] || null,
    subpage: parts[4] || null
  };
}

// Map old flat URLs to new hierarchical structure
export const legacyUrlMappings = {
  '/home': '/navigation/home',
  '/projects-overview': '/navigation/projects-overview',
  '/knowledge-studio': '/app/knowledge/studio',
  '/graphnavigator': '/app/knowledge/studio/graph-navigator',
  '/ea-studio': '/app/workspaces/enterprise-architecture',
  '/product-design-workspace': '/app/workspaces/product-design',
  '/diagram-workspace': '/app/workspaces/diagram',
  '/requirements-studio': '/app/workspaces/requirements',
  '/system-dynamics': '/app/reasoning/system-dynamics',
  '/dynamic-work-design': '/app/reasoning/dynamic-work-design',
  '/negotiation-studio': '/app/reasoning/negotiation',
};

// Map new hierarchical URLs back to legacy URLs (for backwards compatibility)
export const hierarchicalToLegacy = Object.fromEntries(
  Object.entries(legacyUrlMappings).map(([k, v]) => [v, k])
);

// Get the legacy path for a hierarchical path
export function getLegacyPath(hierarchicalPath) {
  return hierarchicalToLegacy[hierarchicalPath] || hierarchicalPath;
}

// Get the hierarchical path for a legacy path
export function getHierarchicalPath(legacyPath) {
  return legacyUrlMappings[legacyPath] || legacyPath;
}

// Build full URL with domain from legacy path
export function buildFullUrl(domainId, legacyPath) {
  if (!domainId) return legacyPath;
  const hierarchicalPath = getHierarchicalPath(legacyPath);
  if (!hierarchicalPath || hierarchicalPath === legacyPath) {
    // Not a mapped path, return as-is
    return legacyPath;
  }
  return `/${domainId}${hierarchicalPath}`;
}

// Check if a path is a legacy flat path that should be redirected
export function isLegacyPath(path) {
  return Object.keys(legacyUrlMappings).includes(path);
}

// Check if path has domain context
export function hasDomainContext(pathname) {
  const { domainId, type } = parseAppUrl(pathname);
  return domainId && (type === 'navigation' || type === 'app');
}

// Extract domain ID from URL if present
export function extractDomainId(pathname) {
  const { domainId } = parseAppUrl(pathname);
  return domainId;
}

export default {
  // Display ID validation
  DOMAIN_ID_PATTERN,
  PROJECT_ID_PATTERN,
  SESSION_ID_PATTERN,
  INITIATIVE_ID_PATTERN,
  PRODUCT_IDEA_ID_PATTERN,
  isValidDomainDisplayId,
  isValidProjectDisplayId,
  isValidSessionDisplayId,
  isValidInitiativeDisplayId,
  isValidProductIdeaDisplayId,
  getSpaceFromSessionId,
  // Space URL utilities
  parseSpaceParams,
  buildSpaceUrl,
  buildSessionUrl,
  getSpaceBreadcrumbs,
  // Legacy utilities
  buildAppUrl,
  buildNavUrl,
  parseAppUrl,
  legacyUrlMappings,
  hierarchicalToLegacy,
  getLegacyPath,
  getHierarchicalPath,
  buildFullUrl,
  isLegacyPath,
  hasDomainContext,
  extractDomainId,
};
