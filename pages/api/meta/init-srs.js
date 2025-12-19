// pages/api/meta/init-srs.js
// Initialize PostgreSQL tables for Strategic Reasoning Suite

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = {
      tables: [],
      menuItem: false,
      pageRegistry: false,
      menuConfig: false,
    };

    // ========== Create SRS Sessions table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_sessions (
        id SERIAL PRIMARY KEY,
        project_id UUID NOT NULL,
        owner_id VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        intent VARCHAR(50) DEFAULT 'understand',
        mode VARCHAR(50) DEFAULT 'solo',
        context TEXT,
        current_space VARCHAR(50) DEFAULT 'questions',
        status VARCHAR(50) DEFAULT 'active',
        duration_minutes INTEGER DEFAULT 0,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_sessions_project ON srs_sessions(project_id);
      CREATE INDEX IF NOT EXISTS idx_srs_sessions_owner ON srs_sessions(owner_id);
      CREATE INDEX IF NOT EXISTS idx_srs_sessions_status ON srs_sessions(status);
    `);
    results.tables.push('srs_sessions');

    // ========== Create SRS Spaces table (canvas state per space) ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_spaces (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        space_id VARCHAR(50) NOT NULL,
        canvas_state JSONB DEFAULT '{"position": {"x": 0, "y": 0}, "zoom": 1}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(session_id, space_id)
      );

      CREATE INDEX IF NOT EXISTS idx_srs_spaces_session ON srs_spaces(session_id);
    `);
    results.tables.push('srs_spaces');

    // ========== Create SRS Questions table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_questions (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'open',
        maturity VARCHAR(50) DEFAULT 'raw',
        assumptions JSONB DEFAULT '[]',
        x REAL DEFAULT 100,
        y REAL DEFAULT 100,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_questions_session ON srs_questions(session_id);
    `);
    results.tables.push('srs_questions');

    // ========== Create SRS Frames table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_frames (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        elements JSONB DEFAULT '[]',
        challenged_elements JSONB DEFAULT '[]',
        frame_source VARCHAR(100),
        confidence VARCHAR(50) DEFAULT 'untested',
        x REAL DEFAULT 100,
        y REAL DEFAULT 100,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_frames_session ON srs_frames(session_id);
    `);
    results.tables.push('srs_frames');

    // ========== Create SRS Frame Elements table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_frame_elements (
        id SERIAL PRIMARY KEY,
        frame_id INTEGER NOT NULL REFERENCES srs_frames(id) ON DELETE CASCADE,
        element_type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        challenged BOOLEAN DEFAULT FALSE,
        challenge_reason TEXT,
        position_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_frame_elements_frame ON srs_frame_elements(frame_id);
    `);
    results.tables.push('srs_frame_elements');

    // ========== Create SRS Parallel States table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_parallel_states (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        state_type VARCHAR(50) DEFAULT 'expected',
        probability VARCHAR(50) DEFAULT 'medium',
        confidence REAL DEFAULT 0.5,
        evidence JSONB DEFAULT '[]',
        implications JSONB DEFAULT '[]',
        is_collapsed BOOLEAN DEFAULT FALSE,
        is_ruled_out BOOLEAN DEFAULT FALSE,
        collapse_reason TEXT,
        position_order INTEGER DEFAULT 0,
        x REAL DEFAULT 100,
        y REAL DEFAULT 100,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_parallel_states_session ON srs_parallel_states(session_id);
    `);
    results.tables.push('srs_parallel_states');

    // ========== Create SRS System Nodes table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_system_nodes (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        node_type VARCHAR(50) DEFAULT 'variable',
        description TEXT,
        x REAL DEFAULT 100,
        y REAL DEFAULT 100,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_system_nodes_session ON srs_system_nodes(session_id);
    `);
    results.tables.push('srs_system_nodes');

    // ========== Create SRS Causal Links table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_causal_links (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        from_node_id INTEGER NOT NULL REFERENCES srs_system_nodes(id) ON DELETE CASCADE,
        to_node_id INTEGER NOT NULL REFERENCES srs_system_nodes(id) ON DELETE CASCADE,
        polarity VARCHAR(20) DEFAULT 'positive',
        delay VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_causal_links_session ON srs_causal_links(session_id);
      CREATE INDEX IF NOT EXISTS idx_srs_causal_links_from ON srs_causal_links(from_node_id);
      CREATE INDEX IF NOT EXISTS idx_srs_causal_links_to ON srs_causal_links(to_node_id);
    `);
    results.tables.push('srs_causal_links');

    // ========== Create SRS Feedback Loops table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_feedback_loops (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        loop_type VARCHAR(50) DEFAULT 'reinforcing',
        description TEXT,
        node_ids JSONB DEFAULT '[]',
        link_ids JSONB DEFAULT '[]',
        x REAL DEFAULT 100,
        y REAL DEFAULT 100,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_feedback_loops_session ON srs_feedback_loops(session_id);
    `);
    results.tables.push('srs_feedback_loops');

    // ========== Create SRS Perspectives table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_perspectives (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        stakeholder VARCHAR(255) NOT NULL,
        viewpoint TEXT,
        interests JSONB DEFAULT '[]',
        concerns JSONB DEFAULT '[]',
        influence VARCHAR(50) DEFAULT 'medium',
        alignment VARCHAR(50) DEFAULT 'neutral',
        x REAL DEFAULT 100,
        y REAL DEFAULT 100,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_perspectives_session ON srs_perspectives(session_id);
    `);
    results.tables.push('srs_perspectives');

    // ========== Create SRS Decisions table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_decisions (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        options JSONB DEFAULT '[]',
        chosen_option INTEGER,
        rationale TEXT,
        readiness_score REAL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        reversibility VARCHAR(50) DEFAULT 'reversible_with_cost',
        stakes VARCHAR(50) DEFAULT 'medium',
        deadline TIMESTAMP,
        outcome VARCHAR(50),
        outcome_rationale TEXT,
        success_criteria JSONB DEFAULT '[]',
        knows JSONB DEFAULT '[]',
        unknowns JSONB DEFAULT '[]',
        x REAL DEFAULT 100,
        y REAL DEFAULT 100,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_decisions_session ON srs_decisions(session_id);
      CREATE INDEX IF NOT EXISTS idx_srs_decisions_status ON srs_decisions(status);
    `);
    results.tables.push('srs_decisions');

    // ========== Create SRS Snapshots table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_snapshots (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        name VARCHAR(255),
        description TEXT,
        snapshot_data JSONB NOT NULL,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_snapshots_session ON srs_snapshots(session_id);
    `);
    results.tables.push('srs_snapshots');

    // ========== Create SRS Connections table (cross-space links) ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_connections (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        from_space VARCHAR(50) NOT NULL,
        from_element_id INTEGER NOT NULL,
        to_space VARCHAR(50) NOT NULL,
        to_element_id INTEGER NOT NULL,
        connection_type VARCHAR(100) DEFAULT 'related',
        label VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_connections_session ON srs_connections(session_id);
      CREATE INDEX IF NOT EXISTS idx_srs_connections_from ON srs_connections(from_space, from_element_id);
      CREATE INDEX IF NOT EXISTS idx_srs_connections_to ON srs_connections(to_space, to_element_id);
    `);
    results.tables.push('srs_connections');

    // ========== Create SRS Comments table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_comments (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        space VARCHAR(50) NOT NULL,
        element_id INTEGER NOT NULL,
        author_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_comments_session ON srs_comments(session_id);
      CREATE INDEX IF NOT EXISTS idx_srs_comments_element ON srs_comments(space, element_id);
    `);
    results.tables.push('srs_comments');

    // ========== Create SRS Assumptions table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_assumptions (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        source_space VARCHAR(50),
        source_element_id INTEGER,
        status VARCHAR(50) DEFAULT 'untested',
        evidence TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_assumptions_session ON srs_assumptions(session_id);
      CREATE INDEX IF NOT EXISTS idx_srs_assumptions_status ON srs_assumptions(status);
    `);
    results.tables.push('srs_assumptions');

    // ========== Create SRS Session Participants table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_session_participants (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'participant',
        joined_at TIMESTAMP DEFAULT NOW(),
        left_at TIMESTAMP,
        UNIQUE(session_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_srs_session_participants_session ON srs_session_participants(session_id);
      CREATE INDEX IF NOT EXISTS idx_srs_session_participants_user ON srs_session_participants(user_id);
    `);
    results.tables.push('srs_session_participants');

    // ========== Create SRS Coaching Events table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_coaching_events (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        trigger_id VARCHAR(100) NOT NULL,
        space VARCHAR(50),
        element_id INTEGER,
        severity VARCHAR(20) DEFAULT 'info',
        message TEXT,
        dismissed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_coaching_events_session ON srs_coaching_events(session_id);
    `);
    results.tables.push('srs_coaching_events');

    // ========== Create SRS Exports table ==========
    await query(`
      CREATE TABLE IF NOT EXISTS srs_exports (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES srs_sessions(id) ON DELETE CASCADE,
        format VARCHAR(50) NOT NULL,
        filename VARCHAR(255),
        export_data JSONB,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_srs_exports_session ON srs_exports(session_id);
    `);
    results.tables.push('srs_exports');

    // ========== Add menu item for Strategic Reasoning ==========
    const menuItemResult = await query(`
      INSERT INTO menu_items (key, label, href, icon, default_section, roles, sort_order)
      VALUES ('strategic-reasoning', 'Strategic Reasoning', '/strategic-reasoning', 'AutoGraphIcon', 'reasoning', '{admin,editor,viewer}', 6)
      ON CONFLICT (key) DO NOTHING
      RETURNING key
    `);
    results.menuItem = menuItemResult.rowCount > 0;

    // ========== Add page registry entry ==========
    const pageRegistryResult = await query(`
      INSERT INTO page_registry (path, name, category, section, description, default_roles, sort_order)
      VALUES ('/strategic-reasoning', 'Strategic Reasoning', 'Reasoning', 'reasoning', 'Strategic reasoning and decision sensemaking workspace', '{admin,editor,viewer}', 46)
      ON CONFLICT (path) DO NOTHING
      RETURNING path
    `);
    results.pageRegistry = pageRegistryResult.rowCount > 0;

    // ========== Update default menu config ==========
    const configResult = await query(`
      UPDATE menu_config_default
      SET config = jsonb_set(
        config,
        '{sections}',
        (
          SELECT jsonb_agg(
            CASE
              WHEN section->>'key' = 'reasoning' AND NOT (section->'items' @> '[{"key": "strategic-reasoning"}]'::jsonb)
              THEN jsonb_set(
                section,
                '{items}',
                (section->'items') || '[{"key": "strategic-reasoning", "label": "Strategic Reasoning"}]'::jsonb
              )
              ELSE section
            END
          )
          FROM jsonb_array_elements(config->'sections') AS section
        )
      ),
      updated_at = now()
      WHERE is_active = true
        AND NOT (config::text LIKE '%strategic-reasoning%')
      RETURNING id
    `);
    results.menuConfig = configResult.rowCount > 0;

    return res.status(200).json({
      success: true,
      message: 'Strategic Reasoning Suite tables and config initialized',
      results,
    });
  } catch (err) {
    console.error('SRS init error:', err);
    return res.status(500).json({ error: 'Failed to initialize SRS', details: err.message });
  }
}
