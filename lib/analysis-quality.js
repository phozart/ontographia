// lib/analysis-quality.js
// Requirement quality check functions for the Analysis Studio
// Checks ambiguity, testability, and atomicity of requirement text

/**
 * Ambiguous/vague terms that weaken requirements.
 * Each entry: { term (regex-safe), suggestion }
 */
const AMBIGUOUS_TERMS = [
  { term: 'appropriate', suggestion: 'Define specific criteria or thresholds instead of "appropriate"' },
  { term: 'reasonable', suggestion: 'Replace "reasonable" with a measurable value or range' },
  { term: 'user-friendly', suggestion: 'Define specific usability criteria (e.g., task completion time < 30s)' },
  { term: 'user friendly', suggestion: 'Define specific usability criteria (e.g., task completion time < 30s)' },
  { term: 'fast', suggestion: 'Specify a response time target (e.g., < 200ms)' },
  { term: 'efficient', suggestion: 'Define efficiency in measurable terms (throughput, resource usage)' },
  { term: 'flexible', suggestion: 'Describe the specific configurability or adaptability needed' },
  { term: 'robust', suggestion: 'Specify failure modes and recovery requirements explicitly' },
  { term: 'easy', suggestion: 'Define what "easy" means: number of steps, time to complete, error rate' },
  { term: 'intuitive', suggestion: 'Describe the expected user experience with measurable criteria' },
  { term: 'modern', suggestion: 'Specify the technologies, standards, or patterns required' },
  { term: 'various', suggestion: 'List the specific items instead of saying "various"' },
  { term: 'etc\\.', suggestion: 'List all items explicitly; "etc." hides scope' },
  { term: 'and/or', suggestion: 'Use "and" or "or" specifically; "and/or" creates ambiguity' },
  { term: '\\bshould\\b', suggestion: 'Use "shall" for mandatory requirements or "will" for design intent' },
  { term: '\\bmay\\b', suggestion: '"May" implies optional; use "shall" if the feature is required' },
  { term: '\\bmight\\b', suggestion: '"Might" is uncertain; state the requirement definitively with "shall"' },
  { term: '\\bcould\\b', suggestion: '"Could" is non-committal; use "shall" for requirements' },
  { term: 'adequate', suggestion: 'Define specific acceptance criteria instead of "adequate"' },
  { term: 'normal', suggestion: 'Define "normal" conditions explicitly (load, users, data volume)' },
  { term: 'quickly', suggestion: 'Specify a time constraint (e.g., within 2 seconds)' },
  { term: 'minimal', suggestion: 'Specify the exact minimum value or threshold' },
  { term: 'sufficient', suggestion: 'Define the specific quantity or capacity required' },
  { term: 'as needed', suggestion: 'Define the specific triggers or conditions' },
  { term: 'if possible', suggestion: 'State whether the feature is required or optional' },
  { term: 'seamless', suggestion: 'Describe the specific integration or transition behavior expected' },
  { term: 'scalable', suggestion: 'Define scale targets: concurrent users, data volume, transactions/sec' },
];

/**
 * Check requirement text for ambiguous/vague terms.
 *
 * @param {string} text - The requirement text to analyze
 * @returns {{ score: number, issues: Array<{term: string, suggestion: string, index: number}> }}
 *   score: 0-100 where 100 is no ambiguity found
 *   issues: list of flagged terms with their position and improvement suggestion
 */
export function checkAmbiguity(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { score: 100, issues: [] };
  }

  const issues = [];
  const lowerText = text.toLowerCase();

  for (const { term, suggestion } of AMBIGUOUS_TERMS) {
    const regex = new RegExp(term, 'gi');
    let match;

    while ((match = regex.exec(lowerText)) !== null) {
      issues.push({
        term: match[0],
        suggestion,
        index: match.index,
      });
    }
  }

  // Score: penalize 8 points per issue, floor at 0
  const wordCount = text.split(/\s+/).length;
  const densityPenalty = wordCount > 0 ? (issues.length / wordCount) * 100 : 0;
  const flatPenalty = issues.length * 8;
  const totalPenalty = Math.min(flatPenalty + densityPenalty, 100);
  const score = Math.max(0, Math.round(100 - totalPenalty));

  return { score, issues };
}

/**
 * Check if a requirement is testable (has measurable criteria).
 *
 * Examines the requirement object for:
 * - Presence of acceptance criteria
 * - Numeric thresholds or measurable values in description
 * - Specific, verifiable conditions
 *
 * @param {Object} requirement - Requirement artefact object
 * @param {string} requirement.description - Requirement description text
 * @param {Object} [requirement.metadata] - Metadata including acceptanceCriteria
 * @param {string} [requirement.acceptance_criteria] - Direct acceptance criteria field
 * @param {string} [requirement.metric] - For NFRs, the measurable metric
 * @param {string} [requirement.target_value] - For NFRs, the target value
 * @returns {{ testable: boolean, issues: string[] }}
 */
export function checkTestability(requirement) {
  if (!requirement) {
    return { testable: false, issues: ['No requirement provided'] };
  }

  const issues = [];
  const description = requirement.description || '';
  const acceptanceCriteria = requirement.acceptance_criteria || '';
  const metadataCriteria = requirement.metadata?.acceptanceCriteria;
  const metric = requirement.metric || '';
  const targetValue = requirement.target_value || '';

  // Check 1: Acceptance criteria exist
  const hasStructuredCriteria = Array.isArray(metadataCriteria) && metadataCriteria.length > 0;
  const hasTextCriteria = acceptanceCriteria.trim().length > 0;

  if (!hasStructuredCriteria && !hasTextCriteria) {
    issues.push('No acceptance criteria defined. Add Given/When/Then criteria or a text description of how to verify this requirement.');
  }

  // Check 2: If structured criteria exist, validate they have complete GWT
  if (hasStructuredCriteria) {
    const incompleteCriteria = metadataCriteria.filter(
      (c) => !c.given?.trim() || !c.when?.trim() || !c.then?.trim()
    );
    if (incompleteCriteria.length > 0) {
      issues.push(
        `${incompleteCriteria.length} acceptance ${incompleteCriteria.length === 1 ? 'criterion is' : 'criteria are'} incomplete. Each should have Given, When, and Then clauses.`
      );
    }
  }

  // Check 3: Numeric thresholds or measurable values in description
  const allText = `${description} ${acceptanceCriteria} ${metric} ${targetValue}`;
  const hasNumericValue = /\d+(\.\d+)?(%|ms|s|sec|seconds|minutes|min|hours|hr|MB|GB|TB|KB|px|em|rem|requests?\/s|req\/s|tps|users?|rows?|records?|items?)/i.test(allText);
  const hasComparisonOperator = /(less than|greater than|at least|at most|no more than|within|between|maximum|minimum|<=|>=|<|>|=)/i.test(allText);
  const hasSpecificValue = /\b\d+\b/.test(allText);

  if (!hasNumericValue && !hasComparisonOperator) {
    issues.push('No measurable thresholds found. Add specific numeric targets (e.g., "response time < 200ms", "99.9% uptime").');
  }

  // Check 4: For NFRs specifically, check metric and target
  if (requirement.artefactType === 'NonFunctionalRequirement') {
    if (!metric.trim()) {
      issues.push('Non-functional requirements should have a measurable metric defined.');
    }
    if (!targetValue.trim()) {
      issues.push('Non-functional requirements should have a target value for the metric.');
    }
  }

  // Testable if no critical issues (has some form of criteria AND measurability)
  const hasCriteria = hasStructuredCriteria || hasTextCriteria;
  const hasMeasurability = hasNumericValue || hasComparisonOperator || hasSpecificValue;
  const testable = hasCriteria && (hasMeasurability || issues.length <= 1);

  return { testable, issues };
}

/**
 * Check if requirement text is atomic (single concern).
 *
 * Flags:
 * - "and" conjunctions joining independent clauses (compound requirements)
 * - Multiple "shall" statements in one requirement
 * - Semicolons separating distinct requirements
 * - Bullet lists embedded within a single requirement
 *
 * @param {string} text - The requirement text to analyze
 * @returns {{ atomic: boolean, issues: string[] }}
 */
export function checkAtomicity(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { atomic: true, issues: [] };
  }

  const issues = [];

  // Check 1: Multiple "shall" statements
  const shallMatches = text.match(/\bshall\b/gi);
  if (shallMatches && shallMatches.length > 1) {
    issues.push(
      `Contains ${shallMatches.length} "shall" statements. Each requirement should contain only one "shall" to express a single obligation.`
    );
  }

  // Check 2: Semicolons separating distinct requirements
  const semicolonSegments = text.split(';').filter((s) => s.trim().length > 10);
  if (semicolonSegments.length > 1) {
    issues.push(
      `Contains ${semicolonSegments.length} clauses separated by semicolons. Consider splitting into ${semicolonSegments.length} separate requirements.`
    );
  }

  // Check 3: "and" joining independent clauses
  // Look for patterns like "The system shall X and shall Y" or "X, and Y"
  const compoundAndPattern = /\bshall\b[^.;]*\band\b[^.;]*\bshall\b/gi;
  if (compoundAndPattern.test(text)) {
    issues.push(
      'Contains compound "shall...and...shall" clauses. Split into separate requirements for each obligation.'
    );
  }

  // Also check for "and" connecting verb phrases that suggest multiple actions
  const andVerbPattern = /\b(shall|must|will)\b[^.;]+\band\b\s+(also\s+)?(shall|must|will|provide|support|enable|allow|ensure|display|process|handle|manage|create|update|delete|send|receive|validate|check|verify)\b/gi;
  if (andVerbPattern.test(text)) {
    issues.push(
      'The requirement appears to describe multiple actions joined by "and". Consider whether these should be separate requirements.'
    );
  }

  // Check 4: Numbered or bulleted lists within text suggesting multiple requirements
  const listPattern = /(\n\s*[-*]\s+|\n\s*\d+[.)]\s+)/;
  const listMatches = text.match(/(\n\s*[-*]\s+|\n\s*\d+[.)]\s+)/g);
  if (listMatches && listMatches.length >= 2) {
    issues.push(
      `Contains an embedded list with ${listMatches.length} items. If each item represents a distinct requirement, create separate requirement artefacts.`
    );
  }

  // Check 5: Very long requirements are often non-atomic
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 80) {
    issues.push(
      `Requirement is ${wordCount} words long. Long requirements often cover multiple concerns. Consider splitting for clarity and traceability.`
    );
  }

  const atomic = issues.length === 0;
  return { atomic, issues };
}

/**
 * Run all quality checks on a requirement.
 *
 * @param {Object} requirement - Requirement artefact object
 * @param {string} requirement.name - Requirement title
 * @param {string} requirement.description - Requirement description
 * @param {Object} [requirement.metadata] - Metadata including acceptanceCriteria
 * @param {string} [requirement.acceptance_criteria] - Acceptance criteria text
 * @returns {{
 *   overallScore: number,
 *   checks: {
 *     ambiguity: { score: number, issues: Array },
 *     testability: { testable: boolean, issues: string[] },
 *     atomicity: { atomic: boolean, issues: string[] }
 *   }
 * }}
 */
export function runQualityChecks(requirement) {
  if (!requirement) {
    return {
      overallScore: 0,
      checks: {
        ambiguity: { score: 0, issues: [] },
        testability: { testable: false, issues: ['No requirement provided'] },
        atomicity: { atomic: true, issues: [] },
      },
    };
  }

  const fullText = [requirement.name || '', requirement.description || ''].join(' ').trim();

  const ambiguity = checkAmbiguity(fullText);
  const testability = checkTestability(requirement);
  const atomicity = checkAtomicity(requirement.description || '');

  // Overall score: weighted average
  // Ambiguity: 40% (direct score)
  // Testability: 35% (100 if testable, 30 if has some criteria, 0 if none)
  // Atomicity: 25% (100 if atomic, 0 if not)
  const testabilityScore = testability.testable ? 100 : testability.issues.length <= 1 ? 50 : 0;
  const atomicityScore = atomicity.atomic ? 100 : Math.max(0, 100 - atomicity.issues.length * 30);

  const overallScore = Math.round(
    ambiguity.score * 0.4 + testabilityScore * 0.35 + atomicityScore * 0.25
  );

  return {
    overallScore,
    checks: {
      ambiguity,
      testability,
      atomicity,
    },
  };
}

/**
 * Get a human-readable quality grade based on score.
 *
 * @param {number} score - Quality score 0-100
 * @returns {{ grade: string, label: string, color: string }}
 */
export function getQualityGrade(score) {
  if (score >= 90) return { grade: 'A', label: 'Excellent', color: '#5B8A6A' };
  if (score >= 75) return { grade: 'B', label: 'Good', color: '#6A8B5B' };
  if (score >= 60) return { grade: 'C', label: 'Acceptable', color: '#C9A227' };
  if (score >= 40) return { grade: 'D', label: 'Needs Work', color: '#C97027' };
  return { grade: 'F', label: 'Poor', color: '#A54D4D' };
}
