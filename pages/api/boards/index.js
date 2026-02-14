// pages/api/boards/index.js
// Board list and create API

import { boardRepository } from '../../../lib/repositories/BoardRepository';

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

  switch (req.method) {
    case 'GET':
      return handleList(req, res, userId);
    case 'POST':
      return handleCreate(req, res, userId);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

/**
 * List boards for the current user
 * GET /api/boards?workspaceId=...&domainId=...&search=...&limit=...&offset=...
 */
async function handleList(req, res, userId) {
  try {
    const {
      workspaceId,
      domainId,
      search,
      limit = '20',
      offset = '0',
      orderBy = 'updated_at',
      orderDirection = 'DESC',
    } = req.query;

    const result = await boardRepository.listForUser(userId, {
      workspaceId,
      domainId,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      orderBy,
      orderDirection,
    });

    return res.status(200).json({
      boards: result.boards,
      pagination: {
        total: result.total,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      },
    });
  } catch (error) {
    console.error('Error listing boards:', error);
    return res.status(500).json({ error: 'Failed to list boards' });
  }
}

/**
 * Create a new board
 * POST /api/boards
 * Body: { name, description?, workspaceId?, domainId?, settings? }
 */
async function handleCreate(req, res, userId) {
  try {
    const { name, description, workspaceId, domainId, settings, templateId } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    // If creating from template, duplicate it
    if (templateId) {
      const newBoard = await boardRepository.duplicate(templateId, userId, name);
      return res.status(201).json(newBoard);
    }

    // Create new board
    const board = await boardRepository.create({
      name: name.trim(),
      description: description || '',
      workspaceId,
      domainId,
      settings,
      createdBy: userId,
    });

    return res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    return res.status(500).json({ error: 'Failed to create board' });
  }
}
