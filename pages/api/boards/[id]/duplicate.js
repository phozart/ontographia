// pages/api/boards/[id]/duplicate.js
// Duplicate board API

import { boardRepository, boardMemberRepository } from '../../../../lib/repositories/BoardRepository';

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const ctx = getUserFromReq(req);

  if (!ctx) {
    return res.status(401).json({ error: 'Missing user/role headers' });
  }

  const userId = ctx.userId;
  const { id: boardId } = req.query;

  if (!boardId) {
    return res.status(400).json({ error: 'Board ID is required' });
  }

  try {
    // Check if user has access to the source board
    const role = await boardMemberRepository.getUserRole(boardId, userId);
    if (!role) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name } = req.body;

    const newBoard = await boardRepository.duplicate(boardId, userId, name);

    return res.status(201).json(newBoard);
  } catch (error) {
    console.error('Error duplicating board:', error);
    return res.status(500).json({ error: 'Failed to duplicate board' });
  }
}
