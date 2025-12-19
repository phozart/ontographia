// tests/unit/portfolio/votes-api.test.js
// Unit tests for portfolio votes API

import { createMocks } from 'node-mocks-http';

// Mock the database query function
jest.mock('../../../lib/pg', () => ({
  query: jest.fn(),
}));

import { query } from '../../../lib/pg';
import handler from '../../../pages/api/portfolio/votes';

describe('Portfolio Votes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/portfolio/votes', () => {
    test('returns 400 if artefact_id is missing', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'artefact_id is required',
      });
    });

    test('returns votes and summary for valid artefact_id', async () => {
      const mockVotes = [
        { id: '1', artefact_id: 'art-1', user_id: 'user-1', vote: 'approve', username: 'alice' },
        { id: '2', artefact_id: 'art-1', user_id: 'user-2', vote: 'approve', username: 'bob' },
        { id: '3', artefact_id: 'art-1', user_id: 'user-3', vote: 'reject', username: 'charlie' },
      ];

      query.mockResolvedValueOnce({ rows: mockVotes });

      const { req, res } = createMocks({
        method: 'GET',
        query: { artefact_id: 'art-1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.votes).toHaveLength(3);
      expect(data.summary.total).toBe(3);
      expect(data.summary.approve).toBe(2);
      expect(data.summary.reject).toBe(1);
      expect(data.summary.approvalPercent).toBe(67);
    });

    test('returns empty summary for no votes', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const { req, res } = createMocks({
        method: 'GET',
        query: { artefact_id: 'art-1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.votes).toHaveLength(0);
      expect(data.summary.total).toBe(0);
      expect(data.summary.approvalPercent).toBe(0);
    });
  });

  describe('POST /api/portfolio/votes', () => {
    test('returns 400 if required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { artefact_id: 'art-1' }, // missing user_id and vote
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'artefact_id, user_id, and vote are required',
      });
    });

    test('returns 400 for invalid vote value', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          artefact_id: 'art-1',
          user_id: 'user-1',
          vote: 'invalid',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'vote must be approve, reject, or abstain',
      });
    });

    test('creates a new vote successfully', async () => {
      const mockVote = {
        id: '1',
        artefact_id: 'art-1',
        user_id: 'user-1',
        vote: 'approve',
        comment: null,
      };

      query
        .mockResolvedValueOnce({ rows: [mockVote] }) // Insert vote
        .mockResolvedValueOnce({ rows: [{ username: 'alice' }] }); // Get username

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          artefact_id: 'art-1',
          user_id: 'user-1',
          vote: 'approve',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.vote).toBe('approve');
      expect(data.username).toBe('alice');
    });

    test('updates existing vote (upsert)', async () => {
      const mockVote = {
        id: '1',
        artefact_id: 'art-1',
        user_id: 'user-1',
        vote: 'reject', // Changed from approve to reject
        comment: 'Changed my mind',
      };

      query
        .mockResolvedValueOnce({ rows: [mockVote] })
        .mockResolvedValueOnce({ rows: [{ username: 'alice' }] });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          artefact_id: 'art-1',
          user_id: 'user-1',
          vote: 'reject',
          comment: 'Changed my mind',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.vote).toBe('reject');
      expect(data.comment).toBe('Changed my mind');
    });
  });

  describe('DELETE /api/portfolio/votes', () => {
    test('returns 400 if required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        body: { artefact_id: 'art-1' }, // missing user_id
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'artefact_id and user_id are required',
      });
    });

    test('deletes vote successfully', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const { req, res } = createMocks({
        method: 'DELETE',
        body: {
          artefact_id: 'art-1',
          user_id: 'user-1',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ success: true });
    });
  });

  describe('Invalid method', () => {
    test('returns 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('Error handling', () => {
    test('returns 500 on database error', async () => {
      query.mockRejectedValueOnce(new Error('Database connection failed'));

      const { req, res } = createMocks({
        method: 'GET',
        query: { artefact_id: 'art-1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Internal server error',
      });
    });
  });
});
