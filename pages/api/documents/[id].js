// pages/api/documents/[id].js
// Get, update, delete single document

import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { documentRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Document ID required' });
  }

  // Get document's project ID for access checking
  const projectId = await documentRepository.getProjectId(id);
  if (!projectId) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (req.method === 'GET') {
    // Get single document
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const document = await documentRepository.findByIdWithDetails(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      return res.status(200).json(document);
    } catch (err) {
      console.error('Error fetching document:', err);
      return res.status(500).json({ error: 'Failed to fetch document' });
    }
  }

  if (req.method === 'PUT') {
    // Update document
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'manage_documents');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const document = await documentRepository.updateDocument(id, req.body);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      return res.status(200).json(document);
    } catch (err) {
      console.error('Error updating document:', err);
      return res.status(500).json({ error: 'Failed to update document' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete document
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'manage_documents');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      await documentRepository.deleteDocument(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting document:', err);
      return res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
