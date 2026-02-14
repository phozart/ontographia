/**
 * Seed Menu Items and Sections
 * Run with: node scripts/seed-menu.js
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://ontographia:ontographia@localhost:5432/ontographia'
});

async function seedMenu() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Seed menu_sections (no icon column in this table)
    // Uses consolidated structure - each item appears in only one section
    console.log('Seeding menu_sections...');
    const sections = [
      { key: 'navigation', label: 'Navigation', sort_order: 0, is_system: true },
      { key: 'main-flow', label: 'Main Flow', sort_order: 1, is_system: true },
      { key: 'thinking-tools', label: 'Thinking Tools', sort_order: 2, is_system: true },
      { key: 'infrastructure', label: 'Infrastructure', sort_order: 3, is_system: true },
    ];

    for (const section of sections) {
      await client.query(`
        INSERT INTO menu_sections (key, label, sort_order, is_system)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (key) DO UPDATE SET
          label = EXCLUDED.label,
          sort_order = EXCLUDED.sort_order
      `, [section.key, section.label, section.sort_order, section.is_system]);
    }
    console.log(`  Inserted ${sections.length} sections`);

    // Seed menu_items
    // IMPORTANT: Each item appears in only one section (no duplicates)
    console.log('Seeding menu_items...');
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
      await client.query(`
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
    console.log(`  Inserted ${items.length} items`);

    // Create default menu configuration
    console.log('Creating default menu configuration...');

    // Check if menu_config_default table has the expected columns
    const configExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'menu_config_default'
      )
    `);

    if (configExists.rows[0].exists) {
      // Build the default config based on items
      // IMPORTANT: Each item appears in only one section (no duplicates)
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

      // Try to insert with different column combinations
      try {
        await client.query(`
          INSERT INTO menu_config_default (version, config, is_active, created_by)
          VALUES (1, $1, true, 'system')
          ON CONFLICT DO NOTHING
        `, [JSON.stringify(defaultConfig)]);
        console.log('  Created default menu configuration');
      } catch (err) {
        // Try without created_by if that column doesn't exist
        try {
          await client.query(`
            INSERT INTO menu_config_default (version, config, is_active)
            VALUES (1, $1, true)
            ON CONFLICT DO NOTHING
          `, [JSON.stringify(defaultConfig)]);
          console.log('  Created default menu configuration (without created_by)');
        } catch (err2) {
          console.log('  Skipping menu_config_default (table structure mismatch):', err2.message);
        }
      }
    }

    await client.query('COMMIT');
    console.log('Menu seeding completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding menu:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedMenu().catch(console.error);
