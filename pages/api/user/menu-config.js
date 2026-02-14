/**
 * User Menu Configuration API
 *
 * GET - Get the admin-managed default menu configuration
 *
 * Note: Menu configuration is admin-only. Users receive the default
 * configuration defined by admins via /admin/menu-config.
 * Auto-seeds default configuration if none exists.
 */

import { menuRepository } from '../../../lib/repositories';
import { query } from '../../../lib/pg';

// Default menu configuration structure
// IMPORTANT: Each item key must appear ONLY ONCE across all sections
const DEFAULT_MENU_CONFIG = {
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

// Default menu items to seed
// IMPORTANT: Each item appears ONLY in one section (no duplicates)
const DEFAULT_MENU_ITEMS = [
  // Navigation
  { key: 'product', label: 'Product', href: '/navigation/home', icon: 'AppsIcon', default_section: 'navigation', sort_order: 0 },
  // Main Flow Studios
  { key: 'blueprint-studio', label: 'Blueprint Studio', href: '/app/spaces/blueprint/overview', icon: 'LightbulbIcon', default_section: 'main-flow', sort_order: 0 },
  { key: 'analysis-studio', label: 'Analysis Studio', href: '/app/spaces/analysis/projects', icon: 'AssignmentIcon', default_section: 'main-flow', sort_order: 1 },
  { key: 'project-design', label: 'Project Studio', href: '/app/spaces/pds/overview', icon: 'AccountTreeIcon', default_section: 'main-flow', sort_order: 2 },
  { key: 'enterprise-studio', label: 'Enterprise Studio', href: '/app/spaces/enterprise/dashboard', icon: 'ArchitectureIcon', default_section: 'main-flow', sort_order: 3 },
  { key: 'gtm-studio', label: 'GTM Studio', href: '/app/spaces/gtm/overview', icon: 'RocketLaunchIcon', default_section: 'main-flow', sort_order: 4 },
  // Thinking Tools
  { key: 'system-dynamics', label: 'System Dynamics', href: '/app/spaces/sd/canvas', icon: 'LoopIcon', default_section: 'thinking-tools', sort_order: 0 },
  { key: 'work-design', label: 'Work Design', href: '/app/spaces/dwd/landscape', icon: 'BuildIcon', default_section: 'thinking-tools', sort_order: 1 },
  { key: 'learning', label: 'Learning Studio', href: '/app/spaces/als/sessions', icon: 'SchoolIcon', default_section: 'thinking-tools', sort_order: 2 },
  // Infrastructure
  { key: 'diagram-studio', label: 'Diagram Studio', href: '/app/spaces/diagram/canvas', icon: 'GridViewIcon', default_section: 'infrastructure', sort_order: 0 },
  { key: 'knowledge-studio', label: 'Knowledge Studio', href: '/app/spaces/ks/navigator', icon: 'HubIcon', default_section: 'infrastructure', sort_order: 1 },
];

/**
 * Auto-seed menu configuration if none exists
 */
async function ensureMenuConfig() {
  try {
    // Check if config exists
    const existingConfig = await query(`
      SELECT id FROM menu_config_default WHERE is_active = true LIMIT 1
    `);

    if (existingConfig.rows.length > 0) {
      return; // Config already exists
    }

    console.log('[Menu Config] No configuration found, seeding defaults...');

    // Seed menu sections (consolidated structure only - no legacy sections)
    const sections = [
      { key: 'navigation', label: 'Navigation', is_system: true, sort_order: 0 },
      { key: 'main-flow', label: 'Main Flow', is_system: true, sort_order: 1 },
      { key: 'thinking-tools', label: 'Thinking Tools', is_system: true, sort_order: 2 },
      { key: 'infrastructure', label: 'Infrastructure', is_system: true, sort_order: 3 },
    ];

    for (const section of sections) {
      await query(`
        INSERT INTO menu_sections (key, label, is_system, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (key) DO NOTHING
      `, [section.key, section.label, section.is_system, section.sort_order]);
    }

    // Seed menu items
    for (const item of DEFAULT_MENU_ITEMS) {
      await query(`
        INSERT INTO menu_items (key, label, href, icon, default_section, roles, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (key) DO NOTHING
      `, [item.key, item.label, item.href, item.icon, item.default_section, '{admin,editor,viewer}', true, item.sort_order]);
    }

    // Create default configuration
    await query(`
      INSERT INTO menu_config_default (version, config, is_active, created_by)
      VALUES (1, $1, true, 'system')
    `, [JSON.stringify(DEFAULT_MENU_CONFIG)]);

    console.log('[Menu Config] Default configuration seeded successfully');
  } catch (err) {
    console.error('[Menu Config] Error seeding defaults:', err.message);
    // Don't throw - let the request continue with empty/partial data
  }
}

export default async function handler(req, res) {
  const { method } = req;

  const user = req.headers['x-user'];
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    switch (method) {
      case 'GET': {
        // Auto-seed if no configuration exists
        await ensureMenuConfig();

        // Get default configuration (admin-managed)
        const defaultConfig = await menuRepository.getDefaultConfig();

        // Also get all available menu items for reference
        const items = await menuRepository.getMenuItems();

        return res.json({
          config: defaultConfig?.config || null,
          version: defaultConfig?.version || 0,
          availableItems: items,
        });
      }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('[API /user/menu-config]', error);
    return res.status(500).json({ error: 'Internal server error', ...(process.env.NODE_ENV !== 'production' && { details: error.message }) });
  }
}
