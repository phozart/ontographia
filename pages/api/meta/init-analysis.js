// pages/api/meta/init-analysis.js
// Initialize Analysis Studio database schema

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create analysis_projects table
    await query(`
      CREATE TABLE IF NOT EXISTS analysis_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        number INTEGER NOT NULL DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Draft',
        priority VARCHAR(20) DEFAULT 'Medium',
        business_owner VARCHAR(255),
        technical_owner VARCHAR(255),
        start_date DATE,
        target_date DATE,
        linked_initiatives JSONB DEFAULT '[]'::jsonb,
        linked_projects JSONB DEFAULT '[]'::jsonb,
        domain_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create index on domain_id for faster lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_analysis_projects_domain
      ON analysis_projects(domain_id)
    `);

    // Create analysis_artefacts table
    await query(`
      CREATE TABLE IF NOT EXISTS analysis_artefacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        number INTEGER NOT NULL DEFAULT 1,
        prefix VARCHAR(10) DEFAULT 'ART',
        name VARCHAR(255) NOT NULL,
        description TEXT,
        artefact_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Draft',
        priority VARCHAR(20),
        project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE,
        domain_id UUID,
        metadata JSONB DEFAULT '{}'::jsonb,
        pipeline_stage VARCHAR(50),
        pipeline_order INTEGER,
        display_id VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Migration: add pipeline columns to existing tables
    await query(`ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50)`);
    await query(`ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS pipeline_order INTEGER`);
    await query(`ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS display_id VARCHAR(50)`);

    // Create indexes for artefacts
    await query(`
      CREATE INDEX IF NOT EXISTS idx_analysis_artefacts_project
      ON analysis_artefacts(project_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_analysis_artefacts_type
      ON analysis_artefacts(artefact_type)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_analysis_artefacts_domain
      ON analysis_artefacts(domain_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_analysis_artefacts_pipeline
      ON analysis_artefacts(pipeline_stage, pipeline_order)
    `);

    // Create analysis_relationships table
    await query(`
      CREATE TABLE IF NOT EXISTS analysis_relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_artefact_id UUID REFERENCES analysis_artefacts(id) ON DELETE CASCADE,
        to_artefact_id UUID REFERENCES analysis_artefacts(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) NOT NULL,
        project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(from_artefact_id, to_artefact_id, relationship_type)
      )
    `);

    // Create indexes for relationships
    await query(`
      CREATE INDEX IF NOT EXISTS idx_analysis_relationships_from
      ON analysis_relationships(from_artefact_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_analysis_relationships_to
      ON analysis_relationships(to_artefact_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_analysis_relationships_project
      ON analysis_relationships(project_id)
    `);

    return res.status(200).json({
      success: true,
      message: 'Analysis Studio schema initialized successfully',
      tables: ['analysis_projects', 'analysis_artefacts', 'analysis_relationships']
    });
  } catch (error) {
    console.error('Error initializing Analysis Studio schema:', error);
    return res.status(500).json({
      error: 'Failed to initialize Analysis Studio schema',
      ...(process.env.NODE_ENV !== 'production' && { details: error.message }),
    });
  }
}
