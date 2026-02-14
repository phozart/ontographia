/**
 * Admin API to fix menu duplicates
 *
 * POST - Clean up duplicate menu items and sections, reset to consolidated structure
 *
 * This endpoint:
 * 1. Removes legacy sections (knowledge, workspace, reasoning)
 * 2. Removes duplicate menu items
 * 3. Resets the menu_config_default to the clean consolidated structure
 */

import { query } from '../../../lib/pg';

// Clean default menu configuration - each item appears only once
const CLEAN_MENU_CONFIG = {
  sections: [
    {
      key: 'navigation',
      label: 'Navigation',
      expanded: true,
      items: [
        { key: 'product', label: 'Product' },
      ],
    },
    {
      key: 'main-flow',
      label: 'Main Flow',
      expanded: true,
      items: [
        { key: 'blueprint-studio', label: 'Blueprint Studio' },
        { key: 'analysis-studio', label: 'Analysis Studio' },
        { key: 'project-design', label: 'Project Studio' },
        { key: 'enterprise-studio', label: 'Enterprise Studio' },
        { key: 'gtm-studio', label: 'GTM Studio' },
      ],
    },
    {
      key: 'thinking-tools',
      label: 'Thinking Tools',
      expanded: true,
      items: [
        { key: 'system-dynamics', label: 'System Dynamics' },
        { key: 'work-design', label: 'Work Design' },
        { key: 'learning', label: 'Learning Studio' },
      ],
    },
    {
      key: 'infrastructure',
      label: 'Infrastructure',
      expanded: true,
      items: [
        { key: 'diagram-studio', label: 'Diagram Studio' },
        { key: 'knowledge-studio', label: 'Knowledge Studio' },
      ],
    },
  ],
};

export default async function handler(req, res) {
  const { method } = req;

  // Check admin role
  const role = req.headers['x-role'];
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const user = req.headers['x-user'];

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  try {
    const results = {
      sectionsRemoved: 0,
      itemsUpdated: 0,
      configReset: false,
    };

    // 1. Remove legacy sections (keep only the 4 main ones)
    const legacySections = ['knowledge', 'workspace', 'reasoning'];
    const deleteResult = await query(`
      DELETE FROM menu_sections
      WHERE key = ANY($1)
      RETURNING key
    `, [legacySections]);
    results.sectionsRemoved = deleteResult.rowCount;

    // 2. Update menu items to use new section structure
    // Map old sections to new sections
    const sectionMapping = {
      'knowledge': 'infrastructure',
      'workspace': 'main-flow',
      'reasoning': 'thinking-tools',
    };

    for (const [oldSection, newSection] of Object.entries(sectionMapping)) {
      const updateResult = await query(`
        UPDATE menu_items
        SET default_section = $1
        WHERE default_section = $2
      `, [newSection, oldSection]);
      results.itemsUpdated += updateResult.rowCount;
    }

    // 3. Reset the menu_config_default to clean structure
    // First, deactivate all existing configs
    await query(`UPDATE menu_config_default SET is_active = false`);

    // Then create a new clean config
    await query(`
      INSERT INTO menu_config_default (version, config, is_active, created_by)
      VALUES (
        (SELECT COALESCE(MAX(version), 0) + 1 FROM menu_config_default),
        $1,
        true,
        $2
      )
    `, [JSON.stringify(CLEAN_MENU_CONFIG), user || 'system']);
    results.configReset = true;

    console.log('[Admin] Menu duplicates fixed:', results);

    return res.json({
      success: true,
      message: 'Menu duplicates have been cleaned up',
      results,
    });
  } catch (error) {
    console.error('[API /admin/fix-menu-duplicates]', error);
    return res.status(500).json({ error: 'Internal server error', ...(process.env.NODE_ENV !== 'production' && { details: error.message }) });
  }
}
