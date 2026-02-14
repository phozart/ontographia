/**
 * Cross-Space References API
 * GET: List cross-space references
 * POST: Create new cross-space reference
 */

import IntegrationRepository from '../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { domainId, artefactId, status, fromSpace, toSpace } = req.query;

      const references = await IntegrationRepository.getCrossSpaceReferences({
        domainId,
        artefactId,
        status,
        fromSpace,
        toSpace
      });

      // Aggregate stats
      const stats = {
        total: references.length,
        byStatus: references.reduce((acc, ref) => {
          acc[ref.status] = (acc[ref.status] || 0) + 1;
          return acc;
        }, {}),
        byFromSpace: references.reduce((acc, ref) => {
          acc[ref.from_space] = (acc[ref.from_space] || 0) + 1;
          return acc;
        }, {}),
        byToSpace: references.reduce((acc, ref) => {
          acc[ref.to_space] = (acc[ref.to_space] || 0) + 1;
          return acc;
        }, {})
      };

      res.status(200).json({ references, stats });

    } else if (method === 'POST') {
      const {
        domainId,
        fromArtefactId,
        toArtefactId,
        relationshipTypeId,
        relationshipType,
        fromSpace,
        toSpace,
        rationale,
        evidence
      } = req.body;

      // Validate required fields
      if (!domainId || !fromArtefactId || !toArtefactId || !relationshipType) {
        return res.status(400).json({
          error: 'Missing required fields: domainId, fromArtefactId, toArtefactId, relationshipType'
        });
      }

      // Prevent self-reference
      if (fromArtefactId === toArtefactId) {
        return res.status(400).json({ error: 'Cannot create self-reference' });
      }

      const createdBy = req.headers['x-user-id'] || 'system';

      const reference = await IntegrationRepository.createCrossSpaceReference({
        domainId,
        fromArtefactId,
        toArtefactId,
        relationshipTypeId,
        relationshipType,
        fromSpace,
        toSpace,
        rationale,
        evidence,
        createdBy
      });

      res.status(201).json(reference);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return errorResponse(res, 500, 'Cross-references operation failed', error);
  }
}
