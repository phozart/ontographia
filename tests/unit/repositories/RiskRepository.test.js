/**
 * RiskRepository Unit Tests
 *
 * Tests for the Risk and Resilience data access layer.
 */

import {
  riskRepository,
  RiskRepository,
} from '../../../lib/repositories';

import {
  isRiskType,
  getRiskTypeDef,
  getRiskGuidance,
  calculateRiskScore,
  getRiskLevel,
  calculateRiskHealth,
  getRiskTypes,
  getCategories,
  getCategoryDef,
  RISK_TYPE_DEFS,
  RISK_CATEGORIES,
  RISK_LIKELIHOOD,
  RISK_IMPACT,
  RISK_STAGES,
  CONTROL_TYPES,
  CONTROL_EFFECTIVENESS,
  RESILIENCE_TYPES,
  RESILIENCE_MATURITY,
  RISK_GROUPS,
  RISK_GUIDANCE,
} from '../../../lib/risk-types';

// ============================================================================
// Repository Tests
// ============================================================================

describe('RiskRepository', () => {
  describe('Module exports', () => {
    test('exports singleton instance', () => {
      expect(riskRepository).toBeDefined();
      expect(riskRepository).toBeInstanceOf(RiskRepository);
    });

    test('exports class constructor', () => {
      expect(RiskRepository).toBeDefined();
      expect(typeof RiskRepository).toBe('function');
    });
  });

  describe('Repository methods', () => {
    test('has findByProject method', () => {
      expect(typeof riskRepository.findByProject).toBe('function');
    });

    test('has findByType method', () => {
      expect(typeof riskRepository.findByType).toBe('function');
    });

    test('has findRisksWithControls method', () => {
      expect(typeof riskRepository.findRisksWithControls).toBe('function');
    });

    test('has create method', () => {
      expect(typeof riskRepository.create).toBe('function');
    });

    test('has update method', () => {
      expect(typeof riskRepository.update).toBe('function');
    });

    test('has getStats method', () => {
      expect(typeof riskRepository.getStats).toBe('function');
    });

    test('has getRiskHeatMap method', () => {
      expect(typeof riskRepository.getRiskHeatMap).toBe('function');
    });

    test('has getControlEffectiveness method', () => {
      expect(typeof riskRepository.getControlEffectiveness).toBe('function');
    });

    test('has getResilienceMaturity method', () => {
      expect(typeof riskRepository.getResilienceMaturity).toBe('function');
    });

    test('has buildRiskRegister method', () => {
      expect(typeof riskRepository.buildRiskRegister).toBe('function');
    });

    test('has validateCompleteness method', () => {
      expect(typeof riskRepository.validateCompleteness).toBe('function');
    });

    test('has getDashboard method', () => {
      expect(typeof riskRepository.getDashboard).toBe('function');
    });
  });
});

// ============================================================================
// Type Definition Tests
// ============================================================================

describe('Risk Type Definitions', () => {
  describe('RISK_TYPE_DEFS', () => {
    test('defines risk_risk type', () => {
      expect(RISK_TYPE_DEFS.risk_risk).toBeDefined();
      expect(RISK_TYPE_DEFS.risk_risk.label).toBe('Risk');
      expect(RISK_TYPE_DEFS.risk_risk.color).toBe('#ef4444');
    });

    test('defines risk_control type', () => {
      expect(RISK_TYPE_DEFS.risk_control).toBeDefined();
      expect(RISK_TYPE_DEFS.risk_control.label).toBe('Control');
      expect(RISK_TYPE_DEFS.risk_control.color).toBe('#22c55e');
    });

    test('defines risk_scenario type', () => {
      expect(RISK_TYPE_DEFS.risk_scenario).toBeDefined();
      expect(RISK_TYPE_DEFS.risk_scenario.label).toBe('Scenario');
    });

    test('defines risk_resilience type', () => {
      expect(RISK_TYPE_DEFS.risk_resilience).toBeDefined();
      expect(RISK_TYPE_DEFS.risk_resilience.label).toBe('Resilience Measure');
    });

    test('defines risk_assessment type', () => {
      expect(RISK_TYPE_DEFS.risk_assessment).toBeDefined();
      expect(RISK_TYPE_DEFS.risk_assessment.label).toBe('Assessment');
    });

    test('all types have required fields', () => {
      Object.entries(RISK_TYPE_DEFS).forEach(([key, def]) => {
        expect(def.label).toBeDefined();
        expect(def.icon).toBeDefined();
        expect(def.color).toBeDefined();
        expect(def.description).toBeDefined();
        expect(Array.isArray(def.fields)).toBe(true);
      });
    });
  });

  describe('RISK_CATEGORIES', () => {
    test('defines all standard risk categories', () => {
      const expectedCategories = [
        'strategic', 'operational', 'financial', 'compliance',
        'technology', 'reputational', 'external'
      ];

      expectedCategories.forEach(cat => {
        expect(RISK_CATEGORIES[cat]).toBeDefined();
        expect(RISK_CATEGORIES[cat].label).toBeDefined();
        expect(RISK_CATEGORIES[cat].color).toBeDefined();
      });
    });
  });

  describe('RISK_LIKELIHOOD', () => {
    test('defines 5 likelihood levels', () => {
      expect(Object.keys(RISK_LIKELIHOOD)).toHaveLength(5);
    });

    test('likelihood values range from 1-5', () => {
      const values = Object.values(RISK_LIKELIHOOD).map(l => l.value);
      expect(Math.min(...values)).toBe(1);
      expect(Math.max(...values)).toBe(5);
    });
  });

  describe('RISK_IMPACT', () => {
    test('defines 5 impact levels', () => {
      expect(Object.keys(RISK_IMPACT)).toHaveLength(5);
    });

    test('impact values range from 1-5', () => {
      const values = Object.values(RISK_IMPACT).map(i => i.value);
      expect(Math.min(...values)).toBe(1);
      expect(Math.max(...values)).toBe(5);
    });
  });

  describe('RISK_STAGES', () => {
    test('defines all lifecycle stages', () => {
      const expectedStages = ['identified', 'analyzed', 'treated', 'monitored', 'closed'];
      expectedStages.forEach(stage => {
        expect(RISK_STAGES[stage]).toBeDefined();
        expect(RISK_STAGES[stage].label).toBeDefined();
        expect(RISK_STAGES[stage].order).toBeDefined();
      });
    });

    test('stages have correct order', () => {
      expect(RISK_STAGES.identified.order).toBe(1);
      expect(RISK_STAGES.closed.order).toBe(5);
    });
  });

  describe('CONTROL_TYPES', () => {
    test('defines all control types', () => {
      const expectedTypes = ['preventive', 'detective', 'corrective', 'directive'];
      expectedTypes.forEach(type => {
        expect(CONTROL_TYPES[type]).toBeDefined();
        expect(CONTROL_TYPES[type].label).toBeDefined();
      });
    });
  });

  describe('CONTROL_EFFECTIVENESS', () => {
    test('defines 4 effectiveness levels', () => {
      expect(Object.keys(CONTROL_EFFECTIVENESS)).toHaveLength(4);
    });

    test('effectiveness values range from 0-3', () => {
      const values = Object.values(CONTROL_EFFECTIVENESS).map(e => e.value);
      expect(Math.min(...values)).toBe(0);
      expect(Math.max(...values)).toBe(3);
    });
  });

  describe('RESILIENCE_TYPES', () => {
    test('defines all resilience types', () => {
      const expectedTypes = ['anticipate', 'prepare', 'respond', 'adapt'];
      expectedTypes.forEach(type => {
        expect(RESILIENCE_TYPES[type]).toBeDefined();
        expect(RESILIENCE_TYPES[type].label).toBeDefined();
      });
    });
  });

  describe('RESILIENCE_MATURITY', () => {
    test('defines 5 maturity levels', () => {
      expect(Object.keys(RESILIENCE_MATURITY)).toHaveLength(5);
    });

    test('maturity values range from 1-5', () => {
      const values = Object.values(RESILIENCE_MATURITY).map(m => m.value);
      expect(Math.min(...values)).toBe(1);
      expect(Math.max(...values)).toBe(5);
    });
  });

  describe('RISK_GROUPS', () => {
    test('defines all navigation groups', () => {
      expect(RISK_GROUPS.risks).toBeDefined();
      expect(RISK_GROUPS.scenarios).toBeDefined();
      expect(RISK_GROUPS.resilience).toBeDefined();
      expect(RISK_GROUPS.assessments).toBeDefined();
    });

    test('groups contain correct types', () => {
      expect(RISK_GROUPS.risks.types).toContain('risk_risk');
      expect(RISK_GROUPS.risks.types).toContain('risk_control');
      expect(RISK_GROUPS.scenarios.types).toContain('risk_scenario');
      expect(RISK_GROUPS.resilience.types).toContain('risk_resilience');
      expect(RISK_GROUPS.assessments.types).toContain('risk_assessment');
    });
  });

  describe('RISK_GUIDANCE', () => {
    test('provides guidance for all types', () => {
      Object.keys(RISK_TYPE_DEFS).forEach(type => {
        expect(RISK_GUIDANCE[type]).toBeDefined();
        expect(RISK_GUIDANCE[type].what).toBeDefined();
        expect(RISK_GUIDANCE[type].why).toBeDefined();
        expect(Array.isArray(RISK_GUIDANCE[type].examples)).toBe(true);
        expect(Array.isArray(RISK_GUIDANCE[type].prompts)).toBe(true);
      });
    });
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('Risk Utility Functions', () => {
  describe('isRiskType', () => {
    test('returns true for valid risk types', () => {
      expect(isRiskType('risk_risk')).toBe(true);
      expect(isRiskType('risk_control')).toBe(true);
      expect(isRiskType('risk_scenario')).toBe(true);
      expect(isRiskType('risk_resilience')).toBe(true);
      expect(isRiskType('risk_assessment')).toBe(true);
    });

    test('returns false for non-risk types', () => {
      expect(isRiskType('gov_policy')).toBe(false);
      expect(isRiskType('cap_capability')).toBe(false);
      expect(isRiskType('node')).toBe(false);
    });

    test('returns false for null/undefined', () => {
      expect(isRiskType(null)).toBeFalsy();
      expect(isRiskType(undefined)).toBeFalsy();
      expect(isRiskType('')).toBeFalsy();
    });
  });

  describe('getRiskTypeDef', () => {
    test('returns type definition for valid types', () => {
      const def = getRiskTypeDef('risk_risk');
      expect(def).toBeDefined();
      expect(def.label).toBe('Risk');
    });

    test('returns null for invalid types', () => {
      expect(getRiskTypeDef('invalid')).toBeNull();
      expect(getRiskTypeDef(null)).toBeNull();
    });
  });

  describe('getRiskGuidance', () => {
    test('returns guidance for valid types', () => {
      const guidance = getRiskGuidance('risk_risk');
      expect(guidance).toBeDefined();
      expect(guidance.what).toBeDefined();
    });

    test('returns null for invalid types', () => {
      expect(getRiskGuidance('invalid')).toBeNull();
    });
  });

  describe('calculateRiskScore', () => {
    test('calculates correct score', () => {
      expect(calculateRiskScore(1, 1)).toBe(1);
      expect(calculateRiskScore(3, 3)).toBe(9);
      expect(calculateRiskScore(5, 5)).toBe(25);
    });

    test('handles null/undefined values', () => {
      expect(calculateRiskScore(null, 3)).toBe(3);
      expect(calculateRiskScore(3, null)).toBe(3);
      expect(calculateRiskScore(null, null)).toBe(1);
    });
  });

  describe('getRiskLevel', () => {
    test('returns Very Low for scores 1-4', () => {
      expect(getRiskLevel(1).label).toBe('Very Low');
      expect(getRiskLevel(4).label).toBe('Very Low');
    });

    test('returns Low for scores 5-9', () => {
      expect(getRiskLevel(5).label).toBe('Low');
      expect(getRiskLevel(9).label).toBe('Low');
    });

    test('returns Medium for scores 10-14', () => {
      expect(getRiskLevel(10).label).toBe('Medium');
      expect(getRiskLevel(14).label).toBe('Medium');
    });

    test('returns High for scores 15-19', () => {
      expect(getRiskLevel(15).label).toBe('High');
      expect(getRiskLevel(19).label).toBe('High');
    });

    test('returns Critical for scores 20-25', () => {
      expect(getRiskLevel(20).label).toBe('Critical');
      expect(getRiskLevel(25).label).toBe('Critical');
    });

    test('returns appropriate colors', () => {
      expect(getRiskLevel(1).color).toBe('#22c55e');
      expect(getRiskLevel(25).color).toBe('#7f1d1d');
    });
  });

  describe('getRiskTypes', () => {
    test('returns array of all risk type keys', () => {
      const types = getRiskTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('risk_risk');
      expect(types).toContain('risk_control');
      expect(types).toContain('risk_scenario');
      expect(types).toContain('risk_resilience');
      expect(types).toContain('risk_assessment');
    });
  });

  describe('getCategories', () => {
    test('returns array with key and definition', () => {
      const categories = getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(Object.keys(RISK_CATEGORIES).length);

      categories.forEach(cat => {
        expect(cat.key).toBeDefined();
        expect(cat.label).toBeDefined();
        expect(cat.color).toBeDefined();
      });
    });
  });

  describe('getCategoryDef', () => {
    test('returns category definition for valid key', () => {
      const def = getCategoryDef('strategic');
      expect(def).toBeDefined();
      expect(def.label).toBe('Strategic');
    });

    test('returns null for invalid key', () => {
      expect(getCategoryDef('invalid')).toBeNull();
    });
  });

  describe('calculateRiskHealth', () => {
    test('returns 100 when no risks exist', () => {
      const stats = { totalRisks: 0 };
      expect(calculateRiskHealth(stats)).toBe(100);
    });

    test('returns 0 when stats is null', () => {
      expect(calculateRiskHealth(null)).toBe(0);
    });

    test('calculates health score based on coverage and effectiveness', () => {
      const stats = {
        totalRisks: 10,
        controlledRisks: 8,
        effectiveControls: 6,
        totalControls: 8,
        matureResilience: 4,
        totalResilience: 5,
      };

      const health = calculateRiskHealth(stats);
      expect(health).toBeGreaterThan(0);
      expect(health).toBeLessThanOrEqual(100);
    });

    test('weights control coverage at 40%', () => {
      const stats = {
        totalRisks: 10,
        controlledRisks: 10,
        effectiveControls: 0,
        totalControls: 0,
        matureResilience: 0,
        totalResilience: 0,
      };

      const health = calculateRiskHealth(stats);
      expect(health).toBe(40);
    });

    test('weights control effectiveness at 35%', () => {
      const stats = {
        totalRisks: 10,
        controlledRisks: 0,
        effectiveControls: 10,
        totalControls: 10,
        matureResilience: 0,
        totalResilience: 0,
      };

      const health = calculateRiskHealth(stats);
      expect(health).toBe(35);
    });

    test('weights resilience maturity at 25%', () => {
      const stats = {
        totalRisks: 10,
        controlledRisks: 0,
        effectiveControls: 0,
        totalControls: 0,
        matureResilience: 10,
        totalResilience: 10,
      };

      const health = calculateRiskHealth(stats);
      expect(health).toBe(25);
    });
  });
});
