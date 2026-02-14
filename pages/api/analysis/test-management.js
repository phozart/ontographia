// pages/api/analysis/test-management.js
// Test Management API — Test Cases, Suites, and Runs
//
// GET /api/analysis/test-management?project_id=xxx — all test artefacts
// GET /api/analysis/test-management?project_id=xxx&type=TestCase — filtered
// GET /api/analysis/test-management?suite_id=xxx — test cases in a suite
// POST /api/analysis/test-management — create test artefact
// POST /api/analysis/test-management?action=run — create test run from suite

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { ARTEFACT_PREFIX_MAP } from '../../../lib/analysis-types';
import { getPipelineStage } from '../../../lib/pipeline-types';
import { enqueueOutboxEvents, OUTBOX_ACTIONS } from '../../../lib/services/outboxService';

const TEST_TYPES = ['TestCase', 'TestSuite', 'TestRun'];

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

async function handleGet(req, res) {
  const { project_id, domain_id, type, suite_id, run_id } = req.query;

  try {
    // Get test cases in a suite
    if (suite_id) {
      const result = await query(`
        SELECT a.* FROM analysis_artefacts a
        INNER JOIN analysis_relationships r ON r.to_artefact_id = a.id
        WHERE r.from_artefact_id = $1
          AND r.relationship_type = 'contains'
          AND a.artefact_type = 'TestCase'
        ORDER BY a.number ASC
      `, [suite_id]);
      return res.status(200).json(result.rows);
    }

    // Get test results for a run
    if (run_id) {
      const runResult = await query(
        'SELECT * FROM analysis_artefacts WHERE id = $1 AND artefact_type = $2',
        [run_id, 'TestRun']
      );
      if (runResult.rows.length === 0) {
        return res.status(404).json({ error: 'Test run not found' });
      }

      // Get associated test cases via relationships
      const casesResult = await query(`
        SELECT a.*, r.metadata as result_metadata
        FROM analysis_artefacts a
        INNER JOIN analysis_relationships r ON r.to_artefact_id = a.id
        WHERE r.from_artefact_id = $1
          AND r.relationship_type = 'includes_result_for'
        ORDER BY a.number ASC
      `, [run_id]);

      return res.status(200).json({
        run: runResult.rows[0],
        testCases: casesResult.rows,
      });
    }

    // General listing
    let sql = 'SELECT * FROM analysis_artefacts WHERE artefact_type = ANY($1::text[])';
    const params = [type ? [type] : TEST_TYPES];
    let paramIdx = 2;

    if (project_id) {
      sql += ` AND project_id = $${paramIdx}`;
      params.push(project_id);
      paramIdx++;
    }
    if (domain_id) {
      sql += ` AND domain_id = $${paramIdx}`;
      params.push(domain_id);
      paramIdx++;
    }

    sql += ' ORDER BY artefact_type ASC, number ASC';
    const result = await query(sql, params);

    // Compute coverage stats
    const testCases = result.rows.filter(a => a.artefact_type === 'TestCase');
    const passed = testCases.filter(a => a.metadata?.pass_fail === 'Pass').length;
    const failed = testCases.filter(a => a.metadata?.pass_fail === 'Fail').length;
    const notRun = testCases.filter(a => !a.metadata?.pass_fail || a.metadata?.pass_fail === 'Not Run').length;

    return res.status(200).json({
      artefacts: result.rows,
      stats: {
        total: result.rows.length,
        testCases: testCases.length,
        testSuites: result.rows.filter(a => a.artefact_type === 'TestSuite').length,
        testRuns: result.rows.filter(a => a.artefact_type === 'TestRun').length,
        passed,
        failed,
        notRun,
        passRate: testCases.length > 0 ? Math.round((passed / testCases.length) * 100) : 0,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch test data', error);
  }
}

async function handlePost(req, res) {
  const user = getUserFromRequest(req);
  const { action } = req.query;

  // Create a test run from a suite
  if (action === 'run') {
    return handleCreateRun(req, res, user);
  }

  // Standard test artefact creation
  const {
    name, description, artefact_type, project_id, domain_id,
    suite_id, metadata = {},
  } = req.body;

  if (!name || !artefact_type) {
    return res.status(400).json({ error: 'name and artefact_type are required' });
  }
  if (!TEST_TYPES.includes(artefact_type)) {
    return res.status(400).json({ error: `artefact_type must be one of: ${TEST_TYPES.join(', ')}` });
  }

  try {
    const prefix = ARTEFACT_PREFIX_MAP[artefact_type] || 'T';
    const pipelineStage = getPipelineStage(artefact_type);

    const numberResult = await query(
      'SELECT COALESCE(MAX(number), 0) + 1 as next_number FROM analysis_artefacts WHERE project_id = $1 AND artefact_type = $2',
      [project_id, artefact_type]
    );
    const number = numberResult.rows[0].next_number;
    const displayId = `${prefix}-${String(number).padStart(3, '0')}`;

    const result = await query(
      `INSERT INTO analysis_artefacts
        (name, description, artefact_type, status, project_id, domain_id, metadata, number, prefix, module, pipeline_stage, display_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [name, description || '', artefact_type, 'Draft', project_id, domain_id, JSON.stringify(metadata), number, prefix, 'testing', pipelineStage, displayId, user?.user || null]
    );
    const artefact = result.rows[0];

    // Auto-link to suite
    if (suite_id && artefact_type === 'TestCase') {
      await query(
        `INSERT INTO analysis_relationships
          (from_artefact_id, to_artefact_id, relationship_type, project_id, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (from_artefact_id, to_artefact_id, relationship_type) DO NOTHING`,
        [suite_id, artefact.id, 'contains', project_id, JSON.stringify({ auto_created: true })]
      );
    }

    // Enqueue graph sync
    enqueueOutboxEvents([
      {
        action: OUTBOX_ACTIONS.SYNC_ARTEFACT_TO_GRAPH,
        entityType: 'artefact',
        entityId: artefact.id,
        payload: artefact,
      },
      {
        action: OUTBOX_ACTIONS.MATERIALISE_ARTEFACT,
        entityType: 'artefact',
        entityId: artefact.id,
        payload: artefact,
      },
    ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(201).json(artefact);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create test artefact', error);
  }
}

/**
 * Create a test run by cloning test cases from a suite.
 */
async function handleCreateRun(req, res, user) {
  const {
    suite_id, project_id, domain_id,
    name, environment, build_version,
  } = req.body;

  if (!suite_id) {
    return res.status(400).json({ error: 'suite_id is required' });
  }

  try {
    // Verify suite exists
    const suiteResult = await query(
      'SELECT * FROM analysis_artefacts WHERE id = $1 AND artefact_type = $2',
      [suite_id, 'TestSuite']
    );
    if (suiteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    const suite = suiteResult.rows[0];

    // Get test cases in suite
    const casesResult = await query(`
      SELECT a.id, a.name FROM analysis_artefacts a
      INNER JOIN analysis_relationships r ON r.to_artefact_id = a.id
      WHERE r.from_artefact_id = $1 AND r.relationship_type = 'contains' AND a.artefact_type = 'TestCase'
      ORDER BY a.number ASC
    `, [suite_id]);

    const totalCases = casesResult.rows.length;
    const prefix = 'TR';
    const pipelineStage = getPipelineStage('TestRun');

    const numberResult = await query(
      'SELECT COALESCE(MAX(number), 0) + 1 as next_number FROM analysis_artefacts WHERE project_id = $1 AND artefact_type = $2',
      [project_id || suite.project_id, 'TestRun']
    );
    const number = numberResult.rows[0].next_number;
    const displayId = `${prefix}-${String(number).padStart(3, '0')}`;

    // Create the test run
    const runResult = await query(
      `INSERT INTO analysis_artefacts
        (name, description, artefact_type, status, project_id, domain_id, metadata, number, prefix, module, pipeline_stage, display_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        name || `${suite.name} - Run ${number}`,
        `Test run for suite ${suite.name}`,
        'TestRun',
        'Draft',
        project_id || suite.project_id,
        domain_id || suite.domain_id,
        JSON.stringify({
          suite_id,
          environment: environment || '',
          build_version: build_version || '',
          total_cases: totalCases,
          passed: 0,
          failed: 0,
          blocked: 0,
          skipped: 0,
          run_status: 'Planned',
        }),
        number,
        prefix,
        'testing',
        pipelineStage,
        displayId,
        user?.user || null,
      ]
    );
    const run = runResult.rows[0];

    // Link run to suite
    await query(
      `INSERT INTO analysis_relationships
        (from_artefact_id, to_artefact_id, relationship_type, project_id, metadata)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (from_artefact_id, to_artefact_id, relationship_type) DO NOTHING`,
      [run.id, suite_id, 'executes', project_id || suite.project_id, JSON.stringify({ auto_created: true })]
    );

    // Link run to each test case
    for (const tc of casesResult.rows) {
      await query(
        `INSERT INTO analysis_relationships
          (from_artefact_id, to_artefact_id, relationship_type, project_id, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (from_artefact_id, to_artefact_id, relationship_type) DO NOTHING`,
        [run.id, tc.id, 'includes_result_for', project_id || suite.project_id, JSON.stringify({ result: 'Not Run' })]
      );
    }

    return res.status(201).json({
      ...run,
      testCaseCount: totalCases,
      suite: { id: suite.id, name: suite.name },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create test run', error);
  }
}
