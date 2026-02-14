// pages/api/graph/materialise.js
// Manual graph materialisation endpoint — backfill or re-materialise artefacts

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { materialiseArtefact, dematerialiseArtefact } from '../../../lib/services/graphMaterialisation';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  }
  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

async function handlePost(req, res) {
  const user = getUserFromRequest(req);
  const { artefact_id, domain_id, backfill } = req.body;

  try {
    // Single artefact materialisation
    if (artefact_id) {
      // Try analysis_artefacts first, then artefacts
      let result = await query('SELECT * FROM analysis_artefacts WHERE id = $1', [artefact_id]);
      let sourceTable = 'analysis_artefacts';

      if (result.rows.length === 0) {
        result = await query('SELECT * FROM artefacts WHERE id = $1', [artefact_id]);
        sourceTable = 'artefacts';
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      const materialisedResult = await materialiseArtefact(result.rows[0], { sourceTable });
      return res.status(200).json({
        success: true,
        primaryNode: materialisedResult.primaryNode?.id,
        subNodes: materialisedResult.subNodes.length,
        edges: materialisedResult.edges.length,
      });
    }

    // Batch backfill for a domain
    if (backfill && domain_id) {
      let processed = 0;
      let errors = 0;

      // Backfill analysis_artefacts
      const analysisResult = await query(
        'SELECT * FROM analysis_artefacts WHERE domain_id = $1',
        [domain_id]
      );
      for (const artefact of analysisResult.rows) {
        try {
          await materialiseArtefact(artefact, { sourceTable: 'analysis_artefacts' });
          processed++;
        } catch (err) {
          console.error(`[Materialise] Failed for analysis artefact ${artefact.id}:`, err.message);
          errors++;
        }
      }

      // Backfill artefacts table
      const artefactsResult = await query(
        'SELECT * FROM artefacts WHERE domain_id = $1',
        [domain_id]
      );
      for (const artefact of artefactsResult.rows) {
        try {
          await materialiseArtefact(artefact, { sourceTable: 'artefacts' });
          processed++;
        } catch (err) {
          console.error(`[Materialise] Failed for artefact ${artefact.id}:`, err.message);
          errors++;
        }
      }

      return res.status(200).json({
        success: true,
        processed,
        errors,
        message: `Materialised ${processed} artefacts (${errors} errors)`,
      });
    }

    return res.status(400).json({ error: 'Provide artefact_id or backfill + domain_id' });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to materialise', error);
  }
}
