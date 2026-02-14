/**
 * Jest configuration for @ontographia/diagram-studio
 */

module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(ulid)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.js',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
