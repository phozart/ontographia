/**
 * Admin API to fix menu_items table schema
 * POST /api/admin/fix-menu-schema
 */

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const role = req.headers['x-role'];
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const results = [];

  try {
    // Add missing columns to menu_items if they don't exist
    const columnsToAdd = [
      { name: 'href', type: 'TEXT', default: "''" },
      { name: 'icon', type: 'TEXT', default: "'HomeIcon'" },
      { name: 'default_section', type: 'TEXT', default: null },
      { name: 'roles', type: 'TEXT[]', default: "'{admin,editor,viewer}'" },
      { name: 'is_active', type: 'BOOLEAN', default: 'true' },
      { name: 'sort_order', type: 'INTEGER', default: '0' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'now()' },
    ];

    for (const col of columnsToAdd) {
      try {
        const defaultClause = col.default ? ` DEFAULT ${col.default}` : '';
        await query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${defaultClause}`);
        results.push(`Added column ${col.name}`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          results.push(`Error adding ${col.name}: ${err.message}`);
        }
      }
    }

    // Also ensure menu_config_default has proper columns
    try {
      await query(`ALTER TABLE menu_config_default ADD COLUMN IF NOT EXISTS created_by TEXT`);
      results.push('Added created_by to menu_config_default');
    } catch (err) {
      results.push(`menu_config_default created_by: ${err.message}`);
    }

    try {
      await query(`ALTER TABLE menu_config_default ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`);
      results.push('Added updated_at to menu_config_default');
    } catch (err) {
      results.push(`menu_config_default updated_at: ${err.message}`);
    }

    return res.json({ success: true, results });

  } catch (error) {
    console.error('[API /admin/fix-menu-schema]', error);
    return res.status(500).json({ error: 'Schema fix failed', results, ...(process.env.NODE_ENV !== 'production' && { details: error.message }) });
  }
}
