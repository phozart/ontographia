/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MUI_X_LICENSE_KEY:
      process.env.MUI_X_LICENSE_KEY ||
      process.env.MUI ||
      process.env.MUI_LICENSE ||
      "aa8e04338cf9e7d76628ea0bcf0eefd9T1JERVI6NDMyMzQsRVhQSVJZPTE2ODM0NjUzNTcwMDAsS0VZVkVSU0lPTj0x",
  },
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
