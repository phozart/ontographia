const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker deployment
  outputFileTracingRoot: path.join(__dirname, './'), // Fix workspace root detection (avoids ~/package-lock.json)
  // MUI X components v8 require transpilation for CSS imports and ES module resolution
  transpilePackages: ['@mui/x-data-grid', '@mui/x-tree-view'],
  // Turbopack config for Next.js 16
  // Note: removed turbopack.root as it conflicts with outputFileTracingRoot
  // Webpack config for module resolution
  webpack: (config, { isServer }) => {
    // Fix MUI DataGrid ES module directory imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mui/material/styles': '@mui/material/styles/index.js',
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      '@mui/material/styles': '@mui/material/styles/index.js',
    },
  },
  // Security headers for production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  // Redirects from legacy URLs to new /app/spaces/ structure
  async redirects() {
    return [
      // Enterprise Architecture (merged into Enterprise Studio)
      { source: '/ea-studio', destination: '/app/spaces/enterprise/dashboard', permanent: true },
      { source: '/enterprise-architecture', destination: '/app/spaces/enterprise/dashboard', permanent: true },
      { source: '/app/spaces/ea/:path*', destination: '/app/spaces/enterprise/dashboard', permanent: true },
      // System Dynamics
      { source: '/system-dynamics', destination: '/app/spaces/sd/canvas', permanent: true },
      // Business Analysis (merged into Analysis Studio)
      { source: '/requirements-studio', destination: '/app/spaces/analysis/repository', permanent: true },
      // Capability Studio (now in Enterprise)
      { source: '/capability-studio', destination: '/app/spaces/enterprise/capabilities', permanent: true },
      // Product Design
      { source: '/product-design-workspace', destination: '/app/spaces/pdw/discovery', permanent: true },
      // Diagram Studio
      { source: '/diagram-workspace', destination: '/app/spaces/diagram/canvas', permanent: true },
      { source: '/diagram-studio-standalone', destination: '/app/spaces/diagram/canvas', permanent: true },
      // Sensemaking (deprecated - redirect to home)
      { source: '/sensemaking-studio', destination: '/', permanent: true },
      // Negotiation (deprecated - redirect to home)
      { source: '/negotiation-studio', destination: '/', permanent: true },
      // Philosophy (deprecated - redirect to home)
      { source: '/philosophy-studio', destination: '/', permanent: true },
      // Learning Studio
      { source: '/learning-studio', destination: '/app/spaces/als/sessions', permanent: true },
      // Dynamic Work Design
      { source: '/dynamic-work-design', destination: '/app/spaces/dwd/landscape', permanent: true },
      // Project Design
      { source: '/project-design', destination: '/app/spaces/pds/overview', permanent: true },
      // Strategic Reasoning (deprecated - redirect to home)
      { source: '/strategic-reasoning', destination: '/', permanent: true },
      // Performance
      { source: '/performance-studio', destination: '/app/spaces/perf/dashboard', permanent: true },
      // Risk (now in Enterprise)
      { source: '/risk-studio', destination: '/app/spaces/enterprise/risk', permanent: true },
      // Governance (now in Enterprise)
      { source: '/governance-studio', destination: '/app/spaces/enterprise/governance', permanent: true },
      // Business Service Management (now in Enterprise)
      { source: '/business-service-studio', destination: '/app/spaces/enterprise/services', permanent: true },
      // Organisation Studio (now in Enterprise)
      { source: '/organisation-studio', destination: '/app/spaces/enterprise/organisation', permanent: true },
      // Old hierarchical paths
      { source: '/app/workspaces/enterprise-architecture', destination: '/app/spaces/enterprise/dashboard', permanent: true },
      { source: '/app/workspaces/requirements', destination: '/app/spaces/analysis/repository', permanent: true },
      { source: '/app/workspaces/product-design', destination: '/app/spaces/pdw/discovery', permanent: true },
      { source: '/app/workspaces/diagram', destination: '/app/spaces/diagram/canvas', permanent: true },
      { source: '/app/reasoning/system-dynamics', destination: '/app/spaces/sd/canvas', permanent: true },
      { source: '/app/reasoning/dynamic-work-design', destination: '/app/spaces/dwd/landscape', permanent: true },
      { source: '/app/reasoning/negotiation', destination: '/', permanent: true },
      { source: '/app/reasoning/sensemaking', destination: '/', permanent: true },
      { source: '/app/spaces/srs/:path*', destination: '/', permanent: true },
      { source: '/app/spaces/mms/:path*', destination: '/', permanent: true },
      { source: '/app/spaces/np/:path*', destination: '/', permanent: true },
      { source: '/app/spaces/philosophy/:path*', destination: '/', permanent: true },
      { source: '/app/reasoning/learning', destination: '/app/spaces/als/sessions', permanent: true },
      // Reorganized pages - user
      { source: '/login', destination: '/user/login', permanent: true },
      { source: '/home', destination: '/user/home', permanent: true },
      { source: '/settings', destination: '/user/settings', permanent: true },
      { source: '/user-view', destination: '/user/user-view', permanent: true },
      // Reorganized pages - system
      { source: '/help', destination: '/system/help', permanent: true },
      { source: '/sitemap', destination: '/system/sitemap', permanent: true },
      // Reorganized pages - graph
      { source: '/node-types', destination: '/graph/node-types', permanent: true },
      { source: '/nodes', destination: '/graph/nodes', permanent: true },
      { source: '/relationship-types', destination: '/graph/relationship-types', permanent: true },
      { source: '/relationships', destination: '/graph/relationships', permanent: true },
      { source: '/data-elements', destination: '/graph/data-elements', permanent: true },
      { source: '/graph', destination: '/graph/graph', permanent: true },
      // Legacy workspaces (now use /app/spaces/)
      { source: '/ea-workspace', destination: '/app/spaces/enterprise/dashboard', permanent: true },
      { source: '/flow-designer', destination: '/app/spaces/diagram/canvas', permanent: true },
      // Knowledge Studio
      { source: '/knowledge-studio', destination: '/app/spaces/ks/navigator', permanent: true },
    ];
  },
};

module.exports = nextConfig;
