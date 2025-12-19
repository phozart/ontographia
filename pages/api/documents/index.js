// pages/api/documents/index.js
// List and create documents with access control

import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { documentRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List documents for project
    const { projectId, type, status } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const documents = await documentRepository.findByProject(projectId, { type, status });
      return res.status(200).json(documents);
    } catch (err) {
      console.error('Error listing documents:', err);
      return res.status(500).json({ error: 'Failed to list documents' });
    }
  }

  if (req.method === 'POST') {
    // Create document
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'manage_documents');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const document = await documentRepository.createDocument(req.body, user);
      return res.status(201).json(document);
    } catch (err) {
      if (err.message.includes('required')) {
        return res.status(400).json({ error: err.message });
      }
      console.error('Error creating document:', err);
      return res.status(500).json({ error: 'Failed to create document' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
