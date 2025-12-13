// pages/api/presence.js
// Simple presence tracking for collaboration indicators

// In-memory presence store (resets on server restart)
// In production, use Redis or a database
const presenceStore = new Map();

// Clean up stale presence entries (older than 30 seconds)
const PRESENCE_TIMEOUT = 30000;

function cleanupStalePresence() {
  const now = Date.now();
  for (const [key, entry] of presenceStore.entries()) {
    if (now - entry.lastSeen > PRESENCE_TIMEOUT) {
      presenceStore.delete(key);
    }
  }
}

export default function handler(req, res) {
  cleanupStalePresence();

  if (req.method === 'POST') {
    // Update presence
    const { user, page, diagramId } = req.body;

    if (!user || !page) {
      return res.status(400).json({ error: 'Missing user or page' });
    }

    const presenceKey = `${user}-${page}`;
    presenceStore.set(presenceKey, {
      user,
      page,
      diagramId,
      lastSeen: Date.now(),
    });

    // Return all users on this page
    const pageUsers = [];
    for (const entry of presenceStore.values()) {
      if (entry.page === page && (diagramId === undefined || entry.diagramId === diagramId)) {
        pageUsers.push({
          user: entry.user,
          diagramId: entry.diagramId,
        });
      }
    }

    return res.status(200).json({ users: pageUsers });
  }

  if (req.method === 'GET') {
    // Get presence for a page
    const { page, diagramId } = req.query;

    if (!page) {
      return res.status(400).json({ error: 'Missing page parameter' });
    }

    const pageUsers = [];
    for (const entry of presenceStore.values()) {
      if (entry.page === page && (diagramId === undefined || entry.diagramId === diagramId)) {
        pageUsers.push({
          user: entry.user,
          diagramId: entry.diagramId,
        });
      }
    }

    return res.status(200).json({ users: pageUsers });
  }

  if (req.method === 'DELETE') {
    // Remove presence
    const { user, page } = req.body;

    if (!user || !page) {
      return res.status(400).json({ error: 'Missing user or page' });
    }

    const presenceKey = `${user}-${page}`;
    presenceStore.delete(presenceKey);

    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
