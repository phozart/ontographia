// pages/api/boards/[id].js
// Individual board CRUD API

import { boardRepository, boardMemberRepository } from '../../../lib/repositories/BoardRepository';

/**
 * Get user from request headers
 */
function getUserFromReq(req) {
  const user = req.headers['x-user'];
  const role = req.headers['x-role'];
  if (!user || !role) return null;
  return { userId: user, role };
}

export default async function handler(req, res) {
  const ctx = getUserFromReq(req);

  if (!ctx) {
    return res.status(401).json({ error: 'Missing user/role headers' });
  }

  const userId = ctx.userId;
  const { id: boardId } = req.query;

  if (!boardId) {
    return res.status(400).json({ error: 'Board ID is required' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, boardId, userId);
    case 'PATCH':
      return handleUpdate(req, res, boardId, userId);
    case 'DELETE':
      return handleDelete(req, res, boardId, userId);
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

/**
 * Get a board by ID
 * GET /api/boards/[id]
 */
async function handleGet(req, res, boardId, userId) {
  try {
    const board = await boardRepository.findById(boardId, userId);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check access
    const role = await boardMemberRepository.getUserRole(boardId, userId);
    if (!role) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json(board);
  } catch (error) {
    console.error('Error getting board:', error);
    return res.status(500).json({ error: 'Failed to get board' });
  }
}

/**
 * Update a board
 * PATCH /api/boards/[id]
 * Body: { name?, description?, settings?, thumbnail? }
 */
async function handleUpdate(req, res, boardId, userId) {
  try {
    // Check if user can edit
    const canEdit = await boardMemberRepository.canEdit(boardId, userId);
    if (!canEdit) {
      return res.status(403).json({ error: 'You do not have permission to edit this board' });
    }

    const { name, description, settings, thumbnail } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Board name cannot be empty' });
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (settings !== undefined) {
      updates.settings = settings;
    }

    if (thumbnail !== undefined) {
      updates.thumbnail = thumbnail;
    }

    const board = await boardRepository.update(boardId, updates);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    return res.status(200).json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    return res.status(500).json({ error: 'Failed to update board' });
  }
}

/**
 * Delete a board
 * DELETE /api/boards/[id]
 */
async function handleDelete(req, res, boardId, userId) {
  try {
    // Check if user is owner
    const role = await boardMemberRepository.getUserRole(boardId, userId);
    if (role !== 'owner') {
      return res.status(403).json({ error: 'Only the board owner can delete the board' });
    }

    const deleted = await boardRepository.delete(boardId);

    if (!deleted) {
      return res.status(404).json({ error: 'Board not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return res.status(500).json({ error: 'Failed to delete board' });
  }
}
