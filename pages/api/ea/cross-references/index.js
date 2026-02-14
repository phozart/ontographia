// pages/api/ea/cross-references/index.js
// API for EA Cross-References (Aggregation Hub)
// GET - List cross-references with filters and pagination
// POST - Create new cross-reference

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { domain_id, source_space, ea_layer, sync_status, limit = 100, offset = 0 } = req.query;

  // GET - List cross-references
  if (req.method === 'GET') {
    if (!domain_id) {
      return res.status(400).json({ error: 'domain_id is required' });
    }

    try {
      // Build filters
      const filters = {};
      if (source_space) filters.sourceSpace = source_space;
      if (ea_layer) filters.eaLayer = ea_layer;
      if (sync_status) filters.syncStatus = sync_status;

      // Fetch cross-references
      const references = await eaRepository.findAllCrossReferences(domain_id, filters);

      // Get aggregation statistics
      const stats = await eaRepository.getAggregationStats(domain_id);

      // Apply pagination
      const paginatedRefs = references.slice(
        parseInt(offset, 10),
        parseInt(offset, 10) + parseInt(limit, 10)
      );

      return res.status(200).json({
        references: paginatedRefs,
        total: references.length,
        stats,
        pagination: {
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10),
          hasMore: parseInt(offset, 10) + paginatedRefs.length < references.length,
        },
      });
    } catch (err) {
      console.error('Error fetching cross-references:', err);
      return res.status(500).json({ error: 'Failed to fetch cross-references' });
    }
  }

  // POST - Create new cross-reference
  if (req.method === 'POST') {
    const {
      domain_id: bodyDomainId,
      source_space_code,
      source_artefact_id,
      source_artefact_type,
      source_artefact_name,
      ea_layer,
      ea_element_type,
      ea_element_id,
      created_by,
    } = req.body;

    const domainId = bodyDomainId || domain_id;

    if (!domainId || !source_space_code || !source_artefact_id) {
      return res.status(400).json({
        error: 'domain_id, source_space_code, and source_artefact_id are required',
      });
    }

    try {
      // Check if reference already exists
      const existing = await eaRepository.findCrossReferenceByArtefact(domainId, source_artefact_id);
      if (existing) {
        return res.status(409).json({
          error: 'Cross-reference already exists for this artefact',
          existingReference: existing,
        });
      }

      const reference = await eaRepository.createCrossReference({
        domainId,
        sourceSpaceCode: source_space_code,
        sourceArtefactId: source_artefact_id,
        sourceArtefactType: source_artefact_type,
        sourceArtefactName: source_artefact_name,
        eaLayer: ea_layer,
        eaElementType: ea_element_type,
        eaElementId: ea_element_id,
        createdBy: created_by,
      });

      return res.status(201).json(reference);
    } catch (err) {
      console.error('Error creating cross-reference:', err);
      return res.status(500).json({ error: 'Failed to create cross-reference' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
