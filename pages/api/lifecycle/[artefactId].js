// pages/api/lifecycle/[artefactId].js
// CRUD for lifecycle tracking state of an initiative/artefact.
// GET    /api/lifecycle/:artefactId  — get lifecycle state
// PUT    /api/lifecycle/:artefactId  — advance phase or update tier
// POST   /api/lifecycle/:artefactId  — create lifecycle tracking (if not exists)
// DELETE /api/lifecycle/:artefactId  — remove lifecycle tracking

import { query } from '../../../lib/pg';
import { PHASE_MAP, TIERS, getNextPhase } from '../../../lib/lifecycle/phases';

export default async function handler(req, res) {
  const { artefactId } = req.query;

  if (!artefactId) {
    return res.status(400).json({ error: 'artefactId is required' });
  }

  if (req.method === 'GET') {
    const result = await query(
      `SELECT * FROM lifecycle_tracking WHERE artefact_id = $1`,
      [artefactId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No lifecycle tracking for this artefact' });
    }
    const row = result.rows[0];
    return res.status(200).json({
      ...row,
      currentPhaseInfo: PHASE_MAP[row.current_phase] || null,
      tierInfo: TIERS[row.initiative_tier] || null,
      nextPhase: getNextPhase(row.current_phase, row.initiative_tier),
    });
  }

  if (req.method === 'POST') {
    const { domainId, tier = 'moderate' } = req.body || {};

    // Check if already exists
    const existing = await query(
      `SELECT id FROM lifecycle_tracking WHERE artefact_id = $1`,
      [artefactId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Lifecycle tracking already exists for this artefact' });
    }

    const result = await query(`
      INSERT INTO lifecycle_tracking (artefact_id, domain_id, initiative_tier, current_phase, phase_history)
      VALUES ($1, $2, $3, 'strategic_intake', $4)
      RETURNING *
    `, [
      artefactId,
      domainId || null,
      tier,
      JSON.stringify([{ phase: 'strategic_intake', enteredAt: new Date().toISOString() }]),
    ]);

    return res.status(201).json(result.rows[0]);
  }

  if (req.method === 'PUT') {
    const { action, tier, notes } = req.body || {};

    if (action === 'advance') {
      // Get current state
      const current = await query(
        `SELECT * FROM lifecycle_tracking WHERE artefact_id = $1`,
        [artefactId]
      );
      if (current.rows.length === 0) {
        return res.status(404).json({ error: 'No lifecycle tracking found' });
      }

      const row = current.rows[0];
      const next = getNextPhase(row.current_phase, row.initiative_tier);

      if (!next) {
        return res.status(400).json({ error: 'Already at final phase' });
      }

      const history = [...(row.phase_history || []), {
        phase: next.id,
        enteredAt: new Date().toISOString(),
        fromPhase: row.current_phase,
        notes: notes || null,
      }];

      const result = await query(`
        UPDATE lifecycle_tracking
        SET current_phase = $1, phase_history = $2, updated_at = NOW()
        WHERE artefact_id = $3
        RETURNING *
      `, [next.id, JSON.stringify(history), artefactId]);

      return res.status(200).json({
        ...result.rows[0],
        currentPhaseInfo: PHASE_MAP[next.id],
        nextPhase: getNextPhase(next.id, row.initiative_tier),
      });
    }

    if (action === 'set_tier' && tier) {
      if (!TIERS[tier]) {
        return res.status(400).json({ error: `Invalid tier: ${tier}` });
      }

      const result = await query(`
        UPDATE lifecycle_tracking
        SET initiative_tier = $1, updated_at = NOW()
        WHERE artefact_id = $2
        RETURNING *
      `, [tier, artefactId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No lifecycle tracking found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    return res.status(400).json({ error: 'Invalid action. Use "advance" or "set_tier".' });
  }

  if (req.method === 'DELETE') {
    await query(`DELETE FROM lifecycle_tracking WHERE artefact_id = $1`, [artefactId]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
