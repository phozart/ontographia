// tests/pds/pds-api.test.js
// Tests for PDS API endpoints - validation and error handling

import { createMocks } from 'node-mocks-http';

// Mock the database module
jest.mock('../../lib/pg', () => ({
  query: jest.fn(),
}));

// Mock the project access module
jest.mock('../../lib/projectAccess', () => ({
  checkProjectAccess: jest.fn().mockResolvedValue({
    hasAccess: true,
    projectRole: 'analyst',
    error: null,
  }),
  getUserFromRequest: jest.fn((req) => ({
    user: req.headers['x-user'] || null,
    role: req.headers['x-role'] || null,
  })),
}));

const { query } = require('../../lib/pg');
const { checkProjectAccess } = require('../../lib/projectAccess');

describe('PDS API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkProjectAccess.mockResolvedValue({
      hasAccess: true,
      projectRole: 'analyst',
      error: null,
    });
  });

  describe('GET /api/pds/artefacts', () => {
    it('should require projectId parameter', async () => {
      const artefactsHandler = require('../../pages/api/pds/artefacts').default;
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await artefactsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error.toLowerCase()).toContain('project');
    });

    it('should require authentication', async () => {
      const artefactsHandler = require('../../pages/api/pds/artefacts').default;
      const { req, res } = createMocks({
        method: 'GET',
        query: { projectId: 'project-123' },
        headers: {}, // No auth headers
      });

      await artefactsHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('should reject access when project access denied', async () => {
      checkProjectAccess.mockResolvedValueOnce({
        hasAccess: false,
        projectRole: null,
        error: 'No access to project',
      });

      const artefactsHandler = require('../../pages/api/pds/artefacts').default;
      const { req, res } = createMocks({
        method: 'GET',
        query: { projectId: 'project-123' },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await artefactsHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });
  });

  describe('POST /api/pds/artefacts', () => {
    it('should require projectId in body', async () => {
      const artefactsHandler = require('../../pages/api/pds/artefacts').default;
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          artefact_type: 'pds_risk',
          name: 'Test Risk',
        },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await artefactsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should require name field', async () => {
      const artefactsHandler = require('../../pages/api/pds/artefacts').default;
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          projectId: 'project-123',
          artefact_type: 'pds_risk',
        },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await artefactsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should require artefact_type', async () => {
      const artefactsHandler = require('../../pages/api/pds/artefacts').default;
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          projectId: 'project-123',
          name: 'Test',
        },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await artefactsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('GET /api/pds/stats', () => {
    it('should require projectId', async () => {
      const statsHandler = require('../../pages/api/pds/stats').default;
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await statsHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should require authentication', async () => {
      const statsHandler = require('../../pages/api/pds/stats').default;
      const { req, res } = createMocks({
        method: 'GET',
        query: { projectId: 'project-123' },
        headers: {},
      });

      await statsHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('GET /api/pds/relationships', () => {
    it('should require projectId', async () => {
      const relHandler = require('../../pages/api/pds/relationships').default;
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await relHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should require authentication', async () => {
      const relHandler = require('../../pages/api/pds/relationships').default;
      const { req, res } = createMocks({
        method: 'GET',
        query: { projectId: 'project-123' },
        headers: {},
      });

      await relHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('POST /api/pds/relationships', () => {
    it('should require from_artefact_id', async () => {
      const relHandler = require('../../pages/api/pds/relationships').default;
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          projectId: 'project-123',
          to_artefact_id: 'a2',
          relationship_type: 'depends_on',
        },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await relHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should require to_artefact_id', async () => {
      const relHandler = require('../../pages/api/pds/relationships').default;
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          projectId: 'project-123',
          from_artefact_id: 'a1',
          relationship_type: 'depends_on',
        },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await relHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should require relationship_type', async () => {
      const relHandler = require('../../pages/api/pds/relationships').default;
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          projectId: 'project-123',
          from_artefact_id: 'a1',
          to_artefact_id: 'a2',
        },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await relHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('Method validation', () => {
    it('should reject unsupported methods on /api/pds/artefacts', async () => {
      const artefactsHandler = require('../../pages/api/pds/artefacts').default;
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { projectId: 'project-123' },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await artefactsHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should reject unsupported methods on /api/pds/stats', async () => {
      const statsHandler = require('../../pages/api/pds/stats').default;
      const { req, res } = createMocks({
        method: 'POST',
        query: { projectId: 'project-123' },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await statsHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should reject unsupported methods on /api/pds/relationships', async () => {
      const relHandler = require('../../pages/api/pds/relationships').default;
      const { req, res } = createMocks({
        method: 'PUT',
        query: { projectId: 'project-123' },
        headers: { 'x-user': 'test-user', 'x-role': 'analyst' },
      });

      await relHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
});
