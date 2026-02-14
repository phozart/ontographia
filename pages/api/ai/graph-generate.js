// pages/api/ai/graph-generate.js
// AI generation with graph context injection
//
// POST /api/ai/graph-generate
// Body: { action, artefact_id, project_id, domain_id, options }
//
// Actions:
//   stories_from_requirement — Generate user stories from a requirement
//   tests_from_story — Generate test cases from a user story
//   description_from_context — Generate artefact description from graph context
//   graph_query — Natural language query over the knowledge graph

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { OpenRouterService, DEFAULT_MODEL } from '../../../lib/services/OpenRouterService';
import { getUserFromRequest } from '../../../lib/projectAccess';

const VALID_ACTIONS = ['stories_from_requirement', 'tests_from_story', 'description_from_context', 'graph_query'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const user = getUserFromRequest(req);
  const { action, artefact_id, project_id, domain_id, options = {}, model } = req.body;

  if (!action || !VALID_ACTIONS.includes(action)) {
    return res.status(400).json({
      error: `Invalid action. Available: ${VALID_ACTIONS.join(', ')}`,
    });
  }

  const service = new OpenRouterService();
  if (!service.isConfigured()) {
    return res.status(503).json({
      error: 'AI service not configured',
      message: 'OpenRouter API key not set. Add OPENROUTER_API_KEY to your .env file.',
    });
  }

  try {
    let result;

    switch (action) {
      case 'stories_from_requirement':
        result = await generateStoriesFromRequirement(service, artefact_id, project_id, model);
        break;
      case 'tests_from_story':
        result = await generateTestsFromStory(service, artefact_id, project_id, model);
        break;
      case 'description_from_context':
        result = await generateDescriptionFromContext(service, artefact_id, domain_id, model);
        break;
      case 'graph_query':
        result = await handleGraphQuery(service, options.question, domain_id, model);
        break;
    }

    return res.status(200).json(result);
  } catch (error) {
    return errorResponse(res, 500, 'AI generation failed', error);
  }
}

/**
 * Generate user stories from a requirement, with graph context.
 */
async function generateStoriesFromRequirement(service, artefactId, projectId, model) {
  if (!artefactId) throw new Error('artefact_id is required');

  // Fetch the requirement
  const reqResult = await query('SELECT * FROM analysis_artefacts WHERE id = $1', [artefactId]);
  if (reqResult.rows.length === 0) throw new Error('Requirement not found');
  const requirement = reqResult.rows[0];

  // Fetch related artefacts for context
  const contextArtefacts = await getRelatedArtefacts(artefactId);

  // Build prompt with graph context
  const contextSection = contextArtefacts.length > 0
    ? `\n\nRelated artefacts in the knowledge graph:\n${contextArtefacts.map(a => `- ${a.artefact_type}: ${a.name} — ${a.description || 'No description'}`).join('\n')}`
    : '';

  const prompt = `You are a senior business analyst. Generate user stories from the following requirement.

**Requirement:** ${requirement.name}
**Type:** ${requirement.artefact_type}
**Description:** ${requirement.description || 'No description provided'}
**Priority:** ${requirement.metadata?.priority || requirement.priority || 'Medium'}
**Acceptance Criteria:** ${requirement.metadata?.acceptance_criteria || 'Not specified'}
${contextSection}

Generate 3-5 user stories in the format:
- Title: [concise title]
- As a [role], I want [goal] so that [benefit]
- Acceptance Criteria (Given/When/Then):
  - Given [context], When [action], Then [expected result]
- Story Points estimate: [1-13]

Return as JSON array:
[{
  "name": "story title",
  "description": "As a ... I want ... so that ...",
  "acceptance_criteria": "Given ... When ... Then ...",
  "story_points": 3,
  "priority": "Medium"
}]

Return ONLY the JSON array, no other text.`;

  const aiResult = await service.generate({ prompt, model: model || DEFAULT_MODEL, temperature: 0.7 });

  if (!aiResult.success) {
    throw new Error(aiResult.error || 'AI generation failed');
  }

  // Parse the JSON response
  let stories;
  try {
    const content = aiResult.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    stories = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
  } catch {
    stories = [{ name: 'Generated Story', description: aiResult.content, story_points: 3, priority: 'Medium' }];
  }

  return {
    action: 'stories_from_requirement',
    source: { id: requirement.id, name: requirement.name, type: requirement.artefact_type },
    generated: stories.map(s => ({
      artefact_type: 'UserStory',
      name: s.name || s.title || 'User Story',
      description: s.description,
      metadata: {
        acceptance_criteria: s.acceptance_criteria,
        story_points: s.story_points || s.storyPoints,
        priority: s.priority || 'Medium',
        generated_from: requirement.id,
      },
    })),
    contextUsed: contextArtefacts.length,
  };
}

/**
 * Generate test cases from a user story, with graph context.
 */
async function generateTestsFromStory(service, artefactId, projectId, model) {
  if (!artefactId) throw new Error('artefact_id is required');

  const storyResult = await query('SELECT * FROM analysis_artefacts WHERE id = $1', [artefactId]);
  if (storyResult.rows.length === 0) throw new Error('Story not found');
  const story = storyResult.rows[0];

  const contextArtefacts = await getRelatedArtefacts(artefactId);

  const prompt = `You are a QA engineer. Generate test cases from the following user story.

**User Story:** ${story.name}
**Description:** ${story.description || 'No description'}
**Acceptance Criteria:** ${story.metadata?.acceptance_criteria || 'Not specified'}

${contextArtefacts.length > 0 ? `Related artefacts:\n${contextArtefacts.map(a => `- ${a.artefact_type}: ${a.name}`).join('\n')}` : ''}

Generate 3-5 test cases. For each:
- Title: descriptive test name
- Type: Functional/Integration/Regression
- Preconditions
- Steps: [{step number, action, expected result}]
- Priority: Critical/High/Medium/Low

Return as JSON array:
[{
  "name": "test case title",
  "test_type": "Functional",
  "preconditions": "...",
  "steps": [{"step": 1, "action": "...", "expected": "..."}],
  "expected_result": "overall expected outcome",
  "priority": "High"
}]

Return ONLY the JSON array, no other text.`;

  const aiResult = await service.generate({ prompt, model: model || DEFAULT_MODEL, temperature: 0.5 });

  if (!aiResult.success) {
    throw new Error(aiResult.error || 'AI generation failed');
  }

  let testCases;
  try {
    const content = aiResult.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    testCases = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
  } catch {
    testCases = [{ name: 'Generated Test', test_type: 'Functional', priority: 'Medium' }];
  }

  return {
    action: 'tests_from_story',
    source: { id: story.id, name: story.name, type: story.artefact_type },
    generated: testCases.map(tc => ({
      artefact_type: 'TestCase',
      name: tc.name || tc.title || 'Test Case',
      description: tc.description || '',
      metadata: {
        test_type: tc.test_type || 'Functional',
        preconditions: tc.preconditions || '',
        steps: tc.steps || [],
        expected_result: tc.expected_result || '',
        priority: tc.priority || 'Medium',
        generated_from: story.id,
      },
    })),
    contextUsed: contextArtefacts.length,
  };
}

/**
 * Generate a rich description for an artefact using graph context.
 */
async function generateDescriptionFromContext(service, artefactId, domainId, model) {
  if (!artefactId) throw new Error('artefact_id is required');

  const artefactResult = await query('SELECT * FROM analysis_artefacts WHERE id = $1', [artefactId]);
  if (artefactResult.rows.length === 0) throw new Error('Artefact not found');
  const artefact = artefactResult.rows[0];

  const contextArtefacts = await getRelatedArtefacts(artefactId);

  const prompt = `Enhance the description for this ${artefact.artefact_type} artefact.

**Name:** ${artefact.name}
**Current Description:** ${artefact.description || 'None'}
**Type:** ${artefact.artefact_type}

${contextArtefacts.length > 0 ? `Graph context (related artefacts):\n${contextArtefacts.map(a => `- ${a.artefact_type}: ${a.name} — ${a.description || ''}`).join('\n')}` : ''}

Write a clear, professional description (2-3 paragraphs) that:
1. Explains the purpose and scope
2. References connections to related artefacts where relevant
3. Identifies key considerations or risks

Return plain text only.`;

  const aiResult = await service.generate({ prompt, model: model || DEFAULT_MODEL, temperature: 0.6 });

  return {
    action: 'description_from_context',
    artefact: { id: artefact.id, name: artefact.name },
    generated: aiResult.success ? aiResult.content : 'Generation failed',
    contextUsed: contextArtefacts.length,
  };
}

/**
 * Natural language query over the knowledge graph.
 */
async function handleGraphQuery(service, question, domainId, model) {
  if (!question) throw new Error('options.question is required');

  // Fetch graph summary for context
  let graphContext = '';
  if (domainId) {
    const nodeTypesResult = await query(
      `SELECT type_id, COUNT(*) as count FROM graph_nodes WHERE domain = $1 GROUP BY type_id ORDER BY count DESC LIMIT 20`,
      [domainId]
    );
    const relTypesResult = await query(
      `SELECT COALESCE(type_id, name) as type, COUNT(*) as count FROM graph_relationships WHERE domain = $1 GROUP BY COALESCE(type_id, name) ORDER BY count DESC LIMIT 20`,
      [domainId]
    );

    graphContext = `\nGraph contains:\n`;
    graphContext += `Node types: ${nodeTypesResult.rows.map(r => `${r.type_id} (${r.count})`).join(', ')}\n`;
    graphContext += `Relationship types: ${relTypesResult.rows.map(r => `${r.type} (${r.count})`).join(', ')}\n`;

    // Sample some nodes for context
    const sampleNodes = await query(
      'SELECT name, type_id, description FROM graph_nodes WHERE domain = $1 ORDER BY updated_at DESC LIMIT 30',
      [domainId]
    );
    if (sampleNodes.rows.length > 0) {
      graphContext += `\nSample entities:\n${sampleNodes.rows.map(n => `- ${n.type_id}: ${n.name}`).join('\n')}`;
    }
  }

  const prompt = `You are a knowledge graph assistant for an enterprise. Answer the following question using the graph context provided.
${graphContext}

**Question:** ${question}

If the answer can be found in the graph context, answer directly. If not, explain what information would be needed and suggest which artefact types to create or connect.

Be specific and reference actual entity names from the graph context where possible.`;

  const aiResult = await service.generate({ prompt, model: model || DEFAULT_MODEL, temperature: 0.3 });

  return {
    action: 'graph_query',
    question,
    answer: aiResult.success ? aiResult.content : 'Unable to generate answer',
    graphContextSize: graphContext.length,
  };
}

/**
 * Get artefacts related to a given artefact via analysis_relationships.
 */
async function getRelatedArtefacts(artefactId) {
  const result = await query(`
    SELECT DISTINCT a.id, a.name, a.artefact_type, a.description, a.status
    FROM analysis_artefacts a
    INNER JOIN analysis_relationships r ON (
      (r.from_artefact_id = $1 AND r.to_artefact_id = a.id)
      OR (r.to_artefact_id = $1 AND r.from_artefact_id = a.id)
    )
    WHERE a.id != $1
    LIMIT 15
  `, [artefactId]);
  return result.rows;
}
