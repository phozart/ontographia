// pages/api/analysis/projects.js
// API for Analysis Projects (AN-xxxx)

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { ANALYSIS_EVENT_TYPES } from '../../../lib/services/analysisEvents';
import { enqueueOutboxEvents, OUTBOX_ACTIONS } from '../../../lib/services/outboxService';

// Auto-initialize tables if they don't exist
let tablesInitialized = false;

async function ensureTables() {
  if (tablesInitialized) return;

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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_analysis_projects_domain ON analysis_projects(domain_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_analysis_artefacts_project ON analysis_artefacts(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_analysis_artefacts_type ON analysis_artefacts(artefact_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_analysis_artefacts_domain ON analysis_artefacts(domain_id)`);

    // Add columns that may be missing from original schema
    const alterStatements = [
      'ALTER TABLE analysis_projects ADD COLUMN IF NOT EXISTS parent_id UUID',
      'ALTER TABLE analysis_projects ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0',
      'ALTER TABLE analysis_projects ADD COLUMN IF NOT EXISTS analysis_profile VARCHAR(20) DEFAULT \'Standard\'',
      'ALTER TABLE analysis_projects ADD COLUMN IF NOT EXISTS created_by TEXT',
      'ALTER TABLE analysis_projects ADD COLUMN IF NOT EXISTS updated_by TEXT',
      'ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS parent_id UUID',
      'ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0',
      'ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50)',
      'ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS module VARCHAR(50)',
      'ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS created_by TEXT',
      'ALTER TABLE analysis_artefacts ADD COLUMN IF NOT EXISTS updated_by TEXT',
    ];
    for (const stmt of alterStatements) {
      await query(stmt).catch(() => {}); // ignore if already exists
    }

    tablesInitialized = true;
  } catch (error) {
    console.error('Error initializing analysis tables:', error);
    // Don't throw - allow the main query to fail with a more specific error
  }
}

// GET - List all analysis projects (optionally filtered by domain)
// POST - Create a new analysis project
export default async function handler(req, res) {
  // Ensure tables exist before any operation
  await ensureTables();

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(req, res) {
  const user = getUserFromRequest(req);
  const { domain_id } = req.query;

  try {
    let sql = `
      SELECT
        ap.*,
        (SELECT COUNT(*) FROM analysis_artefacts WHERE project_id = ap.id) as artefact_count
      FROM analysis_projects ap
    `;
    const params = [];

    if (domain_id) {
      sql += ' WHERE ap.domain_id = $1';
      params.push(domain_id);
    }

    sql += ' ORDER BY ap.created_at DESC';

    const result = await query(sql, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch analysis projects', error);
  }
}

async function handlePost(req, res) {
  const user = getUserFromRequest(req);
  const {
    name,
    description,
    status = 'Draft',
    priority = 'Medium',
    business_owner,
    technical_owner,
    start_date,
    target_date,
    linked_initiatives = [],
    linked_projects = [],
    domain_id
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // Get the next project number
    const numberResult = await query(
      'SELECT COALESCE(MAX(number), 0) + 1 as next_number FROM analysis_projects WHERE domain_id = $1',
      [domain_id]
    );
    const number = numberResult.rows[0].next_number;

    const result = await query(
      `INSERT INTO analysis_projects
        (name, description, status, priority, business_owner, technical_owner,
         start_date, target_date, linked_initiatives, linked_projects, domain_id, number, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        name, description, status, priority, business_owner, technical_owner,
        start_date || null, target_date || null,
        JSON.stringify(linked_initiatives), JSON.stringify(linked_projects),
        domain_id, number, user?.user || null
      ]
    );

    // Enqueue side effects via outbox
    enqueueOutboxEvents([
      {
        action: OUTBOX_ACTIONS.EMIT_ANALYSIS_EVENT,
        entityType: 'project',
        entityId: result.rows[0].id,
        payload: {
          domainId: domain_id,
          eventType: ANALYSIS_EVENT_TYPES.PROJECT_CREATED,
          entityId: result.rows[0].id,
          entityType: 'project',
          projectId: result.rows[0].id,
          payload: { name, status, priority },
          actor: user?.user || null,
        },
      },
      {
        action: OUTBOX_ACTIONS.SYNC_PROJECT_TO_GRAPH,
        entityType: 'project',
        entityId: result.rows[0].id,
        payload: result.rows[0],
      },
    ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create analysis project', error);
  }
}
