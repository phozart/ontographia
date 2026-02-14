/**
 * Achievements System
 *
 * Gamification layer for the coaching system to encourage learning
 * and engagement across all 18 spaces.
 *
 * Achievement Categories:
 * - Universal: Apply to all spaces
 * - Space-Specific: Unique to each space
 * - Cross-Space: Reward connections between spaces
 * - Streaks: Reward consistent engagement
 *
 * @module lib/coaching/achievements
 */

// =============================================================================
// ACHIEVEMENT TYPES
// =============================================================================

export const ACHIEVEMENT_TYPES = {
  universal: {
    id: 'universal',
    name: 'Universal',
    description: 'Achievements that apply across all spaces',
    icon: 'Star',
  },
  space_specific: {
    id: 'space_specific',
    name: 'Space-Specific',
    description: 'Achievements unique to each space',
    icon: 'EmojiEvents',
  },
  cross_space: {
    id: 'cross_space',
    name: 'Cross-Space',
    description: 'Achievements for connecting work across spaces',
    icon: 'Link',
  },
  streak: {
    id: 'streak',
    name: 'Streak',
    description: 'Achievements for consistent engagement',
    icon: 'LocalFire',
  },
  mastery: {
    id: 'mastery',
    name: 'Mastery',
    description: 'Achievements for demonstrating expertise',
    icon: 'School',
  },
};

export const ACHIEVEMENT_TIERS = {
  bronze: { id: 'bronze', name: 'Bronze', color: '#cd7f32', multiplier: 1 },
  silver: { id: 'silver', name: 'Silver', color: '#c0c0c0', multiplier: 2 },
  gold: { id: 'gold', name: 'Gold', color: '#ffd700', multiplier: 3 },
  platinum: { id: 'platinum', name: 'Platinum', color: '#e5e4e2', multiplier: 5 },
};

// =============================================================================
// UNIVERSAL ACHIEVEMENTS
// =============================================================================

export const UNIVERSAL_ACHIEVEMENTS = {
  // Getting Started
  first_element: {
    id: 'first_element',
    name: 'Getting Started',
    description: 'Create your first element in any space',
    type: 'universal',
    tier: 'bronze',
    xp: 10,
    condition: (stats) => stats.totalElements >= 1,
    icon: 'RocketLaunch',
  },

  explorer: {
    id: 'explorer',
    name: 'Explorer',
    description: 'Create elements in 3 different spaces',
    type: 'universal',
    tier: 'silver',
    xp: 25,
    condition: (stats) => stats.spacesWithElements >= 3,
    icon: 'Explore',
  },

  architect: {
    id: 'architect',
    name: 'Architect',
    description: 'Create elements in all major spaces',
    type: 'universal',
    tier: 'gold',
    xp: 100,
    condition: (stats) => stats.spacesWithElements >= 10,
    icon: 'Architecture',
  },

  // Connection achievements
  connected_thinker: {
    id: 'connected_thinker',
    name: 'Connected Thinker',
    description: 'Create your first cross-space link',
    type: 'cross_space',
    tier: 'bronze',
    xp: 15,
    condition: (stats) => stats.crossSpaceLinks >= 1,
    icon: 'Link',
  },

  systems_thinker: {
    id: 'systems_thinker',
    name: 'Systems Thinker',
    description: 'Create 10 cross-space connections',
    type: 'cross_space',
    tier: 'silver',
    xp: 50,
    condition: (stats) => stats.crossSpaceLinks >= 10,
    icon: 'Hub',
  },

  master_integrator: {
    id: 'master_integrator',
    name: 'Master Integrator',
    description: 'Create connections between 5 different space pairs',
    type: 'cross_space',
    tier: 'gold',
    xp: 100,
    condition: (stats) => stats.uniqueSpacePairs >= 5,
    icon: 'AccountTree',
  },

  // Streak achievements
  consistent_practice: {
    id: 'consistent_practice',
    name: 'Consistent Practice',
    description: 'Use Ontographia for 7 consecutive days',
    type: 'streak',
    tier: 'silver',
    xp: 50,
    condition: (stats) => stats.currentStreak >= 7,
    icon: 'LocalFire',
  },

  dedicated_learner: {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Use Ontographia for 30 consecutive days',
    type: 'streak',
    tier: 'gold',
    xp: 150,
    condition: (stats) => stats.currentStreak >= 30,
    icon: 'Whatshot',
  },

  // Time-based
  focused_session: {
    id: 'focused_session',
    name: 'Focused Session',
    description: 'Work for 30 minutes in a single session',
    type: 'universal',
    tier: 'bronze',
    xp: 15,
    condition: (stats) => stats.longestSessionMinutes >= 30,
    icon: 'Timer',
  },

  deep_work: {
    id: 'deep_work',
    name: 'Deep Work',
    description: 'Work for 2 hours in a single session',
    type: 'universal',
    tier: 'silver',
    xp: 40,
    condition: (stats) => stats.longestSessionMinutes >= 120,
    icon: 'Psychology',
  },
};

// =============================================================================
// SPACE-SPECIFIC ACHIEVEMENTS
// =============================================================================

export const SPACE_ACHIEVEMENTS = {
  // BA (Business Analysis)
  ba: {
    traced_to_value: {
      id: 'ba_traced_to_value',
      name: 'Traced to Value',
      description: 'Create a complete trace from User Story to Business Requirement',
      type: 'space_specific',
      space: 'ba',
      tier: 'silver',
      xp: 30,
      condition: (stats) => stats.ba?.completeTraces >= 1,
      icon: 'AccountTree',
    },
    well_formed_requirement: {
      id: 'ba_well_formed',
      name: 'Well-Formed Requirement',
      description: 'Create a requirement with rationale and acceptance criteria',
      type: 'space_specific',
      space: 'ba',
      tier: 'bronze',
      xp: 20,
      condition: (stats) => stats.ba?.wellFormedRequirements >= 1,
      icon: 'CheckCircle',
    },
    stakeholder_mapper: {
      id: 'ba_stakeholder_mapper',
      name: 'Stakeholder Mapper',
      description: 'Identify and document 5 stakeholders with interests',
      type: 'space_specific',
      space: 'ba',
      tier: 'bronze',
      xp: 20,
      condition: (stats) => stats.ba?.stakeholders >= 5,
      icon: 'People',
    },
    requirements_master: {
      id: 'ba_requirements_master',
      name: 'Requirements Master',
      description: 'Create 25 requirements with full traceability',
      type: 'space_specific',
      space: 'ba',
      tier: 'gold',
      xp: 75,
      condition: (stats) => stats.ba?.tracedRequirements >= 25,
      icon: 'EmojiEvents',
    },
  },

  // EA (Enterprise Architecture)
  ea: {
    multi_layer_architect: {
      id: 'ea_multi_layer',
      name: 'Multi-Layer Architect',
      description: 'Create elements across Business, Application, and Technology layers',
      type: 'space_specific',
      space: 'ea',
      tier: 'silver',
      xp: 45,
      condition: (stats) => stats.ea?.layersCovered >= 3,
      icon: 'Layers',
    },
    capability_mapper: {
      id: 'ea_capability_mapper',
      name: 'Capability Mapper',
      description: 'Map 10 business capabilities',
      type: 'space_specific',
      space: 'ea',
      tier: 'bronze',
      xp: 25,
      condition: (stats) => stats.ea?.capabilities >= 10,
      icon: 'AccountBalance',
    },
    impact_analyst: {
      id: 'ea_impact_analyst',
      name: 'Impact Analyst',
      description: 'Trace relationships through 3 or more levels',
      type: 'space_specific',
      space: 'ea',
      tier: 'silver',
      xp: 30,
      condition: (stats) => stats.ea?.deepestTrace >= 3,
      icon: 'Troubleshoot',
    },
    enterprise_architect: {
      id: 'ea_enterprise_architect',
      name: 'Enterprise Architect',
      description: 'Create a complete architecture model with 50+ elements',
      type: 'space_specific',
      space: 'ea',
      tier: 'gold',
      xp: 100,
      condition: (stats) => stats.ea?.totalElements >= 50,
      icon: 'Architecture',
    },
  },

  // PDS (Project Design)
  pds: {
    full_coverage: {
      id: 'pds_full_coverage',
      name: 'Full Coverage',
      description: 'Create artefacts in all 5 project stages',
      type: 'space_specific',
      space: 'pds',
      tier: 'silver',
      xp: 40,
      condition: (stats) => stats.pds?.stagesCovered >= 5,
      icon: 'DoneAll',
    },
    risk_manager: {
      id: 'pds_risk_manager',
      name: 'Risk Manager',
      description: 'Successfully mitigate a documented risk',
      type: 'space_specific',
      space: 'pds',
      tier: 'bronze',
      xp: 25,
      condition: (stats) => stats.pds?.mitigatedRisks >= 1,
      icon: 'Shield',
    },
    stakeholder_engager: {
      id: 'pds_stakeholder_engager',
      name: 'Stakeholder Engager',
      description: 'Map 10 stakeholders with engagement strategies',
      type: 'space_specific',
      space: 'pds',
      tier: 'silver',
      xp: 30,
      condition: (stats) => stats.pds?.engagedStakeholders >= 10,
      icon: 'Groups',
    },
    lessons_learned: {
      id: 'pds_lessons_learned',
      name: 'Learning Culture',
      description: 'Capture 10 lessons learned',
      type: 'space_specific',
      space: 'pds',
      tier: 'silver',
      xp: 35,
      condition: (stats) => stats.pds?.lessons >= 10,
      icon: 'School',
    },
  },

  // SD (System Dynamics)
  sd: {
    loop_finder: {
      id: 'sd_loop_finder',
      name: 'Loop Finder',
      description: 'Identify your first feedback loop',
      type: 'space_specific',
      space: 'sd',
      tier: 'bronze',
      xp: 20,
      condition: (stats) => stats.sd?.feedbackLoops >= 1,
      icon: 'Loop',
    },
    balanced_modeler: {
      id: 'sd_balanced_modeler',
      name: 'Balanced Modeler',
      description: 'Create both reinforcing and balancing loops in a model',
      type: 'space_specific',
      space: 'sd',
      tier: 'silver',
      xp: 35,
      condition: (stats) => stats.sd?.hasBalancedModel,
      icon: 'Balance',
    },
    leverage_finder: {
      id: 'sd_leverage_finder',
      name: 'Leverage Finder',
      description: 'Identify leverage points in a system',
      type: 'space_specific',
      space: 'sd',
      tier: 'silver',
      xp: 40,
      condition: (stats) => stats.sd?.leveragePoints >= 3,
      icon: 'TrendingUp',
    },
  },

  // Portfolio
  portfolio: {
    prioritizer: {
      id: 'portfolio_prioritizer',
      name: 'Prioritizer',
      description: 'Score and rank 10 initiatives',
      type: 'space_specific',
      space: 'portfolio',
      tier: 'bronze',
      xp: 25,
      condition: (stats) => stats.portfolio?.scoredInitiatives >= 10,
      icon: 'Sort',
    },
    budget_master: {
      id: 'portfolio_budget_master',
      name: 'Budget Master',
      description: 'Allocate budget across portfolio items',
      type: 'space_specific',
      space: 'portfolio',
      tier: 'silver',
      xp: 35,
      condition: (stats) => stats.portfolio?.budgetAllocated,
      icon: 'AttachMoney',
    },
  },
};

// =============================================================================
// ACHIEVEMENT CHECKER
// =============================================================================

/**
 * Check all achievements against current stats
 * @param {Object} stats - User stats object
 * @param {Set} earnedAchievements - Already earned achievement IDs
 * @returns {Array} Newly earned achievements
 */
export function checkAchievements(stats, earnedAchievements = new Set()) {
  const newlyEarned = [];

  // Check universal achievements
  Object.values(UNIVERSAL_ACHIEVEMENTS).forEach(achievement => {
    if (!earnedAchievements.has(achievement.id) && achievement.condition(stats)) {
      newlyEarned.push(achievement);
    }
  });

  // Check space-specific achievements
  Object.values(SPACE_ACHIEVEMENTS).forEach(spaceAchievements => {
    Object.values(spaceAchievements).forEach(achievement => {
      if (!earnedAchievements.has(achievement.id) && achievement.condition(stats)) {
        newlyEarned.push(achievement);
      }
    });
  });

  return newlyEarned;
}

/**
 * Get all achievements for a specific space
 * @param {string} spaceId - Space identifier
 * @returns {Array} Space-specific achievements
 */
export function getSpaceAchievements(spaceId) {
  return Object.values(SPACE_ACHIEVEMENTS[spaceId] || {});
}

/**
 * Get all achievements
 * @returns {Array} All achievements
 */
export function getAllAchievements() {
  const all = [...Object.values(UNIVERSAL_ACHIEVEMENTS)];

  Object.values(SPACE_ACHIEVEMENTS).forEach(spaceAchievements => {
    all.push(...Object.values(spaceAchievements));
  });

  return all;
}

/**
 * Calculate total XP from achievements
 * @param {Set} earnedAchievements - Set of earned achievement IDs
 * @returns {number} Total XP
 */
export function calculateTotalXP(earnedAchievements) {
  const all = getAllAchievements();
  return all
    .filter(a => earnedAchievements.has(a.id))
    .reduce((total, a) => total + a.xp, 0);
}

/**
 * Get achievement progress for a specific achievement
 * @param {string} achievementId - Achievement ID
 * @param {Object} stats - User stats
 * @returns {Object} Progress object with current, target, percentage
 */
export function getAchievementProgress(achievementId, stats) {
  const achievement = getAllAchievements().find(a => a.id === achievementId);
  if (!achievement) return null;

  // This is a simplified version - real implementation would need
  // to extract numeric values from conditions
  return {
    achievement,
    earned: achievement.condition(stats),
  };
}

export default {
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_TIERS,
  UNIVERSAL_ACHIEVEMENTS,
  SPACE_ACHIEVEMENTS,
  checkAchievements,
  getSpaceAchievements,
  getAllAchievements,
  calculateTotalXP,
  getAchievementProgress,
};
