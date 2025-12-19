// lib/urlUtils.js
// URL utilities for hierarchical routing with domain context

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
