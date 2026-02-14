// pages/api/notifications/[id].js
// PATCH: mark notification as read
// DELETE: delete a notification

import { markAsRead, deleteNotification } from '../../../lib/services/notificationService';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  // Auth: check x-user header
  const userId = req.headers['x-user'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Notification ID is required' });
  }

  if (req.method === 'PATCH') {
    try {
      const { is_read } = req.body || {};

      if (is_read !== true) {
        return res.status(400).json({ error: 'Only { is_read: true } is supported' });
      }

      const updated = await markAsRead(id, userId);
      if (!updated) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      return res.status(200).json({ notification: updated });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to mark notification as read', err);
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteNotification(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      return res.status(200).json({ deleted: true });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to delete notification', err);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
