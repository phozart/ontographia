// pages/api/philosophy/inquiries/[id].js
// API for single Philosophy inquiry operations

import { philosophyRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Inquiry ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const inquiry = await philosophyRepository.findInquiryByIdWithStats(id);

      if (!inquiry) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }

      if (userRole !== 'admin' && inquiry.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json(inquiry);
    } catch (err) {
      console.error('Error fetching philosophy inquiry:', err);
      return res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { found, userId: ownerId } = await philosophyRepository.checkOwnership(id);

      if (!found) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }
      if (userRole !== 'admin' && ownerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const {
        title,
        description,
        centralQuestion,
        tags,
        status,
        activeLens,
        properties
      } = req.body;

      const inquiry = await philosophyRepository.updateInquiry(id, {
        title,
        description,
        centralQuestion,
        tags,
        status,
        activeLens,
        properties,
      });

      if (!inquiry) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      return res.status(200).json(inquiry);
    } catch (err) {
      console.error('Error updating philosophy inquiry:', err);
      return res.status(500).json({ error: 'Failed to update inquiry' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { found, userId: ownerId } = await philosophyRepository.checkOwnership(id);

      if (!found) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }
      if (userRole !== 'admin' && ownerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await philosophyRepository.deleteInquiry(id);
      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting philosophy inquiry:', err);
      return res.status(500).json({ error: 'Failed to delete inquiry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
