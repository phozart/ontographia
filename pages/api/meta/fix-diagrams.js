// pages/api/meta/fix-diagrams.js
// One-time migration to fix the diagrams table type constraint

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Use GET or POST' });
  }

  try {
    // Drop the type check constraint if it exists
    await query(`
      ALTER TABLE diagrams DROP CONSTRAINT IF EXISTS diagrams_type_check
    `);

    return res.status(200).json({
      ok: true,
      message: 'Diagrams table constraint dropped. You can now create product-design diagrams.'
    });
  } catch (e) {
    console.error('Fix diagrams error:', e);
    return res.status(500).json({ error: 'Failed to fix diagrams table', details: e.message });
  }
}
