// tests/pds/pds-guidance.test.js
// Unit tests for PDS guidance content and helper functions

import {
  PDS_STAGE_GUIDANCE,
  PDS_ARTEFACT_EXAMPLES,
  PDS_DIAGNOSTIC_QUESTIONS,
  PDS_COACHING_PROMPTS,
  PDS_FIELD_TIPS,
  PDS_WORKFLOW_GUIDANCE,
  getStageGuidance,
  getArtefactExamples,
  getCoachingPrompts,
  getFieldTip,
  getDiagnosticQuestions,
} from '../../lib/pds-guidance';

import { PDS_STAGES } from '../../lib/pds-types';

describe('PDS Guidance Constants', () => {
  describe('PDS_STAGE_GUIDANCE', () => {
    it('should have guidance for all stages', () => {
      const stages = Object.values(PDS_STAGES);
      stages.forEach(stage => {
        expect(PDS_STAGE_GUIDANCE[stage]).toBeDefined();
      });
    });

    it('should have required properties for each stage', () => {
      Object.values(PDS_STAGE_GUIDANCE).forEach(guidance => {
        expect(guidance).toHaveProperty('overview');
        expect(guidance).toHaveProperty('keyPrinciples');
        expect(guidance).toHaveProperty('commonMistakes');
        expect(guidance).toHaveProperty('promptQuestions');
        expect(Array.isArray(guidance.keyPrinciples)).toBe(true);
        expect(Array.isArray(guidance.commonMistakes)).toBe(true);
        expect(Array.isArray(guidance.promptQuestions)).toBe(true);
      });
    });

    it('should have at least 3 principles per stage', () => {
      Object.values(PDS_STAGE_GUIDANCE).forEach(guidance => {
        expect(guidance.keyPrinciples.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should have at least 3 common mistakes per stage', () => {
      Object.values(PDS_STAGE_GUIDANCE).forEach(guidance => {
        expect(guidance.commonMistakes.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should have at least 3 prompt questions per stage', () => {
      Object.values(PDS_STAGE_GUIDANCE).forEach(guidance => {
        expect(guidance.promptQuestions.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should have intent guidance focused on "why"', () => {
      const intent = PDS_STAGE_GUIDANCE[PDS_STAGES.INTENT];
      expect(intent.overview.toLowerCase()).toContain('why');
    });

    it('should have structure guidance focused on dependencies', () => {
      const structure = PDS_STAGE_GUIDANCE[PDS_STAGES.STRUCTURE];
      expect(structure.keyPrinciples.some(p => p.toLowerCase().includes('depend'))).toBe(true);
    });

    it('should have uncertainty guidance mentioning risks and assumptions', () => {
      const uncertainty = PDS_STAGE_GUIDANCE[PDS_STAGES.UNCERTAINTY];
      expect(uncertainty.keyPrinciples.some(p => p.toLowerCase().includes('risk'))).toBe(true);
      expect(uncertainty.keyPrinciples.some(p => p.toLowerCase().includes('assumption'))).toBe(true);
    });
  });

  describe('PDS_ARTEFACT_EXAMPLES', () => {
    it('should have examples for key artefact types', () => {
      expect(PDS_ARTEFACT_EXAMPLES.pds_project).toBeDefined();
      expect(PDS_ARTEFACT_EXAMPLES.pds_stakeholder).toBeDefined();
      expect(PDS_ARTEFACT_EXAMPLES.pds_risk).toBeDefined();
      expect(PDS_ARTEFACT_EXAMPLES.pds_assumption).toBeDefined();
      expect(PDS_ARTEFACT_EXAMPLES.pds_deliverable).toBeDefined();
      expect(PDS_ARTEFACT_EXAMPLES.pds_lesson).toBeDefined();
    });

    it('should have good and poor examples for each type', () => {
      Object.values(PDS_ARTEFACT_EXAMPLES).forEach(examples => {
        expect(examples).toHaveProperty('good');
        expect(examples).toHaveProperty('poor');
        expect(Array.isArray(examples.good)).toBe(true);
        expect(Array.isArray(examples.poor)).toBe(true);
      });
    });

    it('should have meaningful good examples with explanations', () => {
      Object.values(PDS_ARTEFACT_EXAMPLES).forEach(examples => {
        examples.good.forEach(example => {
          expect(example).toHaveProperty('title');
          expect(example).toHaveProperty('why');
        });
      });
    });

    it('should have poor examples with explanations of why they are poor', () => {
      Object.values(PDS_ARTEFACT_EXAMPLES).forEach(examples => {
        examples.poor.forEach(example => {
          expect(example).toHaveProperty('title');
          expect(example).toHaveProperty('why');
        });
      });
    });
  });

  describe('PDS_DIAGNOSTIC_QUESTIONS', () => {
    it('should have questions for various contexts', () => {
      expect(PDS_DIAGNOSTIC_QUESTIONS.project_health).toBeDefined();
      expect(PDS_DIAGNOSTIC_QUESTIONS.intent_complete).toBeDefined();
      expect(PDS_DIAGNOSTIC_QUESTIONS.structure_complete).toBeDefined();
      expect(PDS_DIAGNOSTIC_QUESTIONS.uncertainty_complete).toBeDefined();
      expect(PDS_DIAGNOSTIC_QUESTIONS.control_effective).toBeDefined();
      expect(PDS_DIAGNOSTIC_QUESTIONS.learning_captured).toBeDefined();
    });

    it('should have question objects with q and targets', () => {
      Object.values(PDS_DIAGNOSTIC_QUESTIONS).forEach(questions => {
        expect(Array.isArray(questions)).toBe(true);
        questions.forEach(question => {
          expect(question).toHaveProperty('q');
          expect(question).toHaveProperty('targets');
          expect(typeof question.q).toBe('string');
        });
      });
    });

    it('should have project_health questions targeting key areas', () => {
      const healthQuestions = PDS_DIAGNOSTIC_QUESTIONS.project_health;
      const targets = healthQuestions.map(q => q.targets);
      expect(targets).toContain('success_measures');
      expect(targets).toContain('stakeholders');
      expect(targets).toContain('risks');
    });
  });

  describe('PDS_COACHING_PROMPTS', () => {
    it('should have prompts for common situations', () => {
      expect(PDS_COACHING_PROMPTS.empty_project).toBeDefined();
      expect(PDS_COACHING_PROMPTS.no_stakeholders).toBeDefined();
      expect(PDS_COACHING_PROMPTS.no_risks).toBeDefined();
      expect(PDS_COACHING_PROMPTS.no_recent_status).toBeDefined();
    });

    it('should have required properties for each prompt', () => {
      Object.values(PDS_COACHING_PROMPTS).forEach(prompt => {
        expect(prompt).toHaveProperty('title');
        expect(prompt).toHaveProperty('message');
        expect(prompt).toHaveProperty('action');
        expect(prompt).toHaveProperty('actionView');
      });
    });

    it('should have actionView pointing to valid stages', () => {
      const validViews = ['intent', 'structure', 'uncertainty', 'control', 'learning'];
      Object.values(PDS_COACHING_PROMPTS).forEach(prompt => {
        expect(validViews).toContain(prompt.actionView);
      });
    });
  });

  describe('PDS_FIELD_TIPS', () => {
    it('should have tips for common fields', () => {
      expect(PDS_FIELD_TIPS.vision).toBeDefined();
      expect(PDS_FIELD_TIPS.success_criteria).toBeDefined();
      expect(PDS_FIELD_TIPS.influence).toBeDefined();
      expect(PDS_FIELD_TIPS.probability).toBeDefined();
      expect(PDS_FIELD_TIPS.acceptance_criteria).toBeDefined();
    });

    it('should have non-empty string tips', () => {
      Object.values(PDS_FIELD_TIPS).forEach(tip => {
        expect(typeof tip).toBe('string');
        expect(tip.length).toBeGreaterThan(10);
      });
    });
  });

  describe('PDS_WORKFLOW_GUIDANCE', () => {
    it('should have guidance for project phases', () => {
      expect(PDS_WORKFLOW_GUIDANCE.new_project).toBeDefined();
      expect(PDS_WORKFLOW_GUIDANCE.planning_phase).toBeDefined();
      expect(PDS_WORKFLOW_GUIDANCE.execution_phase).toBeDefined();
      expect(PDS_WORKFLOW_GUIDANCE.closing_phase).toBeDefined();
    });

    it('should have title and steps for each workflow', () => {
      Object.values(PDS_WORKFLOW_GUIDANCE).forEach(workflow => {
        expect(workflow).toHaveProperty('title');
        expect(workflow).toHaveProperty('steps');
        expect(Array.isArray(workflow.steps)).toBe(true);
        expect(workflow.steps.length).toBeGreaterThan(3);
      });
    });

    it('should have new_project workflow starting with SRS', () => {
      const newProject = PDS_WORKFLOW_GUIDANCE.new_project;
      expect(newProject.steps[0].toLowerCase()).toContain('srs');
    });
  });
});

describe('PDS Guidance Helper Functions', () => {
  describe('getStageGuidance', () => {
    it('should return guidance for valid stage', () => {
      const guidance = getStageGuidance('intent');
      expect(guidance).toBeDefined();
      expect(guidance.overview).toBeDefined();
    });

    it('should return guidance for all stages', () => {
      Object.values(PDS_STAGES).forEach(stage => {
        const guidance = getStageGuidance(stage);
        expect(guidance).not.toBeNull();
      });
    });

    it('should return null for invalid stage', () => {
      const guidance = getStageGuidance('invalid');
      expect(guidance).toBeNull();
    });
  });

  describe('getArtefactExamples', () => {
    it('should return examples for valid type', () => {
      const examples = getArtefactExamples('pds_project');
      expect(examples.good.length).toBeGreaterThan(0);
      expect(examples.poor.length).toBeGreaterThan(0);
    });

    it('should return empty arrays for unknown type', () => {
      const examples = getArtefactExamples('unknown_type');
      expect(examples.good).toEqual([]);
      expect(examples.poor).toEqual([]);
    });

    it('should return examples for pds_risk', () => {
      const examples = getArtefactExamples('pds_risk');
      expect(examples.good.length).toBeGreaterThan(0);
    });
  });

  describe('getFieldTip', () => {
    it('should return tip for known field', () => {
      const tip = getFieldTip('vision');
      expect(tip).toBeDefined();
      expect(typeof tip).toBe('string');
    });

    it('should return null for unknown field', () => {
      const tip = getFieldTip('unknown_field');
      expect(tip).toBeNull();
    });

    it('should return tip for probability field', () => {
      const tip = getFieldTip('probability');
      expect(tip).toBeDefined();
    });
  });

  describe('getDiagnosticQuestions', () => {
    it('should return questions for valid context', () => {
      const questions = getDiagnosticQuestions('project_health');
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown context', () => {
      const questions = getDiagnosticQuestions('unknown_context');
      expect(questions).toEqual([]);
    });

    it('should return questions for intent_complete', () => {
      const questions = getDiagnosticQuestions('intent_complete');
      expect(questions.length).toBeGreaterThan(0);
    });
  });

  describe('getCoachingPrompts', () => {
    it('should return empty_project prompt when no project', () => {
      const prompts = getCoachingPrompts(null, []);
      expect(prompts.length).toBe(1);
      expect(prompts[0].title).toBe('Start with Intent');
    });

    it('should return no_stakeholders prompt when no stakeholders', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = [];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'Who Has a Stake?')).toBe(true);
    });

    it('should return no_risks prompt when no risks', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = [
        { artefact_type: 'pds_stakeholder', custom_fields: {} },
      ];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'What Could Go Wrong?')).toBe(true);
    });

    it('should not return no_stakeholders when stakeholders exist', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = [
        { artefact_type: 'pds_stakeholder', custom_fields: {} },
        { artefact_type: 'pds_success_measure', custom_fields: {} },
        { artefact_type: 'pds_risk', custom_fields: {} },
      ];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'Who Has a Stake?')).toBe(false);
    });

    it('should return no_recent_status when no recent update', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = [
        { artefact_type: 'pds_stakeholder', custom_fields: {} },
        { artefact_type: 'pds_success_measure', custom_fields: {} },
        { artefact_type: 'pds_risk', custom_fields: {} },
      ];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'Time for an Update')).toBe(true);
    });

    it('should return max 3 prompts', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = [];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.length).toBeLessThanOrEqual(3);
    });

    it('should detect stale assumptions', () => {
      const project = { id: '1', title: 'Test Project' };
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const artefacts = [
        { artefact_type: 'pds_stakeholder', custom_fields: {} },
        { artefact_type: 'pds_success_measure', custom_fields: {} },
        { artefact_type: 'pds_risk', custom_fields: {} },
        {
          artefact_type: 'pds_assumption',
          custom_fields: {
            status: 'unvalidated',
            check_date: pastDate.toISOString(),
          },
        },
        { artefact_type: 'pds_status_update', custom_fields: { date: new Date().toISOString() } },
      ];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'Check Your Assumptions')).toBe(true);
    });

    it('should detect overdue milestones', () => {
      const project = { id: '1', title: 'Test Project' };
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const artefacts = [
        { artefact_type: 'pds_stakeholder', custom_fields: {} },
        { artefact_type: 'pds_success_measure', custom_fields: {} },
        { artefact_type: 'pds_risk', custom_fields: {} },
        {
          artefact_type: 'pds_milestone',
          custom_fields: {
            status: 'upcoming',
            planned_date: pastDate.toISOString(),
          },
        },
        { artefact_type: 'pds_status_update', custom_fields: { date: new Date().toISOString() } },
      ];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'Milestone at Risk')).toBe(true);
    });

    it('should detect high exposure risks without contingencies', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = [
        { artefact_type: 'pds_stakeholder', custom_fields: {} },
        { artefact_type: 'pds_success_measure', custom_fields: {} },
        { artefact_type: 'pds_risk', custom_fields: { exposure: 'critical' } },
        { artefact_type: 'pds_status_update', custom_fields: { date: new Date().toISOString() } },
      ];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'High-Risk Alert')).toBe(true);
    });

    it('should not alert for high risks when contingencies exist', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = [
        { artefact_type: 'pds_stakeholder', custom_fields: {} },
        { artefact_type: 'pds_success_measure', custom_fields: {} },
        { artefact_type: 'pds_risk', custom_fields: { exposure: 'critical' } },
        { artefact_type: 'pds_contingency', custom_fields: {} },
        { artefact_type: 'pds_status_update', custom_fields: { date: new Date().toISOString() } },
      ];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'High-Risk Alert')).toBe(false);
    });

    it('should detect too many unresolved issues', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = [
        { artefact_type: 'pds_stakeholder', custom_fields: {} },
        { artefact_type: 'pds_success_measure', custom_fields: {} },
        { artefact_type: 'pds_risk', custom_fields: {} },
        { artefact_type: 'pds_issue', custom_fields: { status: 'open' } },
        { artefact_type: 'pds_issue', custom_fields: { status: 'open' } },
        { artefact_type: 'pds_issue', custom_fields: { status: 'in_progress' } },
        { artefact_type: 'pds_issue', custom_fields: { status: 'open' } },
        { artefact_type: 'pds_status_update', custom_fields: { date: new Date().toISOString() } },
      ];
      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'Issues Need Attention')).toBe(true);
    });

    it('should suggest capturing lessons for mature projects', () => {
      const project = { id: '1', title: 'Test Project' };
      const artefacts = Array(12).fill(null).map((_, i) => ({
        artefact_type: i < 3 ? 'pds_stakeholder' : 'pds_deliverable',
        custom_fields: {},
      }));
      artefacts.push({ artefact_type: 'pds_success_measure', custom_fields: {} });
      artefacts.push({ artefact_type: 'pds_risk', custom_fields: {} });
      artefacts.push({ artefact_type: 'pds_status_update', custom_fields: { date: new Date().toISOString() } });

      const prompts = getCoachingPrompts(project, artefacts);
      expect(prompts.some(p => p.title === 'Capture the Learning')).toBe(true);
    });
  });
});
