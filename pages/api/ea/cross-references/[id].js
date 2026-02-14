// pages/api/ea/cross-references/[id].js
// API for single EA Cross-Reference
// GET - Get cross-reference by ID
// PUT - Update cross-reference
// DELETE - Delete cross-reference

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Cross-reference ID is required' });
  }

  // GET - Get single cross-reference with full details
  if (req.method === 'GET') {
    try {
      const reference = await eaRepository.findCrossReferenceById(id);

      if (!reference) {
        return res.status(404).json({ error: 'Cross-reference not found' });
      }

      return res.status(200).json(reference);
    } catch (err) {
      console.error('Error fetching cross-reference:', err);
      return res.status(500).json({ error: 'Failed to fetch cross-reference' });
    }
  }

  // PUT - Update cross-reference
  if (req.method === 'PUT') {
    const {
      sourceArtefactName,
      source_artefact_name,
      eaLayer,
      ea_layer,
      eaElementType,
      ea_element_type,
      eaElementId,
      ea_element_id,
      syncStatus,
      sync_status,
    } = req.body;

    try {
      const reference = await eaRepository.updateCrossReference(id, {
        sourceArtefactName: sourceArtefactName || source_artefact_name,
        eaLayer: eaLayer || ea_layer,
        eaElementType: eaElementType || ea_element_type,
        eaElementId: eaElementId || ea_element_id,
        syncStatus: syncStatus || sync_status,
      });

      if (!reference) {
        return res.status(404).json({ error: 'Cross-reference not found' });
      }

      return res.status(200).json(reference);
    } catch (err) {
      console.error('Error updating cross-reference:', err);
      return res.status(500).json({ error: 'Failed to update cross-reference' });
    }
  }

  // DELETE - Delete cross-reference
  if (req.method === 'DELETE') {
    const { delete_ea_element } = req.query;

    try {
      // If requested, also delete the linked EA element
      if (delete_ea_element === 'true') {
        const reference = await eaRepository.findCrossReferenceById(id);
        if (reference?.ea_element_id) {
          await eaRepository.deleteElement(reference.ea_element_id);
        }
      }

      const deleted = await eaRepository.deleteCrossReference(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Cross-reference not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting cross-reference:', err);
      return res.status(500).json({ error: 'Failed to delete cross-reference' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
