/**
 * CRDT State API for Board
 * Handles saving and loading Yjs CRDT state
 */

import { query } from '../../../../lib/pg';
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

/**
 * Convert binary data to base64 for JSON transport
 */
function bufferToBase64(buffer) {
  if (buffer instanceof Uint8Array) {
    return Buffer.from(buffer).toString('base64');
  }
  return Buffer.from(buffer).toString('base64');
}

/**
 * Convert base64 back to Uint8Array
 */
function base64ToUint8Array(base64) {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

export default async function handler(req, res) {
  const ctx = getUserFromReq(req);

  if (!ctx) {
    return res.status(401).json({ error: 'Missing user/role headers' });
  }

  const { id: boardId } = req.query;

  if (!boardId) {
    return res.status(400).json({ error: 'Board ID is required' });
  }

  // Check user access
  const userRole = await boardMemberRepository.getUserRole(boardId, ctx.userId);
  if (!userRole) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const canEdit = userRole === 'owner' || userRole === 'editor';

  switch (req.method) {
    case 'GET':
      return handleGetState(req, res, boardId);
    case 'POST':
      if (!canEdit) {
        return res.status(403).json({ error: 'Edit permission required' });
      }
      return handleSaveUpdate(req, res, boardId, ctx.userId);
    case 'PUT':
      if (!canEdit) {
        return res.status(403).json({ error: 'Edit permission required' });
      }
      return handleSaveSnapshot(req, res, boardId, ctx.userId);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

/**
 * GET - Load CRDT state (snapshot + updates)
 */
async function handleGetState(req, res, boardId) {
  try {
    // Get latest snapshot
    const snapshotResult = await query(
      `SELECT state_vector, snapshot
       FROM board_snapshots
       WHERE board_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [boardId]
    );

    // Get updates after snapshot
    let updates = [];
    if (snapshotResult.rows.length > 0) {
      const stateVector = snapshotResult.rows[0].state_vector;
      const updatesResult = await query(
        `SELECT update_data
         FROM board_updates
         WHERE board_id = $1
           AND created_at > (
             SELECT created_at FROM board_snapshots
             WHERE board_id = $1
             ORDER BY created_at DESC LIMIT 1
           )
         ORDER BY created_at ASC`,
        [boardId]
      );
      updates = updatesResult.rows.map(row => bufferToBase64(row.update_data));
    } else {
      // No snapshot, get all updates
      const updatesResult = await query(
        `SELECT update_data
         FROM board_updates
         WHERE board_id = $1
         ORDER BY created_at ASC`,
        [boardId]
      );
      updates = updatesResult.rows.map(row => bufferToBase64(row.update_data));
    }

    return res.status(200).json({
      snapshot: snapshotResult.rows.length > 0
        ? bufferToBase64(snapshotResult.rows[0].snapshot)
        : null,
      stateVector: snapshotResult.rows.length > 0
        ? bufferToBase64(snapshotResult.rows[0].state_vector)
        : null,
      updates,
      updateCount: updates.length,
    });
  } catch (error) {
    console.error('Error loading CRDT state:', error);
    return res.status(500).json({ error: 'Failed to load state' });
  }
}

/**
 * POST - Save incremental update
 */
async function handleSaveUpdate(req, res, boardId, userId) {
  try {
    const { update, origin } = req.body;

    if (!update) {
      return res.status(400).json({ error: 'Update data is required' });
    }

    const updateData = base64ToUint8Array(update);

    await query(
      `INSERT INTO board_updates (board_id, update_data, user_id, origin)
       VALUES ($1, $2, $3, $4)`,
      [boardId, Buffer.from(updateData), userId, origin || 'client']
    );

    // Check if we should create a snapshot (every 100 updates)
    const countResult = await query(
      `SELECT COUNT(*) as count FROM board_updates
       WHERE board_id = $1
       AND created_at > COALESCE(
         (SELECT created_at FROM board_snapshots WHERE board_id = $1 ORDER BY created_at DESC LIMIT 1),
         '1970-01-01'
       )`,
      [boardId]
    );

    const updateCount = parseInt(countResult.rows[0].count, 10);
    const shouldSnapshot = updateCount >= 100;

    return res.status(201).json({
      success: true,
      shouldSnapshot,
      updateCount,
    });
  } catch (error) {
    console.error('Error saving update:', error);
    return res.status(500).json({ error: 'Failed to save update' });
  }
}

/**
 * PUT - Save full snapshot
 */
async function handleSaveSnapshot(req, res, boardId, userId) {
  try {
    const { snapshot, stateVector } = req.body;

    if (!snapshot || !stateVector) {
      return res.status(400).json({ error: 'Snapshot and stateVector are required' });
    }

    const snapshotData = base64ToUint8Array(snapshot);
    const stateVectorData = base64ToUint8Array(stateVector);

    // Save snapshot
    await query(
      `INSERT INTO board_snapshots (board_id, snapshot, state_vector, created_by)
       VALUES ($1, $2, $3, $4)`,
      [boardId, Buffer.from(snapshotData), Buffer.from(stateVectorData), userId]
    );

    // Clean up old updates (keep only those after the new snapshot)
    await query(
      `DELETE FROM board_updates
       WHERE board_id = $1
       AND created_at < now() - interval '1 second'`,
      [boardId]
    );

    // Keep only last 5 snapshots
    await query(
      `DELETE FROM board_snapshots
       WHERE board_id = $1
       AND id NOT IN (
         SELECT id FROM board_snapshots
         WHERE board_id = $1
         ORDER BY created_at DESC
         LIMIT 5
       )`,
      [boardId]
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving snapshot:', error);
    return res.status(500).json({ error: 'Failed to save snapshot' });
  }
}
