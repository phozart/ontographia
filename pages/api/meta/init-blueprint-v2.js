// pages/api/meta/init-blueprint-v2.js
// Migration: Convert flat initiative model to Initiative → ProductIdea hierarchy
// Run with: curl -X POST http://localhost:3000/api/meta/init-blueprint-v2

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  // Allow both GET and POST for easier testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = [];

    // ========================================================================
    // STEP 1: Add new columns to blueprint_initiatives for strategic container
    // ========================================================================

    // Add status column (open/closed) for initiatives
    try {
      await query(`
        ALTER TABLE blueprint_initiatives
        ADD COLUMN IF NOT EXISTS initiative_status VARCHAR(20) DEFAULT 'open'
      `);
      results.push('Added initiative_status column');
    } catch (e) {
      results.push(`initiative_status column: ${e.message}`);
    }

    // Add strategic_context JSONB for high-level initiative info
    try {
      await query(`
        ALTER TABLE blueprint_initiatives
        ADD COLUMN IF NOT EXISTS strategic_context JSONB DEFAULT '{}'::jsonb
      `);
      results.push('Added strategic_context column');
    } catch (e) {
      results.push(`strategic_context column: ${e.message}`);
    }

    // Add critical_assessment JSONB
    try {
      await query(`
        ALTER TABLE blueprint_initiatives
        ADD COLUMN IF NOT EXISTS critical_assessment JSONB DEFAULT NULL
      `);
      results.push('Added critical_assessment column');
    } catch (e) {
      results.push(`critical_assessment column: ${e.message}`);
    }

    // ========================================================================
    // STEP 2: Create blueprint_product_ideas table
    // ========================================================================

    try {
      await query(`
        CREATE TABLE IF NOT EXISTS blueprint_product_ideas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          initiative_id UUID NOT NULL REFERENCES blueprint_initiatives(id) ON DELETE CASCADE,
          domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,

          -- Display ID (PI-001, PI-002, etc.)
          product_idea_id VARCHAR(20) NOT NULL,

          -- Core fields
          name VARCHAR(500) NOT NULL,
          tagline VARCHAR(500),
          description TEXT,

          -- Stage progression (moved from initiative)
          stage VARCHAR(50) DEFAULT 'idea',
          horizon VARCHAR(10),

          -- Type and classification
          idea_type VARCHAR(50), -- non_ai_deterministic, lightweight_hybrid, ai_heavy, etc.
          technology_posture VARCHAR(50), -- no_ai, minimal_ai, ai_assisted, ai_centric
          risk_profile VARCHAR(50), -- low_risk_incremental, moderate, high_risk_high_reward

          -- Ownership
          owner_id VARCHAR(255),

          -- Stage-specific data (JSONB)
          idea_data JSONB DEFAULT '{}'::jsonb,
          explore_data JSONB DEFAULT '{}'::jsonb,
          assess_data JSONB DEFAULT '{}'::jsonb,
          case_data JSONB DEFAULT '{}'::jsonb,
          approval_data JSONB DEFAULT '{}'::jsonb,

          -- Canvas data
          canvas_data JSONB DEFAULT '{}'::jsonb,

          -- Governance and audit
          governance_data JSONB DEFAULT '{}'::jsonb,

          -- AI comparison info
          ai_comparison JSONB DEFAULT '{}'::jsonb,

          -- Validation and priority
          validation_priority INTEGER DEFAULT 1,
          market_fit_hypothesis TEXT,

          -- Estimates
          estimated_investment NUMERIC,
          estimated_annual_cost NUMERIC,
          payback_months INTEGER,
          cost_savings_ratio NUMERIC,

          -- Status tracking
          selection_status VARCHAR(50) DEFAULT 'proposed', -- proposed, selected, in_progress, validated, rejected
          selected_at TIMESTAMPTZ,
          selected_by VARCHAR(255),

          -- Tags and custom fields
          tags JSONB DEFAULT '[]'::jsonb,
          custom_fields JSONB DEFAULT '{}'::jsonb,

          -- Timestamps
          created_by VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),

          -- Constraints
          CONSTRAINT unique_product_idea_id UNIQUE (domain_id, product_idea_id)
        )
      `);
      results.push('Created blueprint_product_ideas table');
    } catch (e) {
      results.push(`blueprint_product_ideas table: ${e.message}`);
    }

    // ========================================================================
    // STEP 3: Create sequence for product idea IDs
    // ========================================================================

    try {
      await query(`CREATE SEQUENCE IF NOT EXISTS blueprint_product_idea_seq START 1`);
      results.push('Created blueprint_product_idea_seq sequence');
    } catch (e) {
      results.push(`blueprint_product_idea_seq: ${e.message}`);
    }

    // ========================================================================
    // STEP 4: Create indexes
    // ========================================================================

    const indexes = [
      ['idx_product_ideas_initiative', 'blueprint_product_ideas(initiative_id)'],
      ['idx_product_ideas_domain', 'blueprint_product_ideas(domain_id)'],
      ['idx_product_ideas_stage', 'blueprint_product_ideas(stage)'],
      ['idx_product_ideas_status', 'blueprint_product_ideas(selection_status)'],
    ];

    for (const [name, definition] of indexes) {
      try {
        await query(`CREATE INDEX IF NOT EXISTS ${name} ON ${definition}`);
        results.push(`Created index ${name}`);
      } catch (e) {
        results.push(`Index ${name}: ${e.message}`);
      }
    }

    // ========================================================================
    // STEP 5: Migrate existing initiatives to new structure
    // ========================================================================

    // Get existing initiatives that have stage-specific data
    const existingInitiatives = await query(`
      SELECT * FROM blueprint_initiatives
      WHERE stage IS NOT NULL
        AND stage NOT IN ('', 'open', 'closed')
    `);

    let migratedCount = 0;
    for (const initiative of existingInitiatives.rows) {
      try {
        // Generate product idea ID
        const seqResult = await query("SELECT nextval('blueprint_product_idea_seq') as seq");
        const productIdeaId = `PI-${String(seqResult.rows[0].seq).padStart(3, '0')}`;

        // Create product idea from initiative's stage data
        await query(`
          INSERT INTO blueprint_product_ideas (
            initiative_id, domain_id, product_idea_id, name, description,
            stage, horizon, owner_id,
            idea_data, explore_data, assess_data, case_data, approval_data,
            canvas_data, governance_data, tags, custom_fields,
            created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (domain_id, product_idea_id) DO NOTHING
        `, [
          initiative.id,
          initiative.domain_id,
          productIdeaId,
          initiative.name,
          initiative.description,
          initiative.stage,
          initiative.horizon,
          initiative.owner_id,
          JSON.stringify(initiative.idea_data || {}),
          JSON.stringify(initiative.explore_data || {}),
          JSON.stringify(initiative.assess_data || {}),
          JSON.stringify(initiative.case_data || {}),
          JSON.stringify(initiative.approval_data || {}),
          JSON.stringify(initiative.custom_fields?.canvasData || {}),
          JSON.stringify(initiative.governance_data || {}),
          JSON.stringify(initiative.tags || []),
          JSON.stringify(initiative.custom_fields || {}),
          initiative.created_by,
          initiative.created_at,
          initiative.updated_at,
        ]);

        // Update the initiative to be a strategic container
        await query(`
          UPDATE blueprint_initiatives
          SET initiative_status = 'open',
              strategic_context = $2
          WHERE id = $1
        `, [
          initiative.id,
          JSON.stringify({
            problem_statement: initiative.idea_data?.problem_statement || '',
            target_customer: initiative.idea_data?.target_customer || '',
            hypothesis: initiative.idea_data?.hypothesis || '',
            migrated_from_v1: true,
            migration_date: new Date().toISOString(),
          }),
        ]);

        migratedCount++;
      } catch (e) {
        results.push(`Migration error for initiative ${initiative.initiative_id}: ${e.message}`);
      }
    }

    results.push(`Migrated ${migratedCount} initiatives to product ideas`);

    // ========================================================================
    // STEP 6: Update display ID patterns
    // ========================================================================

    // Note: URL pattern INI-XXXX will still work for initiatives
    // Product ideas use PI-XXXX pattern

    res.status(200).json({
      success: true,
      message: 'Blueprint v2 schema migration completed',
      results,
    });
  } catch (error) {
    console.error('Blueprint v2 migration error:', error);
    res.status(500).json({
      success: false,
      error: 'Blueprint migration failed',
      ...(process.env.NODE_ENV !== 'production' && { details: error.message }),
    });
  }
}
