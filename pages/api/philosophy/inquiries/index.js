// pages/api/philosophy/inquiries/index.js
// API for managing Philosophy inquiries

import { philosophyRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { domain_id, status } = req.query;

      const inquiries = await philosophyRepository.findInquiries({
        domainId: domain_id,
        status,
        userId,
        userRole,
      });

      return res.status(200).json(inquiries);
    } catch (err) {
      console.error('Error fetching philosophy inquiries:', err);
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        domainId,
        title,
        description,
        centralQuestion,
        tags,
        status,
        activeLens,
        properties
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const inquiry = await philosophyRepository.createInquiry({
        domainId,
        userId,
        title,
        description,
        centralQuestion,
        tags,
        status,
        activeLens,
        properties,
      });

      return res.status(201).json(inquiry);
    } catch (err) {
      console.error('Error creating philosophy inquiry:', err);
      return res.status(500).json({ error: 'Failed to create inquiry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
