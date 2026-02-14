/**
 * EA Import API
 *
 * POST /api/ea/import - Import artefacts from source spaces into EA context
 *
 * Creates EA cross-references to source artefacts for bidirectional navigation.
 * Optionally creates EA elements that mirror the source artefacts.
 *
 * @module pages/api/ea/import
 */

import { eaAggregationService, AGGREGATION_SOURCES } from '../../../lib/services/EAAggregationService';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // POST - Import artefacts from source spaces
  if (req.method === 'POST') {
    const {
      domainId,
      sourceSpaceCode,
      artefactIds,
      createElements,
      projectId,
    } = req.body;

    // Validate required fields
    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    if (!sourceSpaceCode) {
      return res.status(400).json({ error: 'Source space code is required' });
    }

    const normalizedCode = sourceSpaceCode.toUpperCase();
    if (!AGGREGATION_SOURCES[normalizedCode]) {
      return res.status(400).json({
        error: `Invalid source space code: ${sourceSpaceCode}`,
        validCodes: Object.keys(AGGREGATION_SOURCES),
      });
    }

    if (!artefactIds || !Array.isArray(artefactIds) || artefactIds.length === 0) {
      return res.status(400).json({ error: 'artefactIds must be a non-empty array' });
    }

    // Validate artefact IDs format (UUIDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = artefactIds.filter(id => !uuidRegex.test(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        error: 'Invalid artefact ID format',
        invalidIds,
      });
    }

    // Check domain access (need edit permission to import)
    const { hasAccess, error: accessError } = await checkDomainAccess(req, domainId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error: accessError || 'Access denied' });
    }

    // Resolve user ID from username
    let userId = user;
    try {
      const userResult = await query('SELECT id FROM users WHERE username = $1', [user]);
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }
    } catch (err) {
      console.warn('Could not resolve user ID, using username:', err.message);
    }

    try {
      const result = await eaAggregationService.importToEA(
        normalizedCode,
        artefactIds,
        domainId,
        userId,
        {
          createElements: createElements === true,
          projectId,
        }
      );

      return res.status(200).json(result);
    } catch (err) {
      console.error('Error importing artefacts to EA:', err);
      return res.status(500).json({
        error: 'Failed to import artefacts',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }

  // GET - Get sync status and detect changes
  if (req.method === 'GET') {
    const { domainId, projectId, since } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    // Check domain access
    const { hasAccess, error: accessError } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error: accessError || 'Access denied' });
    }

    try {
      const sinceDate = since ? new Date(since) : undefined;

      const result = await eaAggregationService.syncChanges(domainId, {
        projectId,
        since: sinceDate,
      });

      return res.status(200).json(result);
    } catch (err) {
      console.error('Error checking sync status:', err);
      return res.status(500).json({
        error: 'Failed to check sync status',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }

  // DELETE - Remove a cross-reference
  if (req.method === 'DELETE') {
    const { referenceId, deleteEaElement } = req.body || {};

    if (!referenceId) {
      return res.status(400).json({ error: 'Reference ID is required' });
    }

    // Get the reference to check domain access
    const refResult = await query(
      'SELECT domain_id FROM ea_cross_references WHERE id = $1',
      [referenceId]
    );

    if (refResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cross-reference not found' });
    }

    const { hasAccess, error: accessError } = await checkDomainAccess(
      req,
      refResult.rows[0].domain_id,
      'delete'
    );
    if (!hasAccess) {
      return res.status(403).json({ error: accessError || 'Access denied' });
    }

    try {
      const deleted = await eaAggregationService.deleteCrossReference(referenceId, {
        deleteEaElement: deleteEaElement === true,
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Cross-reference not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Cross-reference deleted',
        deletedEaElement: deleteEaElement === true,
      });
    } catch (err) {
      console.error('Error deleting cross-reference:', err);
      return res.status(500).json({
        error: 'Failed to delete cross-reference',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
