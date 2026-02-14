// pages/api/meta/init-menu.js
// Initialize default menu configuration
// Uses consolidated menu structure - each item appears in only one section

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

// Default menu configuration structure
// IMPORTANT: Each item appears in only one section (no duplicates)
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST for initialisation' });
  }

  // Admin authentication required for init endpoints
  const { user, role } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required for initialization' });
  }

  try {
    const results = {
      sections: 0,
      items: 0,
      config: false,
    };

    // 1. Ensure menu sections exist (consolidated structure)
    const sections = [
      { key: 'navigation', label: 'Navigation', is_system: true, sort_order: 0 },
      { key: 'main-flow', label: 'Main Flow', is_system: true, sort_order: 1 },
      { key: 'thinking-tools', label: 'Thinking Tools', is_system: true, sort_order: 2 },
      { key: 'infrastructure', label: 'Infrastructure', is_system: true, sort_order: 3 },
    ];

    for (const section of sections) {
      const result = await query(`
        INSERT INTO menu_sections (key, label, is_system, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (key) DO UPDATE SET
          label = EXCLUDED.label,
          sort_order = EXCLUDED.sort_order
        RETURNING key
      `, [section.key, section.label, section.is_system, section.sort_order]);
      if (result.rowCount > 0) results.sections++;
    }

    // 2. Ensure menu items exist (each item in only one section)
    const menuItems = [
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

    for (const item of menuItems) {
      const result = await query(`
        INSERT INTO menu_items (key, label, href, icon, default_section, roles, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (key) DO UPDATE SET
          label = EXCLUDED.label,
          href = EXCLUDED.href,
          icon = EXCLUDED.icon,
          default_section = EXCLUDED.default_section,
          sort_order = EXCLUDED.sort_order
        RETURNING key
      `, [item.key, item.label, item.href, item.icon, item.default_section, '{admin,editor,viewer}', true, item.sort_order]);
      if (result.rowCount > 0) results.items++;
    }

    // 3. Create default menu configuration if none exists
    const existingConfig = await query(`
      SELECT id FROM menu_config_default WHERE is_active = true LIMIT 1
    `);

    if (existingConfig.rows.length === 0) {
      await query(`
        INSERT INTO menu_config_default (version, config, is_active, created_by)
        VALUES (1, $1, true, $2)
      `, [JSON.stringify(DEFAULT_MENU_CONFIG), user]);
      results.config = true;
    } else {
      // Update existing config
      await query(`
        UPDATE menu_config_default
        SET config = $1, updated_at = NOW()
        WHERE is_active = true
      `, [JSON.stringify(DEFAULT_MENU_CONFIG)]);
      results.config = true;
    }

    return res.status(200).json({
      ok: true,
      message: 'Menu configuration initialized successfully',
      results,
    });
  } catch (err) {
    console.error('Error initializing menu:', err);
    return res.status(500).json({ error: 'Failed to initialize menu configuration', ...(process.env.NODE_ENV !== 'production' && { details: err.message }) });
  }
}
