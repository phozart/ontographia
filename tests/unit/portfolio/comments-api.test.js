// tests/unit/portfolio/comments-api.test.js
// Unit tests for portfolio comments API

import { createMocks } from 'node-mocks-http';

// Mock the database query function
jest.mock('../../../lib/pg', () => ({
  query: jest.fn(),
}));

import { query } from '../../../lib/pg';
import handler from '../../../pages/api/portfolio/comments';

describe('Portfolio Comments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/portfolio/comments', () => {
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

    test('returns threaded comments structure', async () => {
      const mockComments = [
        { id: '1', artefact_id: 'art-1', user_id: 'user-1', parent_id: null, content: 'Root comment', username: 'alice' },
        { id: '2', artefact_id: 'art-1', user_id: 'user-2', parent_id: '1', content: 'Reply to root', username: 'bob' },
        { id: '3', artefact_id: 'art-1', user_id: 'user-1', parent_id: null, content: 'Another root', username: 'alice' },
      ];

      query.mockResolvedValueOnce({ rows: mockComments });

      const { req, res } = createMocks({
        method: 'GET',
        query: { artefact_id: 'art-1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.total).toBe(3);
      expect(data.comments).toHaveLength(2); // 2 root comments
      expect(data.comments[0].replies).toHaveLength(1); // First root has 1 reply
      expect(data.comments[1].replies).toHaveLength(0); // Second root has no replies
    });

    test('returns empty array when no comments', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const { req, res } = createMocks({
        method: 'GET',
        query: { artefact_id: 'art-1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.comments).toHaveLength(0);
      expect(data.total).toBe(0);
    });
  });

  describe('POST /api/portfolio/comments', () => {
    test('returns 400 if required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { artefact_id: 'art-1' }, // missing user_id and content
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'artefact_id, user_id, and content are required',
      });
    });

    test('creates a new root comment', async () => {
      const mockComment = {
        id: '1',
        artefact_id: 'art-1',
        user_id: 'user-1',
        content: 'New comment',
        parent_id: null,
        created_at: new Date().toISOString(),
      };

      query
        .mockResolvedValueOnce({ rows: [mockComment] })
        .mockResolvedValueOnce({ rows: [{ username: 'alice' }] });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          artefact_id: 'art-1',
          user_id: 'user-1',
          content: 'New comment',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.content).toBe('New comment');
      expect(data.username).toBe('alice');
      expect(data.replies).toEqual([]);
    });

    test('creates a reply to existing comment', async () => {
      const mockComment = {
        id: '2',
        artefact_id: 'art-1',
        user_id: 'user-2',
        content: 'Reply content',
        parent_id: '1',
        created_at: new Date().toISOString(),
      };

      query
        .mockResolvedValueOnce({ rows: [mockComment] })
        .mockResolvedValueOnce({ rows: [{ username: 'bob' }] });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          artefact_id: 'art-1',
          user_id: 'user-2',
          content: 'Reply content',
          parent_id: '1',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.parent_id).toBe('1');
    });
  });

  describe('PUT /api/portfolio/comments', () => {
    test('returns 400 if required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: { id: '1' }, // missing content
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'id and content are required',
      });
    });

    test('updates comment successfully', async () => {
      const mockComment = {
        id: '1',
        content: 'Updated content',
        updated_at: new Date().toISOString(),
      };

      query
        .mockResolvedValueOnce({ rows: [mockComment] })
        .mockResolvedValueOnce({ rows: [{ username: 'alice' }] });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: '1',
          content: 'Updated content',
          user_id: 'user-1',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.content).toBe('Updated content');
    });

    test('returns 404 if comment not found or unauthorized', async () => {
      query.mockResolvedValueOnce({ rows: [] }); // No rows returned

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: 'non-existent',
          content: 'Updated content',
          user_id: 'user-1',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Comment not found or unauthorized',
      });
    });
  });

  describe('DELETE /api/portfolio/comments', () => {
    test('returns 400 if id is missing', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        body: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'id is required',
      });
    });

    test('deletes comment successfully', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const { req, res } = createMocks({
        method: 'DELETE',
        body: {
          id: '1',
          user_id: 'user-1',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        id: '1',
      });
    });

    test('returns 404 if comment not found or unauthorized', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const { req, res } = createMocks({
        method: 'DELETE',
        body: {
          id: 'non-existent',
          user_id: 'user-1',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Comment not found or unauthorized',
      });
    });
  });

  describe('Invalid method', () => {
    test('returns 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('Error handling', () => {
    test('returns 500 on database error', async () => {
      query.mockRejectedValueOnce(new Error('Database error'));

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
