// pages/api/boards/[id]/members.js
// Board members API

import { boardMemberRepository } from '../../../../lib/repositories/BoardRepository';

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

  // Check if user has access to the board
  const userRole = await boardMemberRepository.getUserRole(boardId, userId);
  if (!userRole) {
    return res.status(403).json({ error: 'Access denied' });
  }

  switch (req.method) {
    case 'GET':
      return handleList(req, res, boardId);
    case 'POST':
      return handleAdd(req, res, boardId, userId, userRole);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

/**
 * List board members
 * GET /api/boards/[id]/members
 */
async function handleList(req, res, boardId) {
  try {
    const members = await boardMemberRepository.listForBoard(boardId);
    return res.status(200).json(members);
  } catch (error) {
    console.error('Error listing board members:', error);
    return res.status(500).json({ error: 'Failed to list members' });
  }
}

/**
 * Add a member to the board
 * POST /api/boards/[id]/members
 * Body: { userId, role }
 */
async function handleAdd(req, res, boardId, currentUserId, currentUserRole) {
  try {
    // Only owner and editor can add members
    if (currentUserRole !== 'owner' && currentUserRole !== 'editor') {
      return res.status(403).json({ error: 'You do not have permission to add members' });
    }

    const { userId: newUserId, role } = req.body;

    if (!newUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate role
    const validRoles = ['editor', 'commenter', 'viewer'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be editor, commenter, or viewer' });
    }

    // Only owner can add editors
    if (role === 'editor' && currentUserRole !== 'owner') {
      return res.status(403).json({ error: 'Only the owner can add editors' });
    }

    const member = await boardMemberRepository.addMember(boardId, newUserId, role, currentUserId);

    return res.status(201).json({
      id: member.id,
      boardId: member.board_id,
      userId: member.user_id,
      role: member.role,
      invitedBy: member.invited_by,
      invitedAt: member.invited_at,
    });
  } catch (error) {
    console.error('Error adding board member:', error);
    return res.status(500).json({ error: 'Failed to add member' });
  }
}
