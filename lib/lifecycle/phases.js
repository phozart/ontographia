// lib/lifecycle/phases.js
// 7-phase lifecycle model for initiative progression through the platform.

export const PHASES = [
  {
    id: 'strategic_intake',
    label: 'Strategic Intake',
    shortLabel: 'Intake',
    description: 'Idea captured, initial framing and alignment check',
    studio: 'blueprint',
    color: '#9C9A94',
    order: 1,
  },
  {
    id: 'investigation',
    label: 'Investigation',
    shortLabel: 'Investigate',
    description: 'Problem/opportunity research, stakeholder identification',
    studio: 'blueprint',
    color: '#C9A227',
    order: 2,
  },
  {
    id: 'discovery',
    label: 'Discovery',
    shortLabel: 'Discover',
    description: 'Deep analysis, requirements gathering, architecture decisions',
    studio: 'analysis',
    color: '#5B8A6A',
    order: 3,
  },
  {
    id: 'specification',
    label: 'Specification',
    shortLabel: 'Specify',
    description: 'Detailed design, acceptance criteria, test planning',
    studio: 'analysis',
    color: '#47453F',
    order: 4,
  },
  {
    id: 'development',
    label: 'Development',
    shortLabel: 'Develop',
    description: 'Build phase, managed through project studio',
    studio: 'pds',
    color: '#5C5A54',
    order: 5,
  },
  {
    id: 'gtm',
    label: 'Go-to-Market',
    shortLabel: 'GTM',
    description: 'Launch planning, communications, enablement',
    studio: 'gtm',
    color: '#A54D4D',
    order: 6,
  },
  {
    id: 'post_launch',
    label: 'Post-Launch',
    shortLabel: 'Post-Launch',
    description: 'Adoption tracking, retrospective, knowledge capture',
    studio: 'blueprint',
    color: '#1F1E1B',
    order: 7,
  },
];

export const PHASE_MAP = Object.fromEntries(PHASES.map(p => [p.id, p]));

export const PHASE_IDS = PHASES.map(p => p.id);

/**
 * Initiative tiers determine which phases are mandatory vs. optional.
 */
export const TIERS = {
  major: {
    label: 'Major',
    description: 'Full lifecycle — all 7 phases required',
    requiredPhases: PHASE_IDS,
    gateApprovals: ['investigation', 'discovery', 'specification', 'development', 'gtm'],
  },
  moderate: {
    label: 'Moderate',
    description: 'Standard lifecycle — intake through development, GTM optional',
    requiredPhases: ['strategic_intake', 'investigation', 'discovery', 'specification', 'development'],
    gateApprovals: ['investigation', 'discovery', 'specification'],
  },
  minor: {
    label: 'Minor',
    description: 'Lightweight — intake, discovery, development only',
    requiredPhases: ['strategic_intake', 'discovery', 'development'],
    gateApprovals: ['discovery'],
  },
};

/**
 * Get the next phase for an initiative given its current phase and tier.
 */
export function getNextPhase(currentPhaseId, tier = 'moderate') {
  const tierConfig = TIERS[tier] || TIERS.moderate;
  const required = tierConfig.requiredPhases;
  const currentIdx = required.indexOf(currentPhaseId);
  if (currentIdx === -1 || currentIdx >= required.length - 1) return null;
  return PHASE_MAP[required[currentIdx + 1]] || null;
}

/**
 * Get the studio that owns a given phase.
 */
export function getPhaseStudio(phaseId) {
  const phase = PHASE_MAP[phaseId];
  return phase?.studio || null;
}

/**
 * Check if a phase requires gate approval for a given tier.
 */
export function requiresGateApproval(phaseId, tier = 'moderate') {
  const tierConfig = TIERS[tier] || TIERS.moderate;
  return tierConfig.gateApprovals.includes(phaseId);
}
