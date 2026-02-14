// pages/api/notifications/index.js
// GET notifications for the current user

import { getNotifications, getUnreadCount } from '../../../lib/services/notificationService';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  // Auth: check x-user header (consistent with existing Blueprint routes)
  const userId = req.headers['x-user'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { unread, limit = '20', offset = '0' } = req.query;
    const unreadOnly = unread === 'true';

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(userId, {
        unreadOnly,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      }),
      getUnreadCount(userId),
    ]);

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch notifications', err);
  }
}
