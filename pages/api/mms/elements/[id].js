// pages/api/mms/elements/[id].js
// Mental Model Studio - Single element CRUD API

import { mmsRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Element ID is required' });
  }

  // Helper to check access
  async function checkAccess() {
    const access = await mmsRepository.checkElementAccess(id);
    if (!access.found) {
      return { error: 'Element not found', status: 404 };
    }
    const hasAccess = userRole === 'admin' || access.userId === userId;
    if (!hasAccess) {
      return { error: 'Access denied', status: 403 };
    }
    return { hasAccess: true, situationId: access.situationId };
  }

  if (req.method === 'GET') {
    try {
      const accessCheck = await checkAccess();
      if (accessCheck.error) {
        return res.status(accessCheck.status).json({ error: accessCheck.error });
      }

      const element = await mmsRepository.findElementById(id);
      return res.status(200).json(element);
    } catch (err) {
      console.error('Error fetching MMS element:', err);
      return res.status(500).json({ error: 'Failed to fetch element' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const accessCheck = await checkAccess();
      if (accessCheck.error) {
        return res.status(accessCheck.status).json({ error: accessCheck.error });
      }

      const {
        content,
        properties,
        confidence,
        source,
        positionX,
        positionY
      } = req.body;

      if (content === undefined && properties === undefined && confidence === undefined &&
          source === undefined && positionX === undefined && positionY === undefined) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const element = await mmsRepository.updateElement(id, {
        content,
        properties,
        confidence,
        source,
        positionX,
        positionY,
      });

      return res.status(200).json(element);
    } catch (err) {
      console.error('Error updating MMS element:', err);
      return res.status(500).json({ error: 'Failed to update element' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const accessCheck = await checkAccess();
      if (accessCheck.error) {
        return res.status(accessCheck.status).json({ error: accessCheck.error });
      }

      await mmsRepository.deleteElement(id);
      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting MMS element:', err);
      return res.status(500).json({ error: 'Failed to delete element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
