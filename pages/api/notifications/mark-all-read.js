// pages/api/notifications/mark-all-read.js
// POST: mark all notifications as read for the current user

import { markAllAsRead } from '../../../lib/services/notificationService';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  // Auth: check x-user header
  const userId = req.headers['x-user'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const count = await markAllAsRead(userId);
    return res.status(200).json({ markedAsRead: count });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to mark all notifications as read', err);
  }
}
