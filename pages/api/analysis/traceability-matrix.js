// pages/api/analysis/traceability-matrix.js
// Traceability Matrix API — Requirements ↔ Stories ↔ Tests coverage
//
// GET /api/analysis/traceability-matrix?project_id=xxx
// GET /api/analysis/traceability-matrix?project_id=xxx&focus=requirements
// GET /api/analysis/traceability-matrix?project_id=xxx&focus=tests

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';

const REQ_TYPES = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'NonFunctionalRequirement', 'BusinessRule', 'UseCase'];
const STORY_TYPES = ['Epic', 'Feature', 'UserStory'];
const TEST_TYPES = ['TestCase', 'TestSuite', 'TestRun'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { project_id, domain_id, focus } = req.query;

  if (!project_id && !domain_id) {
    return res.status(400).json({ error: 'project_id or domain_id is required' });
  }

  try {
    // 1. Fetch all relevant artefacts
    const allTypes = [...REQ_TYPES, ...STORY_TYPES, ...TEST_TYPES];
    let artefactSql = 'SELECT id, name, artefact_type, status, number, prefix, display_id, metadata FROM analysis_artefacts WHERE artefact_type = ANY($1::text[])';
    const artefactParams = [allTypes];
    let paramIdx = 2;

    if (project_id) {
      artefactSql += ` AND project_id = $${paramIdx}`;
      artefactParams.push(project_id);
      paramIdx++;
    }
    if (domain_id) {
      artefactSql += ` AND domain_id = $${paramIdx}`;
      artefactParams.push(domain_id);
      paramIdx++;
    }

    artefactSql += ' ORDER BY artefact_type, number';
    const artefactResult = await query(artefactSql, artefactParams);
    const artefacts = artefactResult.rows;

    const requirements = artefacts.filter(a => REQ_TYPES.includes(a.artefact_type));
    const stories = artefacts.filter(a => STORY_TYPES.includes(a.artefact_type));
    const tests = artefacts.filter(a => TEST_TYPES.includes(a.artefact_type));

    // 2. Fetch all relationships between these artefacts
    const artefactIds = artefacts.map(a => a.id);
    let relationships = [];
    if (artefactIds.length > 0) {
      const relResult = await query(`
        SELECT from_artefact_id, to_artefact_id, relationship_type
        FROM analysis_relationships
        WHERE from_artefact_id = ANY($1::uuid[]) OR to_artefact_id = ANY($1::uuid[])
      `, [artefactIds]);
      relationships = relResult.rows;
    }

    // 3. Build adjacency maps
    // req → stories (via contains, implemented_by, etc.)
    const reqToStories = new Map();
    // story → tests (via verified_by, contains)
    const storyToTests = new Map();
    // req → tests (transitive)
    const reqToTests = new Map();

    // Direct links: requirement → story
    const reqStoryRelTypes = ['implemented_by', 'contains', 'realized_by'];
    // Direct links: story → test
    const storyTestRelTypes = ['verified_by', 'tested_by', 'contains'];

    for (const rel of relationships) {
      const fromId = rel.from_artefact_id;
      const toId = rel.to_artefact_id;
      const fromArtefact = artefacts.find(a => a.id === fromId);
      const toArtefact = artefacts.find(a => a.id === toId);
      if (!fromArtefact || !toArtefact) continue;

      // Requirement → Story links
      if (REQ_TYPES.includes(fromArtefact.artefact_type) && STORY_TYPES.includes(toArtefact.artefact_type)) {
        if (!reqToStories.has(fromId)) reqToStories.set(fromId, new Set());
        reqToStories.get(fromId).add(toId);
      }
      if (STORY_TYPES.includes(fromArtefact.artefact_type) && REQ_TYPES.includes(toArtefact.artefact_type)) {
        if (!reqToStories.has(toId)) reqToStories.set(toId, new Set());
        reqToStories.get(toId).add(fromId);
      }

      // Story → Test links
      if (STORY_TYPES.includes(fromArtefact.artefact_type) && TEST_TYPES.includes(toArtefact.artefact_type)) {
        if (!storyToTests.has(fromId)) storyToTests.set(fromId, new Set());
        storyToTests.get(fromId).add(toId);
      }
      if (TEST_TYPES.includes(fromArtefact.artefact_type) && STORY_TYPES.includes(toArtefact.artefact_type)) {
        if (!storyToTests.has(toId)) storyToTests.set(toId, new Set());
        storyToTests.get(toId).add(fromId);
      }

      // Requirement → Test (direct)
      if (REQ_TYPES.includes(fromArtefact.artefact_type) && TEST_TYPES.includes(toArtefact.artefact_type)) {
        if (!reqToTests.has(fromId)) reqToTests.set(fromId, new Set());
        reqToTests.get(fromId).add(toId);
      }
      if (TEST_TYPES.includes(fromArtefact.artefact_type) && REQ_TYPES.includes(toArtefact.artefact_type)) {
        if (!reqToTests.has(toId)) reqToTests.set(toId, new Set());
        reqToTests.get(toId).add(fromId);
      }
    }

    // Compute transitive req → test via stories
    for (const [reqId, storyIds] of reqToStories) {
      if (!reqToTests.has(reqId)) reqToTests.set(reqId, new Set());
      for (const storyId of storyIds) {
        const testIds = storyToTests.get(storyId);
        if (testIds) {
          for (const testId of testIds) {
            reqToTests.get(reqId).add(testId);
          }
        }
      }
    }

    // 4. Build matrix rows
    const matrix = requirements.map(req => {
      const linkedStories = Array.from(reqToStories.get(req.id) || []);
      const linkedTests = Array.from(reqToTests.get(req.id) || []);
      const testResults = linkedTests.map(testId => {
        const test = tests.find(t => t.id === testId);
        return test ? { id: test.id, name: test.name, result: test.metadata?.pass_fail || 'Not Run' } : null;
      }).filter(Boolean);

      const passCount = testResults.filter(t => t.result === 'Pass').length;
      const failCount = testResults.filter(t => t.result === 'Fail').length;

      return {
        requirement: { id: req.id, name: req.name, type: req.artefact_type, display_id: req.display_id || `${req.prefix}-${String(req.number).padStart(3, '0')}`, status: req.status },
        stories: linkedStories.map(sid => {
          const s = stories.find(st => st.id === sid);
          return s ? { id: s.id, name: s.name, type: s.artefact_type, display_id: s.display_id } : null;
        }).filter(Boolean),
        tests: testResults,
        coverage: {
          hasStories: linkedStories.length > 0,
          hasTests: linkedTests.length > 0,
          storyCount: linkedStories.length,
          testCount: linkedTests.length,
          passCount,
          failCount,
          status: linkedTests.length === 0 ? 'no_coverage'
            : failCount > 0 ? 'failing'
            : passCount === linkedTests.length ? 'passing'
            : 'partial',
        },
      };
    });

    // 5. Summary stats
    const totalReqs = requirements.length;
    const reqsWithStories = matrix.filter(m => m.coverage.hasStories).length;
    const reqsWithTests = matrix.filter(m => m.coverage.hasTests).length;
    const reqsPassing = matrix.filter(m => m.coverage.status === 'passing').length;
    const reqsFailing = matrix.filter(m => m.coverage.status === 'failing').length;

    return res.status(200).json({
      matrix,
      summary: {
        totalRequirements: totalReqs,
        totalStories: stories.length,
        totalTests: tests.length,
        requirementsWithStories: reqsWithStories,
        requirementsWithTests: reqsWithTests,
        requirementsPassing: reqsPassing,
        requirementsFailing: reqsFailing,
        storyCoverage: totalReqs > 0 ? Math.round((reqsWithStories / totalReqs) * 100) : 0,
        testCoverage: totalReqs > 0 ? Math.round((reqsWithTests / totalReqs) * 100) : 0,
        passRate: reqsWithTests > 0 ? Math.round((reqsPassing / reqsWithTests) * 100) : 0,
      },
      relationships: relationships.length,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to compute traceability matrix', error);
  }
}
