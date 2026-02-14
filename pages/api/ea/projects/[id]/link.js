/**
 * EA Projects Link API - Link/unlink PDS artefacts to EA elements
 *
 * POST /api/ea/projects/[id]/link - Link a PDS artefact to an EA element
 * DELETE /api/ea/projects/[id]/link - Remove link between PDS artefact and EA element
 *
 * @module pages/api/ea/projects/[id]/link
 */

import { query, getClient } from '../../../../../lib/pg';
import { getUserFromRequest } from '../../../../../lib/projectAccess';
import { TYPE_MAPPINGS } from '../../../../../lib/services/EAAggregationService';
import { errorResponse } from '../../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query; // This is the PDS artefact ID

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID is required' });
  }

  // POST - Link PDS artefact to EA element
  if (req.method === 'POST') {
    const { eaElementId } = req.body;

    if (!eaElementId) {
      return res.status(400).json({ error: 'EA element ID is required' });
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Verify the PDS artefact exists and is a PDS type
      const artefactResult = await client.query(
        `SELECT a.*, d.id as domain_id FROM artefacts a
         LEFT JOIN domains d ON d.id = a.domain_id
         WHERE a.id = $1 AND a.artefact_type LIKE 'pds_%'`,
        [id]
      );

      if (artefactResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'PDS artefact not found' });
      }

      const artefact = artefactResult.rows[0];

      // Verify the EA element exists
      const elementResult = await client.query(
        `SELECT * FROM ea_elements WHERE id = $1`,
        [eaElementId]
      );

      if (elementResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'EA element not found' });
      }

      const eaElement = elementResult.rows[0];

      // Check if cross-reference already exists
      const existingRef = await client.query(
        `SELECT * FROM ea_cross_references
         WHERE source_artefact_id = $1 AND domain_id = $2`,
        [id, artefact.domain_id]
      );

      const mapping = TYPE_MAPPINGS[artefact.artefact_type];

      if (existingRef.rows.length > 0) {
        // Update existing cross-reference
        await client.query(
          `UPDATE ea_cross_references SET
            ea_element_id = $1,
            ea_element_type = $2,
            ea_layer = $3,
            sync_status = 'synced',
            last_synced_at = now(),
            updated_at = now()
           WHERE id = $4`,
          [
            eaElementId,
            eaElement.element_type,
            eaElement.layer,
            existingRef.rows[0].id,
          ]
        );

        await client.query('COMMIT');

        return res.status(200).json({
          success: true,
          message: 'Cross-reference updated',
          crossReferenceId: existingRef.rows[0].id,
          artefactId: id,
          eaElementId,
        });
      } else {
        // Create new cross-reference
        const insertResult = await client.query(
          `INSERT INTO ea_cross_references (
            domain_id,
            source_space_code,
            source_artefact_id,
            source_artefact_type,
            source_artefact_name,
            ea_layer,
            ea_element_type,
            ea_element_id,
            sync_status,
            last_synced_at,
            created_by,
            created_at,
            updated_at
          ) VALUES ($1, 'PDS', $2, $3, $4, $5, $6, $7, 'synced', now(), $8, now(), now())
          RETURNING id`,
          [
            artefact.domain_id,
            id,
            artefact.artefact_type,
            artefact.name,
            mapping?.eaLayer || eaElement.layer,
            eaElement.element_type,
            eaElementId,
            user,
          ]
        );

        await client.query('COMMIT');

        return res.status(201).json({
          success: true,
          message: 'Cross-reference created',
          crossReferenceId: insertResult.rows[0].id,
          artefactId: id,
          eaElementId,
        });
      }
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error linking PDS artefact to EA element:', err);
      return res.status(500).json({
        error: 'Failed to link artefact',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    } finally {
      client.release();
    }
  }

  // DELETE - Remove link between PDS artefact and EA element
  if (req.method === 'DELETE') {
    const { eaElementId, deleteElement = false } = req.query;

    try {
      // Find the cross-reference
      const refResult = await query(
        `SELECT * FROM ea_cross_references
         WHERE source_artefact_id = $1`,
        [id]
      );

      if (refResult.rows.length === 0) {
        return res.status(404).json({ error: 'Cross-reference not found' });
      }

      const crossRef = refResult.rows[0];

      // If a specific EA element is provided, verify it matches
      if (eaElementId && crossRef.ea_element_id !== eaElementId) {
        return res.status(400).json({
          error: 'EA element ID does not match the linked element',
        });
      }

      const client = await getClient();

      try {
        await client.query('BEGIN');

        // Optionally delete the EA element
        if (deleteElement === 'true' && crossRef.ea_element_id) {
          // First delete any relationships involving this element
          await client.query(
            `DELETE FROM ea_relationships
             WHERE source_id = $1 OR target_id = $1`,
            [crossRef.ea_element_id]
          );

          // Delete the element
          await client.query(
            `DELETE FROM ea_elements WHERE id = $1`,
            [crossRef.ea_element_id]
          );
        } else if (crossRef.ea_element_id) {
          // Just unlink - set ea_element_id to null
          await client.query(
            `UPDATE ea_cross_references SET
              ea_element_id = NULL,
              sync_status = 'pending',
              updated_at = now()
             WHERE id = $1`,
            [crossRef.id]
          );

          await client.query('COMMIT');

          return res.status(200).json({
            success: true,
            message: 'Link removed (cross-reference kept)',
            crossReferenceId: crossRef.id,
            artefactId: id,
          });
        }

        // Delete the cross-reference entirely
        await client.query(
          `DELETE FROM ea_cross_references WHERE id = $1`,
          [crossRef.id]
        );

        await client.query('COMMIT');

        return res.status(200).json({
          success: true,
          message: 'Cross-reference deleted',
          artefactId: id,
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error removing link:', err);
      return res.status(500).json({
        error: 'Failed to remove link',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
