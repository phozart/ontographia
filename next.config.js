/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@mui/lab',
    '@mui/x-data-grid',
    '@mui/x-tree-view',
  ],
  // Turbopack config to mirror the old webpack alias
  turbopack: {
    resolveAlias: {
      '@mui/material/styles': '@mui/material/styles/index.js',
    },
  },
};

module.exports = nextConfig;
