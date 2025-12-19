// tests/pds/pds-types.test.js
// Unit tests for PDS types and helper functions

import {
  PDS_STAGES,
  PDS_STAGE_INFO,
  PDS_PROJECT_STATUS,
  PDS_PROJECT_HEALTH,
  PDS_STATUS_INFO,
  PDS_HEALTH_INFO,
  PDS_ARTEFACT_TYPES,
  PDS_RELATIONSHIP_TYPES,
  getArtefactTypesByStage,
  getAllArtefactTypeIds,
  getStageForType,
  calculateRiskExposure,
  getEngagementStrategy,
  validateSRSReadiness,
  getDefaultValues,
} from '../../lib/pds-types';

describe('PDS Types and Constants', () => {
  describe('PDS_STAGES', () => {
    it('should contain all 5 core stages', () => {
      expect(Object.keys(PDS_STAGES)).toHaveLength(5);
      expect(PDS_STAGES).toHaveProperty('INTENT');
      expect(PDS_STAGES).toHaveProperty('STRUCTURE');
      expect(PDS_STAGES).toHaveProperty('UNCERTAINTY');
      expect(PDS_STAGES).toHaveProperty('CONTROL');
      expect(PDS_STAGES).toHaveProperty('LEARNING');
    });

    it('should have string values for each stage', () => {
      expect(PDS_STAGES.INTENT).toBe('intent');
      expect(PDS_STAGES.STRUCTURE).toBe('structure');
      expect(PDS_STAGES.UNCERTAINTY).toBe('uncertainty');
      expect(PDS_STAGES.CONTROL).toBe('control');
      expect(PDS_STAGES.LEARNING).toBe('learning');
    });
  });

  describe('PDS_STAGE_INFO', () => {
    it('should have info for all stages', () => {
      expect(Object.keys(PDS_STAGE_INFO)).toHaveLength(5);
    });

    it('should have required properties for each stage', () => {
      Object.values(PDS_STAGE_INFO).forEach(stage => {
        expect(stage).toHaveProperty('id');
        expect(stage).toHaveProperty('name');
        expect(stage).toHaveProperty('shortName');
        expect(stage).toHaveProperty('description');
        expect(stage).toHaveProperty('keyQuestions');
        expect(stage).toHaveProperty('color');
        expect(stage).toHaveProperty('icon');
        expect(Array.isArray(stage.keyQuestions)).toBe(true);
        expect(stage.keyQuestions.length).toBeGreaterThan(0);
      });
    });

    it('should have valid color hex codes', () => {
      Object.values(PDS_STAGE_INFO).forEach(stage => {
        expect(stage.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('PDS_PROJECT_STATUS', () => {
    it('should contain all project statuses', () => {
      expect(Object.keys(PDS_PROJECT_STATUS)).toHaveLength(9);
      expect(PDS_PROJECT_STATUS).toHaveProperty('DRAFT');
      expect(PDS_PROJECT_STATUS).toHaveProperty('INITIATING');
      expect(PDS_PROJECT_STATUS).toHaveProperty('PLANNING');
      expect(PDS_PROJECT_STATUS).toHaveProperty('EXECUTING');
      expect(PDS_PROJECT_STATUS).toHaveProperty('MONITORING');
      expect(PDS_PROJECT_STATUS).toHaveProperty('CLOSING');
      expect(PDS_PROJECT_STATUS).toHaveProperty('CLOSED');
      expect(PDS_PROJECT_STATUS).toHaveProperty('ON_HOLD');
      expect(PDS_PROJECT_STATUS).toHaveProperty('CANCELLED');
    });
  });

  describe('PDS_PROJECT_HEALTH', () => {
    it('should contain all health values', () => {
      expect(Object.keys(PDS_PROJECT_HEALTH)).toHaveLength(4);
      expect(PDS_PROJECT_HEALTH).toHaveProperty('GREEN');
      expect(PDS_PROJECT_HEALTH).toHaveProperty('AMBER');
      expect(PDS_PROJECT_HEALTH).toHaveProperty('RED');
      expect(PDS_PROJECT_HEALTH).toHaveProperty('UNKNOWN');
    });
  });

  describe('PDS_STATUS_INFO', () => {
    it('should have info for all statuses', () => {
      const statusValues = Object.values(PDS_PROJECT_STATUS);
      statusValues.forEach(status => {
        expect(PDS_STATUS_INFO[status]).toBeDefined();
        expect(PDS_STATUS_INFO[status]).toHaveProperty('label');
        expect(PDS_STATUS_INFO[status]).toHaveProperty('color');
      });
    });
  });

  describe('PDS_HEALTH_INFO', () => {
    it('should have info for all health values', () => {
      const healthValues = Object.values(PDS_PROJECT_HEALTH);
      healthValues.forEach(health => {
        expect(PDS_HEALTH_INFO[health]).toBeDefined();
        expect(PDS_HEALTH_INFO[health]).toHaveProperty('label');
        expect(PDS_HEALTH_INFO[health]).toHaveProperty('color');
        expect(PDS_HEALTH_INFO[health]).toHaveProperty('icon');
      });
    });
  });

  describe('PDS_ARTEFACT_TYPES', () => {
    it('should contain artefact types for all stages', () => {
      const stages = new Set(Object.values(PDS_ARTEFACT_TYPES).map(t => t.stage));
      expect(stages.has('intent')).toBe(true);
      expect(stages.has('structure')).toBe(true);
      expect(stages.has('uncertainty')).toBe(true);
      expect(stages.has('control')).toBe(true);
      expect(stages.has('learning')).toBe(true);
    });

    it('should have required properties for each type', () => {
      Object.values(PDS_ARTEFACT_TYPES).forEach(type => {
        expect(type).toHaveProperty('id');
        expect(type).toHaveProperty('name');
        expect(type).toHaveProperty('description');
        expect(type).toHaveProperty('stage');
        expect(type).toHaveProperty('icon');
        expect(type).toHaveProperty('color');
        expect(type).toHaveProperty('fields');
        expect(typeof type.fields).toBe('object');
      });
    });

    it('should have valid field definitions', () => {
      Object.values(PDS_ARTEFACT_TYPES).forEach(type => {
        Object.entries(type.fields).forEach(([fieldName, field]) => {
          expect(field).toHaveProperty('type');
          expect(field).toHaveProperty('label');
          expect(typeof field.type).toBe('string');
        });
      });
    });

    it('should have at least one required field per type', () => {
      Object.values(PDS_ARTEFACT_TYPES).forEach(type => {
        const hasRequired = Object.values(type.fields).some(f => f.required === true);
        expect(hasRequired).toBe(true);
      });
    });

    describe('Stage 1: Intent & Governance types', () => {
      it('should include pds_project', () => {
        expect(PDS_ARTEFACT_TYPES.pds_project).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_project.stage).toBe('intent');
        expect(PDS_ARTEFACT_TYPES.pds_project.fields.title.required).toBe(true);
        expect(PDS_ARTEFACT_TYPES.pds_project.fields.vision.required).toBe(true);
      });

      it('should include pds_stakeholder', () => {
        expect(PDS_ARTEFACT_TYPES.pds_stakeholder).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_stakeholder.stage).toBe('intent');
        expect(PDS_ARTEFACT_TYPES.pds_stakeholder.fields.influence.options).toContain('high');
        expect(PDS_ARTEFACT_TYPES.pds_stakeholder.fields.interest.options).toContain('high');
      });

      it('should include pds_governance_gate', () => {
        expect(PDS_ARTEFACT_TYPES.pds_governance_gate).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_governance_gate.stage).toBe('intent');
        expect(PDS_ARTEFACT_TYPES.pds_governance_gate.fields.outcome.options).toContain('approved');
      });

      it('should include pds_business_case', () => {
        expect(PDS_ARTEFACT_TYPES.pds_business_case).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_business_case.stage).toBe('intent');
      });

      it('should include pds_success_measure', () => {
        expect(PDS_ARTEFACT_TYPES.pds_success_measure).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_success_measure.stage).toBe('intent');
      });
    });

    describe('Stage 2: Structure & Planning types', () => {
      it('should include pds_deliverable', () => {
        expect(PDS_ARTEFACT_TYPES.pds_deliverable).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_deliverable.stage).toBe('structure');
        expect(PDS_ARTEFACT_TYPES.pds_deliverable.fields.progress.max).toBe(100);
      });

      it('should include pds_milestone', () => {
        expect(PDS_ARTEFACT_TYPES.pds_milestone).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_milestone.stage).toBe('structure');
      });

      it('should include pds_work_package', () => {
        expect(PDS_ARTEFACT_TYPES.pds_work_package).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_work_package.stage).toBe('structure');
      });

      it('should include pds_dependency', () => {
        expect(PDS_ARTEFACT_TYPES.pds_dependency).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_dependency.stage).toBe('structure');
        expect(PDS_ARTEFACT_TYPES.pds_dependency.fields.type.options).toContain('finish_to_start');
      });

      it('should include pds_resource_need', () => {
        expect(PDS_ARTEFACT_TYPES.pds_resource_need).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_resource_need.stage).toBe('structure');
      });
    });

    describe('Stage 3: Risk & Uncertainty types', () => {
      it('should include pds_risk', () => {
        expect(PDS_ARTEFACT_TYPES.pds_risk).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_risk.stage).toBe('uncertainty');
        expect(PDS_ARTEFACT_TYPES.pds_risk.fields.probability.options).toContain('very_high');
        expect(PDS_ARTEFACT_TYPES.pds_risk.fields.impact.options).toContain('very_high');
        expect(PDS_ARTEFACT_TYPES.pds_risk.fields.response_strategy.options).toContain('mitigate');
      });

      it('should include pds_assumption', () => {
        expect(PDS_ARTEFACT_TYPES.pds_assumption).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_assumption.stage).toBe('uncertainty');
        expect(PDS_ARTEFACT_TYPES.pds_assumption.fields.status.options).toContain('validated');
      });

      it('should include pds_issue', () => {
        expect(PDS_ARTEFACT_TYPES.pds_issue).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_issue.stage).toBe('uncertainty');
      });

      it('should include pds_constraint', () => {
        expect(PDS_ARTEFACT_TYPES.pds_constraint).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_constraint.stage).toBe('uncertainty');
      });

      it('should include pds_contingency', () => {
        expect(PDS_ARTEFACT_TYPES.pds_contingency).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_contingency.stage).toBe('uncertainty');
      });
    });

    describe('Stage 4: Execution & Control types', () => {
      it('should include pds_status_update', () => {
        expect(PDS_ARTEFACT_TYPES.pds_status_update).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_status_update.stage).toBe('control');
      });

      it('should include pds_change_request', () => {
        expect(PDS_ARTEFACT_TYPES.pds_change_request).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_change_request.stage).toBe('control');
        expect(PDS_ARTEFACT_TYPES.pds_change_request.fields.decision.options).toContain('approved');
      });

      it('should include pds_decision', () => {
        expect(PDS_ARTEFACT_TYPES.pds_decision).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_decision.stage).toBe('control');
        expect(PDS_ARTEFACT_TYPES.pds_decision.fields.reversibility.options).toContain('irreversible');
      });

      it('should include pds_exception', () => {
        expect(PDS_ARTEFACT_TYPES.pds_exception).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_exception.stage).toBe('control');
      });

      it('should include pds_progress_measure', () => {
        expect(PDS_ARTEFACT_TYPES.pds_progress_measure).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_progress_measure.stage).toBe('control');
      });
    });

    describe('Stage 5: Learning & Evolution types', () => {
      it('should include pds_lesson', () => {
        expect(PDS_ARTEFACT_TYPES.pds_lesson).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_lesson.stage).toBe('learning');
      });

      it('should include pds_retrospective', () => {
        expect(PDS_ARTEFACT_TYPES.pds_retrospective).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_retrospective.stage).toBe('learning');
      });

      it('should include pds_benefit_realization', () => {
        expect(PDS_ARTEFACT_TYPES.pds_benefit_realization).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_benefit_realization.stage).toBe('learning');
      });

      it('should include pds_closure_item', () => {
        expect(PDS_ARTEFACT_TYPES.pds_closure_item).toBeDefined();
        expect(PDS_ARTEFACT_TYPES.pds_closure_item.stage).toBe('learning');
      });
    });
  });

  describe('PDS_RELATIONSHIP_TYPES', () => {
    it('should contain relationship types', () => {
      expect(Object.keys(PDS_RELATIONSHIP_TYPES).length).toBeGreaterThan(5);
    });

    it('should have required properties for each relationship', () => {
      Object.values(PDS_RELATIONSHIP_TYPES).forEach(rel => {
        expect(rel).toHaveProperty('id');
        expect(rel).toHaveProperty('name');
        expect(rel).toHaveProperty('description');
        expect(rel).toHaveProperty('fromType');
        expect(rel).toHaveProperty('toType');
      });
    });

    it('should include SRS integration relationship', () => {
      expect(PDS_RELATIONSHIP_TYPES.originated_from).toBeDefined();
      expect(PDS_RELATIONSHIP_TYPES.originated_from.fromType).toBe('pds_project');
      expect(PDS_RELATIONSHIP_TYPES.originated_from.toType).toBe('srs_decision');
    });

    it('should include governance relationship', () => {
      expect(PDS_RELATIONSHIP_TYPES.governs).toBeDefined();
      expect(PDS_RELATIONSHIP_TYPES.governs.fromType).toBe('pds_governance_gate');
    });

    it('should include dependency relationship', () => {
      expect(PDS_RELATIONSHIP_TYPES.depends_on).toBeDefined();
      expect(PDS_RELATIONSHIP_TYPES.depends_on.fromType).toBe('pds_deliverable');
      expect(PDS_RELATIONSHIP_TYPES.depends_on.toType).toBe('pds_deliverable');
    });

    it('should include risk-related relationships', () => {
      expect(PDS_RELATIONSHIP_TYPES.mitigates).toBeDefined();
      expect(PDS_RELATIONSHIP_TYPES.validates).toBeDefined();
      expect(PDS_RELATIONSHIP_TYPES.raised_from).toBeDefined();
    });
  });
});

describe('PDS Helper Functions', () => {
  describe('getArtefactTypesByStage', () => {
    it('should return types for intent stage', () => {
      const types = getArtefactTypesByStage('intent');
      expect(types.length).toBeGreaterThan(0);
      types.forEach(t => expect(t.stage).toBe('intent'));
      expect(types.some(t => t.id === 'pds_project')).toBe(true);
      expect(types.some(t => t.id === 'pds_stakeholder')).toBe(true);
    });

    it('should return types for structure stage', () => {
      const types = getArtefactTypesByStage('structure');
      expect(types.length).toBeGreaterThan(0);
      types.forEach(t => expect(t.stage).toBe('structure'));
      expect(types.some(t => t.id === 'pds_deliverable')).toBe(true);
    });

    it('should return types for uncertainty stage', () => {
      const types = getArtefactTypesByStage('uncertainty');
      expect(types.length).toBeGreaterThan(0);
      types.forEach(t => expect(t.stage).toBe('uncertainty'));
      expect(types.some(t => t.id === 'pds_risk')).toBe(true);
    });

    it('should return types for control stage', () => {
      const types = getArtefactTypesByStage('control');
      expect(types.length).toBeGreaterThan(0);
      types.forEach(t => expect(t.stage).toBe('control'));
      expect(types.some(t => t.id === 'pds_status_update')).toBe(true);
    });

    it('should return types for learning stage', () => {
      const types = getArtefactTypesByStage('learning');
      expect(types.length).toBeGreaterThan(0);
      types.forEach(t => expect(t.stage).toBe('learning'));
      expect(types.some(t => t.id === 'pds_lesson')).toBe(true);
    });

    it('should return empty array for invalid stage', () => {
      const types = getArtefactTypesByStage('invalid');
      expect(types).toEqual([]);
    });
  });

  describe('getAllArtefactTypeIds', () => {
    it('should return all artefact type IDs', () => {
      const ids = getAllArtefactTypeIds();
      expect(ids.length).toBeGreaterThan(15);
      expect(ids).toContain('pds_project');
      expect(ids).toContain('pds_risk');
      expect(ids).toContain('pds_lesson');
    });

    it('should return IDs that all start with pds_', () => {
      const ids = getAllArtefactTypeIds();
      ids.forEach(id => expect(id.startsWith('pds_')).toBe(true));
    });
  });

  describe('getStageForType', () => {
    it('should return stage info for valid type', () => {
      const stage = getStageForType('pds_project');
      expect(stage).toBeDefined();
      expect(stage.id).toBe('intent');
      expect(stage.name).toBe('Intent & Governance');
    });

    it('should return stage info for risk type', () => {
      const stage = getStageForType('pds_risk');
      expect(stage).toBeDefined();
      expect(stage.id).toBe('uncertainty');
    });

    it('should return null for invalid type', () => {
      const stage = getStageForType('invalid_type');
      expect(stage).toBeNull();
    });
  });

  describe('calculateRiskExposure', () => {
    it('should return low for very_low probability and impact', () => {
      expect(calculateRiskExposure('very_low', 'very_low')).toBe('low');
    });

    it('should return low for low probability and low impact', () => {
      expect(calculateRiskExposure('low', 'low')).toBe('low');
    });

    it('should return moderate for medium probability and medium impact', () => {
      expect(calculateRiskExposure('medium', 'medium')).toBe('moderate');
    });

    it('should return high for high probability and high impact', () => {
      expect(calculateRiskExposure('high', 'high')).toBe('high');
    });

    it('should return critical for very_high probability and very_high impact', () => {
      expect(calculateRiskExposure('very_high', 'very_high')).toBe('critical');
    });

    it('should handle mixed values correctly', () => {
      // very_high (5) * low (2) = 10, which is high (9-16)
      expect(calculateRiskExposure('very_high', 'low')).toBe('high');
      // low (2) * very_high (5) = 10, which is high (9-16)
      expect(calculateRiskExposure('low', 'very_high')).toBe('high');
      // high (4) * very_high (5) = 20, which is critical (>16)
      expect(calculateRiskExposure('high', 'very_high')).toBe('critical');
      // medium (3) * low (2) = 6, which is moderate (5-9)
      expect(calculateRiskExposure('medium', 'low')).toBe('moderate');
    });

    it('should return moderate for invalid values (defaults to medium)', () => {
      expect(calculateRiskExposure('invalid', 'invalid')).toBe('moderate');
    });
  });

  describe('getEngagementStrategy', () => {
    it('should return manage_closely for high influence and high interest', () => {
      expect(getEngagementStrategy('high', 'high')).toBe('manage_closely');
    });

    it('should return keep_satisfied for high influence and low interest', () => {
      expect(getEngagementStrategy('high', 'low')).toBe('keep_satisfied');
      expect(getEngagementStrategy('high', 'medium')).toBe('keep_satisfied');
    });

    it('should return keep_informed for low influence and high interest', () => {
      expect(getEngagementStrategy('low', 'high')).toBe('keep_informed');
      expect(getEngagementStrategy('medium', 'high')).toBe('keep_informed');
    });

    it('should return monitor for low influence and low interest', () => {
      expect(getEngagementStrategy('low', 'low')).toBe('monitor');
      expect(getEngagementStrategy('low', 'medium')).toBe('monitor');
      expect(getEngagementStrategy('medium', 'low')).toBe('monitor');
      expect(getEngagementStrategy('medium', 'medium')).toBe('monitor');
    });
  });

  describe('validateSRSReadiness', () => {
    it('should return invalid for null decision', () => {
      const result = validateSRSReadiness(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('No SRS decision');
    });

    it('should return invalid for undefined decision', () => {
      const result = validateSRSReadiness(undefined);
      expect(result.valid).toBe(false);
    });

    it('should return invalid for non-decided status', () => {
      const decision = {
        status: 'draft',
        custom_fields: { readiness_score: 80, alternatives: ['a', 'b', 'c'] },
      };
      const result = validateSRSReadiness(decision);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('decided');
    });

    it('should return invalid for low readiness score', () => {
      const decision = {
        status: 'decided',
        custom_fields: { readiness_score: 50, alternatives: ['a', 'b', 'c'] },
      };
      const result = validateSRSReadiness(decision);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('70%');
    });

    it('should return invalid for fewer than 3 alternatives', () => {
      const decision = {
        status: 'decided',
        custom_fields: { readiness_score: 80, alternatives: ['a', 'b'] },
      };
      const result = validateSRSReadiness(decision);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('3 alternatives');
    });

    it('should return valid for proper decision', () => {
      const decision = {
        status: 'decided',
        custom_fields: { readiness_score: 80, alternatives: ['a', 'b', 'c'] },
      };
      const result = validateSRSReadiness(decision);
      expect(result.valid).toBe(true);
    });

    it('should return valid for exactly 70% readiness', () => {
      const decision = {
        status: 'decided',
        custom_fields: { readiness_score: 70, alternatives: ['a', 'b', 'c', 'd'] },
      };
      const result = validateSRSReadiness(decision);
      expect(result.valid).toBe(true);
    });
  });

  describe('getDefaultValues', () => {
    it('should return default values for pds_project', () => {
      const defaults = getDefaultValues('pds_project');
      expect(defaults.status).toBe('draft');
      expect(defaults.health).toBe('unknown');
    });

    it('should return default values for pds_risk', () => {
      const defaults = getDefaultValues('pds_risk');
      expect(defaults.probability).toBe('medium');
      expect(defaults.impact).toBe('medium');
      expect(defaults.status).toBe('identified');
      expect(defaults.is_opportunity).toBe(false);
    });

    it('should return default values for pds_deliverable', () => {
      const defaults = getDefaultValues('pds_deliverable');
      expect(defaults.progress).toBe(0);
      expect(defaults.status).toBe('not_started');
      expect(defaults.priority).toBe('medium');
      expect(defaults.is_critical_path).toBe(false);
    });

    it('should return empty object for invalid type', () => {
      const defaults = getDefaultValues('invalid_type');
      expect(defaults).toEqual({});
    });

    it('should not include fields without defaults', () => {
      const defaults = getDefaultValues('pds_project');
      expect(defaults).not.toHaveProperty('title');
      expect(defaults).not.toHaveProperty('vision');
    });
  });
});
