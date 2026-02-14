/**
 * Admin API to seed menu items and sections
 * POST /api/admin/seed-menu
 *
 * Uses consolidated menu structure - each item appears in only one section
 */

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check admin role
  const role = req.headers['x-role'];
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Seed menu_sections (consolidated structure)
    const sections = [
      { key: 'navigation', label: 'Navigation', sort_order: 0, is_system: true },
      { key: 'main-flow', label: 'Main Flow', sort_order: 1, is_system: true },
      { key: 'thinking-tools', label: 'Thinking Tools', sort_order: 2, is_system: true },
      { key: 'infrastructure', label: 'Infrastructure', sort_order: 3, is_system: true },
    ];

    for (const section of sections) {
      await query(`
        INSERT INTO menu_sections (key, label, sort_order, is_system)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (key) DO UPDATE SET
          label = EXCLUDED.label,
          sort_order = EXCLUDED.sort_order
      `, [section.key, section.label, section.sort_order, section.is_system]);
    }

    // Seed menu_items (each item appears in only one section)
    const items = [
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

    for (const item of items) {
      await query(`
        INSERT INTO menu_items (key, label, href, path, icon, default_section, sort_order, roles, is_active)
        VALUES ($1, $2, $3, $3, $4, $5, $6, $7, true)
        ON CONFLICT (key) DO UPDATE SET
          label = EXCLUDED.label,
          href = EXCLUDED.href,
          path = EXCLUDED.path,
          icon = EXCLUDED.icon,
          default_section = EXCLUDED.default_section,
          sort_order = EXCLUDED.sort_order,
          is_active = true
      `, [item.key, item.label, item.href, item.icon, item.default_section, item.sort_order, ['admin', 'editor', 'viewer']]);
    }

    // Create default menu configuration
    const defaultConfig = {
      sections: [
        {
          key: 'navigation',
          label: 'Navigation',
          expanded: true,
          items: items.filter(i => i.default_section === 'navigation').map(i => ({ key: i.key, label: i.label }))
        },
        {
          key: 'main-flow',
          label: 'Main Flow',
          expanded: true,
          items: items.filter(i => i.default_section === 'main-flow').map(i => ({ key: i.key, label: i.label }))
        },
        {
          key: 'thinking-tools',
          label: 'Thinking Tools',
          expanded: true,
          items: items.filter(i => i.default_section === 'thinking-tools').map(i => ({ key: i.key, label: i.label }))
        },
        {
          key: 'infrastructure',
          label: 'Infrastructure',
          expanded: true,
          items: items.filter(i => i.default_section === 'infrastructure').map(i => ({ key: i.key, label: i.label }))
        }
      ]
    };

    // Try to insert default config
    try {
      await query(`
        INSERT INTO menu_config_default (version, config, is_active, created_by)
        VALUES (1, $1, true, 'system')
        ON CONFLICT DO NOTHING
      `, [JSON.stringify(defaultConfig)]);
    } catch (err) {
      // Try without created_by if that column doesn't exist
      try {
        await query(`
          INSERT INTO menu_config_default (version, config, is_active)
          VALUES (1, $1, true)
          ON CONFLICT DO NOTHING
        `, [JSON.stringify(defaultConfig)]);
      } catch (err2) {
        console.log('Skipping menu_config_default:', err2.message);
      }
    }

    return res.json({
      success: true,
      message: 'Menu seeded successfully',
      sectionsCount: sections.length,
      itemsCount: items.length
    });

  } catch (error) {
    console.error('[API /admin/seed-menu]', error);
    return res.status(500).json({ error: 'Internal server error', ...(process.env.NODE_ENV !== 'production' && { details: error.message }) });
  }
}
