/**
 * GovRepository Unit Tests
 *
 * Tests for the Governance & Decision Design Studio repository
 */

import { GovRepository, govRepository } from '../../../lib/repositories/GovRepository';
import { BaseRepository } from '../../../lib/repositories/BaseRepository';

describe('GovRepository', () => {
  // ============================================================================
  // EXPORTS
  // ============================================================================

  describe('exports', () => {
    test('exports GovRepository class', () => {
      expect(GovRepository).toBeDefined();
      expect(typeof GovRepository).toBe('function');
    });

    test('exports govRepository singleton instance', () => {
      expect(govRepository).toBeDefined();
      expect(govRepository).toBeInstanceOf(GovRepository);
    });

    test('singleton instance is frozen', () => {
      const descriptor = Object.getOwnPropertyDescriptor(
        require('../../../lib/repositories/GovRepository'),
        'govRepository'
      );
      // Should be a const export
      expect(descriptor.writable).toBeFalsy();
    });
  });

  // ============================================================================
  // INHERITANCE
  // ============================================================================

  describe('inheritance', () => {
    test('extends BaseRepository', () => {
      expect(govRepository).toBeInstanceOf(BaseRepository);
    });

    test('has tableName set to artefacts', () => {
      expect(govRepository.tableName).toBe('artefacts');
    });

    test('inherits BaseRepository methods', () => {
      // BaseRepository provides tableName and basic structure
      expect(govRepository.tableName).toBeDefined();
    });
  });

  // ============================================================================
  // METHOD SIGNATURES
  // ============================================================================

  describe('method signatures', () => {
    // Artefact operations
    test('has findByProject method', () => {
      expect(typeof govRepository.findByProject).toBe('function');
    });

    test('has findById method', () => {
      expect(typeof govRepository.findById).toBe('function');
    });

    test('has create method', () => {
      expect(typeof govRepository.create).toBe('function');
    });

    test('has update method', () => {
      expect(typeof govRepository.update).toBe('function');
    });

    test('has delete method', () => {
      expect(typeof govRepository.delete).toBe('function');
    });

    // Relationship operations
    test('has createRelationship method', () => {
      expect(typeof govRepository.createRelationship).toBe('function');
    });

    test('has getRelationships method', () => {
      expect(typeof govRepository.getRelationships).toBe('function');
    });

    test('has getProjectRelationships method', () => {
      expect(typeof govRepository.getProjectRelationships).toBe('function');
    });

    // Governance-specific operations
    test('has getGovernanceStructure method', () => {
      expect(typeof govRepository.getGovernanceStructure).toBe('function');
    });

    test('has getDecisionRightsMatrix method', () => {
      expect(typeof govRepository.getDecisionRightsMatrix).toBe('function');
    });

    test('has getPolicyHierarchy method', () => {
      expect(typeof govRepository.getPolicyHierarchy).toBe('function');
    });

    test('has getEscalationPaths method', () => {
      expect(typeof govRepository.getEscalationPaths).toBe('function');
    });

    test('has getRaciMatrix method', () => {
      expect(typeof govRepository.getRaciMatrix).toBe('function');
    });

    // Statistics
    test('has getStats method', () => {
      expect(typeof govRepository.getStats).toBe('function');
    });

    test('has getDashboardSummary method', () => {
      expect(typeof govRepository.getDashboardSummary).toBe('function');
    });

    test('has validateCompleteness method', () => {
      expect(typeof govRepository.validateCompleteness).toBe('function');
    });
  });

  // ============================================================================
  // SINGLETON BEHAVIOR
  // ============================================================================

  describe('singleton behavior', () => {
    test('multiple imports return same instance', () => {
      const { govRepository: instance1 } = require('../../../lib/repositories/GovRepository');
      const { govRepository: instance2 } = require('../../../lib/repositories/GovRepository');
      expect(instance1).toBe(instance2);
    });

    test('creating new instance is different from singleton', () => {
      const newInstance = new GovRepository();
      expect(newInstance).not.toBe(govRepository);
      expect(newInstance).toBeInstanceOf(GovRepository);
    });
  });
});

// ============================================================================
// TYPE DEFINITIONS INTEGRATION
// ============================================================================

describe('gov-types integration', () => {
  const {
    GOV_TYPE_DEFS,
    GOV_STAGES,
    GOV_WORKSPACE_MODULES,
    GOV_RELATIONSHIP_TYPES,
    GOV_DECISION_SCOPE,
    GOV_RACI_TYPES,
    GOV_AUTHORITY_LEVELS,
    GOV_POLICY_STATUS,
    GOV_GUIDANCE,
    GOV_WIZARD_STEPS,
    isGovType,
    getTypeDefinition,
    getTypeColor,
    getStageForType,
    getTypesForStage,
  } = require('../../../lib/gov-types');

  test('GOV_TYPE_DEFS is defined', () => {
    expect(GOV_TYPE_DEFS).toBeDefined();
    expect(typeof GOV_TYPE_DEFS).toBe('object');
  });

  test('has all expected governance types', () => {
    const expectedTypes = [
      'gov_decision_type',
      'gov_decision_right',
      'gov_forum',
      'gov_policy',
      'gov_escalation',
      'gov_accountability',
      'gov_principle',
    ];

    expectedTypes.forEach(type => {
      expect(GOV_TYPE_DEFS[type]).toBeDefined();
      expect(GOV_TYPE_DEFS[type].name).toBeDefined();
    });
  });

  test('GOV_STAGES is defined with expected stages', () => {
    expect(GOV_STAGES).toBeDefined();
    expect(GOV_STAGES.foundations).toBeDefined();
    expect(GOV_STAGES.rights).toBeDefined();
    expect(GOV_STAGES.forums).toBeDefined();
    expect(GOV_STAGES.policies).toBeDefined();
    expect(GOV_STAGES.escalations).toBeDefined();
  });

  test('GOV_WORKSPACE_MODULES has expected modules', () => {
    expect(GOV_WORKSPACE_MODULES).toBeDefined();
    expect(GOV_WORKSPACE_MODULES.foundations).toBeDefined();
    expect(GOV_WORKSPACE_MODULES.rights).toBeDefined();
    expect(GOV_WORKSPACE_MODULES.forums).toBeDefined();
    expect(GOV_WORKSPACE_MODULES.policies).toBeDefined();
    expect(GOV_WORKSPACE_MODULES.escalations).toBeDefined();
  });

  test('GOV_RELATIONSHIP_TYPES has expected relationships', () => {
    expect(GOV_RELATIONSHIP_TYPES).toBeDefined();
    expect(GOV_RELATIONSHIP_TYPES.governs).toBeDefined();
    expect(GOV_RELATIONSHIP_TYPES.escalates_to).toBeDefined();
    expect(GOV_RELATIONSHIP_TYPES.has_authority).toBeDefined();
    expect(GOV_RELATIONSHIP_TYPES.enforces).toBeDefined();
    expect(GOV_RELATIONSHIP_TYPES.parent_policy).toBeDefined();
    expect(GOV_RELATIONSHIP_TYPES.reports_to).toBeDefined();
    expect(GOV_RELATIONSHIP_TYPES.implements_principle).toBeDefined();
  });

  test('GOV_DECISION_SCOPE has expected scopes', () => {
    expect(GOV_DECISION_SCOPE).toBeDefined();
    expect(GOV_DECISION_SCOPE.strategic).toBeDefined();
    expect(GOV_DECISION_SCOPE.tactical).toBeDefined();
    expect(GOV_DECISION_SCOPE.operational).toBeDefined();
  });

  test('GOV_RACI_TYPES has expected types', () => {
    expect(GOV_RACI_TYPES).toBeDefined();
    expect(GOV_RACI_TYPES.responsible).toBeDefined();
    expect(GOV_RACI_TYPES.accountable).toBeDefined();
    expect(GOV_RACI_TYPES.consulted).toBeDefined();
    expect(GOV_RACI_TYPES.informed).toBeDefined();
  });

  test('GOV_AUTHORITY_LEVELS has expected levels', () => {
    expect(GOV_AUTHORITY_LEVELS).toBeDefined();
    expect(GOV_AUTHORITY_LEVELS.binding).toBeDefined();
    expect(GOV_AUTHORITY_LEVELS.advisory).toBeDefined();
    expect(GOV_AUTHORITY_LEVELS.informational).toBeDefined();
  });

  test('GOV_POLICY_STATUS has expected statuses', () => {
    expect(GOV_POLICY_STATUS).toBeDefined();
    expect(GOV_POLICY_STATUS.draft).toBeDefined();
    expect(GOV_POLICY_STATUS.review).toBeDefined();
    expect(GOV_POLICY_STATUS.approved).toBeDefined();
    expect(GOV_POLICY_STATUS.retired).toBeDefined();
  });

  test('GOV_GUIDANCE has guidance for each module', () => {
    expect(GOV_GUIDANCE).toBeDefined();
    expect(GOV_GUIDANCE.foundations).toBeDefined();
    expect(GOV_GUIDANCE.rights).toBeDefined();
    expect(GOV_GUIDANCE.forums).toBeDefined();
    expect(GOV_GUIDANCE.policies).toBeDefined();
    expect(GOV_GUIDANCE.escalations).toBeDefined();

    // Check guidance structure
    expect(GOV_GUIDANCE.foundations.title).toBeDefined();
    expect(GOV_GUIDANCE.foundations.overview).toBeDefined();
    expect(Array.isArray(GOV_GUIDANCE.foundations.tips)).toBe(true);
    expect(Array.isArray(GOV_GUIDANCE.foundations.questions)).toBe(true);
  });

  test('GOV_WIZARD_STEPS has steps for each type', () => {
    expect(GOV_WIZARD_STEPS).toBeDefined();
    expect(GOV_WIZARD_STEPS.gov_decision_type).toBeDefined();
    expect(GOV_WIZARD_STEPS.gov_decision_right).toBeDefined();
    expect(GOV_WIZARD_STEPS.gov_forum).toBeDefined();
    expect(GOV_WIZARD_STEPS.gov_policy).toBeDefined();
    expect(GOV_WIZARD_STEPS.gov_escalation).toBeDefined();

    // Check wizard structure
    expect(Array.isArray(GOV_WIZARD_STEPS.gov_decision_type)).toBe(true);
    expect(GOV_WIZARD_STEPS.gov_decision_type.length).toBeGreaterThan(0);
  });

  test('isGovType validates governance types correctly', () => {
    expect(isGovType('gov_decision_type')).toBe(true);
    expect(isGovType('gov_forum')).toBe(true);
    expect(isGovType('gov_policy')).toBe(true);
    expect(isGovType('not_a_gov_type')).toBe(false);
    expect(isGovType('cap_capability')).toBe(false);
    expect(isGovType(null)).toBeFalsy(); // returns null when passed null
  });

  test('getTypeDefinition returns correct definition', () => {
    const forumDef = getTypeDefinition('gov_forum');
    expect(forumDef).toBeDefined();
    expect(forumDef.name).toBe('Governance Forum');
    expect(forumDef.fields).toBeDefined();
    expect(typeof forumDef.fields).toBe('object');
  });

  test('getTypeColor returns valid color', () => {
    const color = getTypeColor('gov_forum');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('getStageForType returns correct stage', () => {
    expect(getStageForType('gov_principle')).toBe('foundations');
    expect(getStageForType('gov_decision_type')).toBe('foundations');
    expect(getStageForType('gov_decision_right')).toBe('rights');
    expect(getStageForType('gov_forum')).toBe('forums');
    expect(getStageForType('gov_policy')).toBe('policies');
    expect(getStageForType('gov_escalation')).toBe('escalations');
  });

  test('getTypesForStage returns correct types', () => {
    const foundationTypes = getTypesForStage('foundations');
    expect(foundationTypes).toContain('gov_principle');
    expect(foundationTypes).toContain('gov_decision_type');

    const rightsTypes = getTypesForStage('rights');
    expect(rightsTypes).toContain('gov_decision_right');
    expect(rightsTypes).toContain('gov_accountability');
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

describe('gov-types utility functions', () => {
  const {
    calculateGovernanceCoverage,
    buildGovernanceTree,
    buildDecisionRightsMatrix,
  } = require('../../../lib/gov-types');

  test('calculateGovernanceCoverage handles empty artefacts', () => {
    const result = calculateGovernanceCoverage({});
    expect(result).toHaveProperty('decisionTypesCovered');
    expect(result).toHaveProperty('forumsChartered');
    expect(result).toHaveProperty('policiesApproved');
    expect(result).toHaveProperty('totalArtefacts');
    expect(result.totalArtefacts).toBe(0);
  });

  test('calculateGovernanceCoverage calculates coverage', () => {
    const artefacts = {
      gov_decision_type: [
        { id: 'dt1', name: 'Strategic Decisions' },
        { id: 'dt2', name: 'Operational Decisions' },
      ],
      gov_decision_right: [
        { id: 'dr1', properties: { decision_type_id: 'dt1' } },
      ],
      gov_forum: [
        { id: 'f1', properties: { charter: 'This is a detailed charter for the forum...' } },
        { id: 'f2', properties: {} },
      ],
      gov_policy: [
        { id: 'p1', properties: { status: 'approved' } },
        { id: 'p2', properties: { status: 'draft' } },
      ],
    };

    const result = calculateGovernanceCoverage(artefacts);
    expect(result.decisionTypesCovered).toBe(50); // dt1 has a matching right
    expect(result.forumsChartered).toBe(50); // 1 out of 2
    expect(result.policiesApproved).toBe(50); // 1 out of 2
    expect(result.totalArtefacts).toBe(7); // 2 + 1 + 2 + 2 = 7
  });

  test('buildGovernanceTree handles empty forums', () => {
    const result = buildGovernanceTree([], []);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test('buildGovernanceTree builds tree structure', () => {
    const forums = [
      { id: 'f1', name: 'Board' },
      { id: 'f2', name: 'Committee' },
    ];
    const relationships = [
      { source_id: 'f2', target_id: 'f1', relationship_type: 'reports_to' },
    ];

    const result = buildGovernanceTree(forums, relationships);
    // f2 reports to f1, so f1 is the root and f2 is a child
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('f1');
    expect(result[0].children.length).toBe(1);
    expect(result[0].children[0].id).toBe('f2');
  });

  test('buildDecisionRightsMatrix handles empty inputs', () => {
    const result = buildDecisionRightsMatrix([], [], []);
    expect(result).toHaveProperty('rows');
    expect(result).toHaveProperty('columns');
    expect(result).toHaveProperty('cells');
    expect(result.rows.length).toBe(0);
    expect(result.columns.length).toBe(0);
  });

  test('buildDecisionRightsMatrix creates matrix structure', () => {
    const decisionTypes = [
      { id: 'dt1', name: 'Strategic', properties: { scope: 'strategic' } },
    ];
    const forums = [
      { id: 'f1', name: 'Board', properties: { forum_type: 'board' } },
    ];
    const rights = [
      { id: 'dr1', properties: { role_or_forum: 'Board', decision_type_id: 'dt1', right_type: 'decide' } },
    ];

    const result = buildDecisionRightsMatrix(decisionTypes, rights, forums);
    expect(result.rows.length).toBe(1);
    expect(result.columns.length).toBe(1);
    expect(result.rows[0].id).toBe('dt1');
    expect(result.columns[0].id).toBe('f1');
  });
});

// ============================================================================
// TYPE DEFINITION FIELDS
// ============================================================================

describe('gov-types field definitions', () => {
  const { GOV_TYPE_DEFS } = require('../../../lib/gov-types');

  test('gov_decision_type has required fields', () => {
    const fields = GOV_TYPE_DEFS.gov_decision_type.fields;
    expect(fields.scope).toBeDefined();
    expect(fields.frequency).toBeDefined();
    expect(fields.impact_level).toBeDefined();
  });

  test('gov_decision_right has required fields', () => {
    const fields = GOV_TYPE_DEFS.gov_decision_right.fields;
    expect(fields.role_or_forum).toBeDefined();
    expect(fields.right_type).toBeDefined();
    expect(fields.constraints).toBeDefined();
    expect(fields.delegation_allowed).toBeDefined();
  });

  test('gov_forum has required fields', () => {
    const fields = GOV_TYPE_DEFS.gov_forum.fields;
    expect(fields.forum_type).toBeDefined();
    expect(fields.cadence).toBeDefined();
    expect(fields.chair).toBeDefined();
    expect(fields.quorum).toBeDefined();
    expect(fields.charter).toBeDefined();
    expect(fields.authority_level).toBeDefined();
  });

  test('gov_policy has required fields', () => {
    const fields = GOV_TYPE_DEFS.gov_policy.fields;
    expect(fields.policy_type).toBeDefined();
    expect(fields.status).toBeDefined();
    expect(fields.owner).toBeDefined();
    expect(fields.effective_date).toBeDefined();
    expect(fields.enforcement).toBeDefined();
  });

  test('gov_escalation has required fields', () => {
    const fields = GOV_TYPE_DEFS.gov_escalation.fields;
    expect(fields.trigger_conditions).toBeDefined();
    expect(fields.from_level).toBeDefined();
    expect(fields.to_level).toBeDefined();
    expect(fields.time_limit).toBeDefined();
  });

  test('gov_accountability has required fields', () => {
    const fields = GOV_TYPE_DEFS.gov_accountability.fields;
    expect(fields.role).toBeDefined();
    expect(fields.responsibility_type).toBeDefined();
    expect(fields.scope).toBeDefined();
  });

  test('gov_principle has required fields', () => {
    const fields = GOV_TYPE_DEFS.gov_principle.fields;
    expect(fields.category).toBeDefined();
    expect(fields.rationale).toBeDefined();
    expect(fields.implications).toBeDefined();
  });

  // Test field types
  test('fields have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'boolean', 'date'];

    Object.values(GOV_TYPE_DEFS).forEach(typeDef => {
      Object.values(typeDef.fields).forEach(field => {
        expect(validTypes).toContain(field.type);
        expect(field.label).toBeDefined();
      });
    });
  });

  // Test select fields have options
  test('select fields have options arrays', () => {
    Object.values(GOV_TYPE_DEFS).forEach(typeDef => {
      Object.values(typeDef.fields).forEach(field => {
        if (field.type === 'select') {
          expect(Array.isArray(field.options)).toBe(true);
          expect(field.options.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
