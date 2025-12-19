// tests/unit/srs/srs-types.test.js
// Unit tests for SRS types and helper functions

import {
  SRS_SPACES,
  SPACE_ORDER,
  QUESTION_TYPES,
  QUESTION_MATURITY,
  FRAME_TYPES,
  STATE_TYPES,
  SYSTEM_NODE_TYPES,
  CAUSAL_POLARITIES,
  PERSPECTIVE_TYPES,
  REVERSIBILITY_LEVELS,
  READINESS_THRESHOLDS,
  CONNECTION_TYPES,
  COACHING_TRIGGERS,
  SESSION_MODES,
  SESSION_INTENTS,
  calculateReadinessScore,
  getReadinessLevel,
  getSuggestedNextSpace,
  detectCoachingTriggers,
} from '../../../lib/srs-types';

describe('SRS Types and Constants', () => {
  describe('SRS_SPACES', () => {
    it('should contain all 6 reasoning spaces', () => {
      expect(Object.keys(SRS_SPACES)).toHaveLength(6);
      expect(SRS_SPACES).toHaveProperty('questions');
      expect(SRS_SPACES).toHaveProperty('frames');
      expect(SRS_SPACES).toHaveProperty('parallel');
      expect(SRS_SPACES).toHaveProperty('systems');
      expect(SRS_SPACES).toHaveProperty('perspectives');
      expect(SRS_SPACES).toHaveProperty('decisions');
    });

    it('should have required properties for each space', () => {
      Object.values(SRS_SPACES).forEach(space => {
        expect(space).toHaveProperty('id');
        expect(space).toHaveProperty('name');
        expect(space).toHaveProperty('shortName');
        expect(space).toHaveProperty('color');
        expect(space).toHaveProperty('description');
        expect(space).toHaveProperty('order');
      });
    });

    it('should have unique order values', () => {
      const orders = Object.values(SRS_SPACES).map(s => s.order);
      const uniqueOrders = [...new Set(orders)];
      expect(uniqueOrders).toHaveLength(6);
    });
  });

  describe('SPACE_ORDER', () => {
    it('should contain all space keys in correct order', () => {
      expect(SPACE_ORDER).toHaveLength(6);
      expect(SPACE_ORDER[0]).toBe('questions');
      expect(SPACE_ORDER[5]).toBe('decisions');
    });

    it('should match SRS_SPACES keys', () => {
      const spaceKeys = Object.keys(SRS_SPACES);
      SPACE_ORDER.forEach(spaceId => {
        expect(spaceKeys).toContain(spaceId);
      });
    });
  });

  describe('QUESTION_TYPES', () => {
    it('should contain all question types', () => {
      expect(Object.keys(QUESTION_TYPES)).toHaveLength(5);
      expect(QUESTION_TYPES).toHaveProperty('clarifying');
      expect(QUESTION_TYPES).toHaveProperty('causal');
      expect(QUESTION_TYPES).toHaveProperty('evaluative');
      expect(QUESTION_TYPES).toHaveProperty('hypothetical');
      expect(QUESTION_TYPES).toHaveProperty('strategic');
    });

    it('should have required properties', () => {
      Object.values(QUESTION_TYPES).forEach(type => {
        expect(type).toHaveProperty('id');
        expect(type).toHaveProperty('name');
        expect(type).toHaveProperty('description');
        expect(type).toHaveProperty('color');
        expect(type).toHaveProperty('examples');
        expect(Array.isArray(type.examples)).toBe(true);
      });
    });
  });

  describe('QUESTION_MATURITY', () => {
    it('should contain all maturity levels', () => {
      expect(Object.keys(QUESTION_MATURITY)).toHaveLength(5);
      expect(QUESTION_MATURITY).toHaveProperty('surfaced');
      expect(QUESTION_MATURITY).toHaveProperty('exploring');
      expect(QUESTION_MATURITY).toHaveProperty('clarified');
      expect(QUESTION_MATURITY).toHaveProperty('answered');
      expect(QUESTION_MATURITY).toHaveProperty('parked');
    });

    it('should have sequential order values', () => {
      const orders = Object.values(QUESTION_MATURITY).map(m => m.order);
      expect(orders).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('FRAME_TYPES', () => {
    it('should contain all frame types', () => {
      expect(Object.keys(FRAME_TYPES).length).toBeGreaterThanOrEqual(5);
      expect(FRAME_TYPES).toHaveProperty('situation');
      expect(FRAME_TYPES).toHaveProperty('complication');
      expect(FRAME_TYPES).toHaveProperty('implication');
    });
  });

  describe('STATE_TYPES', () => {
    it('should contain scenario types', () => {
      expect(Object.keys(STATE_TYPES).length).toBeGreaterThanOrEqual(4);
      expect(STATE_TYPES).toHaveProperty('possible');
      expect(STATE_TYPES).toHaveProperty('probable');
      expect(STATE_TYPES).toHaveProperty('preferred');
      expect(STATE_TYPES).toHaveProperty('feared');
    });
  });

  describe('SYSTEM_NODE_TYPES', () => {
    it('should contain system node types', () => {
      expect(SYSTEM_NODE_TYPES).toHaveProperty('variable');
      expect(SYSTEM_NODE_TYPES).toHaveProperty('stock');
      expect(SYSTEM_NODE_TYPES).toHaveProperty('flow');
    });
  });

  describe('CAUSAL_POLARITIES', () => {
    it('should contain positive and negative polarities', () => {
      expect(Object.keys(CAUSAL_POLARITIES)).toHaveLength(2);
      expect(CAUSAL_POLARITIES).toHaveProperty('positive');
      expect(CAUSAL_POLARITIES).toHaveProperty('negative');
    });

    it('should have shortName for display', () => {
      expect(CAUSAL_POLARITIES.positive.shortName).toBe('+');
      expect(CAUSAL_POLARITIES.negative.shortName).toBe('−');
    });
  });

  describe('PERSPECTIVE_TYPES', () => {
    it('should contain perspective types', () => {
      expect(PERSPECTIVE_TYPES).toHaveProperty('stakeholder');
      expect(PERSPECTIVE_TYPES).toHaveProperty('role');
      expect(PERSPECTIVE_TYPES).toHaveProperty('archetype');
    });
  });

  describe('REVERSIBILITY_LEVELS', () => {
    it('should contain all reversibility levels', () => {
      expect(Object.keys(REVERSIBILITY_LEVELS)).toHaveLength(4);
      expect(REVERSIBILITY_LEVELS).toHaveProperty('easily_reversible');
      expect(REVERSIBILITY_LEVELS).toHaveProperty('reversible_with_cost');
      expect(REVERSIBILITY_LEVELS).toHaveProperty('difficult_to_reverse');
      expect(REVERSIBILITY_LEVELS).toHaveProperty('irreversible');
    });

    it('should have increasing risk factors', () => {
      expect(REVERSIBILITY_LEVELS.easily_reversible.riskFactor).toBeLessThan(
        REVERSIBILITY_LEVELS.reversible_with_cost.riskFactor
      );
      expect(REVERSIBILITY_LEVELS.reversible_with_cost.riskFactor).toBeLessThan(
        REVERSIBILITY_LEVELS.difficult_to_reverse.riskFactor
      );
      expect(REVERSIBILITY_LEVELS.difficult_to_reverse.riskFactor).toBeLessThan(
        REVERSIBILITY_LEVELS.irreversible.riskFactor
      );
    });
  });

  describe('READINESS_THRESHOLDS', () => {
    it('should contain all readiness levels', () => {
      expect(Object.keys(READINESS_THRESHOLDS)).toHaveLength(5);
      expect(READINESS_THRESHOLDS).toHaveProperty('not_ready');
      expect(READINESS_THRESHOLDS).toHaveProperty('needs_work');
      expect(READINESS_THRESHOLDS).toHaveProperty('approaching');
      expect(READINESS_THRESHOLDS).toHaveProperty('ready');
      expect(READINESS_THRESHOLDS).toHaveProperty('high_confidence');
    });

    it('should have non-overlapping ranges', () => {
      const thresholds = Object.values(READINESS_THRESHOLDS).sort((a, b) => a.min - b.min);
      for (let i = 0; i < thresholds.length - 1; i++) {
        expect(thresholds[i].max).toBeLessThanOrEqual(thresholds[i + 1].min);
      }
    });
  });

  describe('CONNECTION_TYPES', () => {
    it('should contain connection types', () => {
      expect(CONNECTION_TYPES).toHaveProperty('informs');
      expect(CONNECTION_TYPES).toHaveProperty('contradicts');
      expect(CONNECTION_TYPES).toHaveProperty('supports');
      expect(CONNECTION_TYPES).toHaveProperty('derived_from');
    });
  });

  describe('COACHING_TRIGGERS', () => {
    it('should contain triggers for each space', () => {
      const spaces = new Set(Object.values(COACHING_TRIGGERS).map(t => t.space));
      expect(spaces.has('questions')).toBe(true);
      expect(spaces.has('frames')).toBe(true);
      expect(spaces.has('parallel')).toBe(true);
      expect(spaces.has('systems')).toBe(true);
      expect(spaces.has('perspectives')).toBe(true);
      expect(spaces.has('decisions')).toBe(true);
    });

    it('should have required properties for each trigger', () => {
      Object.values(COACHING_TRIGGERS).forEach(trigger => {
        expect(trigger).toHaveProperty('id');
        expect(trigger).toHaveProperty('space');
        expect(trigger).toHaveProperty('condition');
        expect(trigger).toHaveProperty('message');
        expect(trigger).toHaveProperty('suggestedAction');
        expect(trigger).toHaveProperty('severity');
      });
    });
  });

  describe('SESSION_MODES', () => {
    it('should contain session modes', () => {
      expect(SESSION_MODES).toHaveProperty('solo');
      expect(SESSION_MODES).toHaveProperty('collaborative');
      expect(SESSION_MODES).toHaveProperty('facilitated');
    });

    it('should have maxParticipants for each mode', () => {
      expect(SESSION_MODES.solo.maxParticipants).toBe(1);
      expect(SESSION_MODES.collaborative.maxParticipants).toBeGreaterThan(1);
      expect(SESSION_MODES.facilitated.maxParticipants).toBeGreaterThan(
        SESSION_MODES.collaborative.maxParticipants
      );
    });
  });

  describe('SESSION_INTENTS', () => {
    it('should contain all intents', () => {
      expect(Object.keys(SESSION_INTENTS)).toHaveLength(5);
      expect(SESSION_INTENTS).toHaveProperty('understand');
      expect(SESSION_INTENTS).toHaveProperty('decide');
      expect(SESSION_INTENTS).toHaveProperty('explain');
      expect(SESSION_INTENTS).toHaveProperty('explore');
      expect(SESSION_INTENTS).toHaveProperty('analyze');
    });

    it('should have suggestedStartSpace for each intent', () => {
      Object.values(SESSION_INTENTS).forEach(intent => {
        expect(intent).toHaveProperty('suggestedStartSpace');
        expect(SPACE_ORDER).toContain(intent.suggestedStartSpace);
      });
    });
  });
});

describe('SRS Helper Functions', () => {
  describe('calculateReadinessScore', () => {
    it('should return 0 for null/undefined input', () => {
      expect(calculateReadinessScore(null)).toBe(0);
      expect(calculateReadinessScore(undefined)).toBe(0);
    });

    it('should return base score for empty decision', () => {
      // Empty decision has no unknowns or assumptions to penalize, so gets partial score
      const score = calculateReadinessScore({});
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should increase score with more knows', () => {
      const decision1 = { knows: [{ text: 'k1' }] };
      const decision2 = { knows: [{ text: 'k1' }, { text: 'k2' }, { text: 'k3' }] };

      expect(calculateReadinessScore(decision2)).toBeGreaterThan(
        calculateReadinessScore(decision1)
      );
    });

    it('should decrease score with more unresolved unknowns', () => {
      const decision1 = { unknowns: [] };
      const decision2 = { unknowns: [
        { text: 'u1', resolved: false },
        { text: 'u2', resolved: false },
        { text: 'u3', resolved: false },
      ]};

      expect(calculateReadinessScore(decision1)).toBeGreaterThan(
        calculateReadinessScore(decision2)
      );
    });

    it('should not penalize resolved unknowns', () => {
      const decision1 = { unknowns: [{ text: 'u1', resolved: true }] };
      const decision2 = { unknowns: [{ text: 'u1', resolved: false }] };

      expect(calculateReadinessScore(decision1)).toBeGreaterThan(
        calculateReadinessScore(decision2)
      );
    });

    it('should decrease score with more unvalidated assumptions', () => {
      const decision1 = { assumptions: [] };
      const decision2 = { assumptions: [
        { text: 'a1', validated: false },
        { text: 'a2', validated: false },
      ]};

      expect(calculateReadinessScore(decision1)).toBeGreaterThan(
        calculateReadinessScore(decision2)
      );
    });

    it('should increase score with more criteria met', () => {
      const decision1 = { criteria: [{ name: 'c1', met: false }] };
      const decision2 = { criteria: [{ name: 'c1', met: true }] };

      expect(calculateReadinessScore(decision2)).toBeGreaterThan(
        calculateReadinessScore(decision1)
      );
    });

    it('should return a score between 0 and 1', () => {
      const decision = {
        knows: [{ text: 'k1' }, { text: 'k2' }],
        unknowns: [{ text: 'u1', resolved: false }],
        assumptions: [{ text: 'a1', validated: false }],
        criteria: [{ name: 'c1', met: true }],
      };

      const score = calculateReadinessScore(decision);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('getReadinessLevel', () => {
    it('should return not_ready for low scores', () => {
      const result = getReadinessLevel(0.1);
      expect(result.key).toBe('not_ready');
    });

    it('should return needs_work for scores 0.3-0.5', () => {
      const result = getReadinessLevel(0.4);
      expect(result.key).toBe('needs_work');
    });

    it('should return approaching for scores 0.5-0.7', () => {
      const result = getReadinessLevel(0.6);
      expect(result.key).toBe('approaching');
    });

    it('should return ready for scores 0.7-0.85', () => {
      const result = getReadinessLevel(0.8);
      expect(result.key).toBe('ready');
    });

    it('should return high_confidence for scores >= 0.85', () => {
      const result = getReadinessLevel(0.9);
      expect(result.key).toBe('high_confidence');
    });

    it('should include label, color, and guidance', () => {
      const result = getReadinessLevel(0.5);
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('guidance');
    });
  });

  describe('getSuggestedNextSpace', () => {
    it('should suggest questions for new sessions without intent', () => {
      const sessionState = {
        currentSpace: 'questions',
        spaceCounts: {},
      };
      const result = getSuggestedNextSpace(sessionState);
      expect(result).toBe('questions');
    });

    it('should suggest intent-based start space for new sessions', () => {
      const sessionState = {
        currentSpace: 'questions',
        spaceCounts: {},
        intent: 'analyze',
      };
      const result = getSuggestedNextSpace(sessionState);
      expect(result).toBe('systems');
    });

    it('should suggest frames after having many questions', () => {
      const sessionState = {
        currentSpace: 'questions',
        spaceCounts: { questions: 5 },
      };
      const result = getSuggestedNextSpace(sessionState);
      expect(result.space).toBe('frames');
    });

    it('should suggest perspectives after framing', () => {
      const sessionState = {
        currentSpace: 'frames',
        spaceCounts: { questions: 5, frames: 2 },
      };
      const result = getSuggestedNextSpace(sessionState);
      expect(result.space).toBe('perspectives');
    });

    it('should include a reason for suggestion', () => {
      const sessionState = {
        currentSpace: 'questions',
        spaceCounts: { questions: 5 },
      };
      const result = getSuggestedNextSpace(sessionState);
      expect(result).toHaveProperty('reason');
      expect(typeof result.reason).toBe('string');
    });
  });

  describe('detectCoachingTriggers', () => {
    it('should return empty array for empty session', () => {
      const sessionState = { currentSpace: 'questions', spaceCounts: {} };
      const elements = { questions: [] };
      const triggers = detectCoachingTriggers(sessionState, elements);
      expect(triggers).toEqual([]);
    });

    it('should detect many_unanswered when more than 10 surfaced questions', () => {
      const sessionState = { currentSpace: 'questions', spaceCounts: {} };
      const questions = Array(12).fill(null).map((_, i) => ({
        id: `q${i}`,
        maturity: 'surfaced',
        question_type: 'clarifying',
      }));
      const elements = { questions };

      const triggers = detectCoachingTriggers(sessionState, elements);
      const hasManyUnanswered = triggers.some(t => t.id === 'many_unanswered');
      expect(hasManyUnanswered).toBe(true);
    });

    it('should detect all_same_type when all questions are same type', () => {
      const sessionState = { currentSpace: 'questions', spaceCounts: {} };
      const questions = Array(5).fill(null).map((_, i) => ({
        id: `q${i}`,
        maturity: 'exploring',
        question_type: 'clarifying',
      }));
      const elements = { questions };

      const triggers = detectCoachingTriggers(sessionState, elements);
      const hasAllSameType = triggers.some(t => t.id === 'all_same_type');
      expect(hasAllSameType).toBe(true);
    });

    it('should not trigger all_same_type with varied question types', () => {
      const sessionState = { currentSpace: 'questions', spaceCounts: {} };
      const questions = [
        { id: 'q1', maturity: 'exploring', question_type: 'clarifying' },
        { id: 'q2', maturity: 'exploring', question_type: 'causal' },
        { id: 'q3', maturity: 'exploring', question_type: 'strategic' },
      ];
      const elements = { questions };

      const triggers = detectCoachingTriggers(sessionState, elements);
      const hasAllSameType = triggers.some(t => t.id === 'all_same_type');
      expect(hasAllSameType).toBe(false);
    });

    it('should detect no_strategic_questions after 30 minutes', () => {
      const sessionState = {
        currentSpace: 'questions',
        spaceCounts: {},
        sessionDurationMinutes: 35,
      };
      const questions = Array(6).fill(null).map((_, i) => ({
        id: `q${i}`,
        maturity: 'exploring',
        question_type: 'clarifying',
      }));
      const elements = { questions };

      const triggers = detectCoachingTriggers(sessionState, elements);
      const hasNoStrategic = triggers.some(t => t.id === 'no_strategic_questions');
      expect(hasNoStrategic).toBe(true);
    });
  });
});
