/**
 * CapRepository Unit Tests
 *
 * Tests for the Capability and Operating Model Studio repository
 */

import { CapRepository, capRepository } from '../../../lib/repositories/CapRepository';
import { BaseRepository } from '../../../lib/repositories/BaseRepository';

describe('CapRepository', () => {
  // ============================================================================
  // EXPORTS
  // ============================================================================

  describe('exports', () => {
    test('exports CapRepository class', () => {
      expect(CapRepository).toBeDefined();
      expect(typeof CapRepository).toBe('function');
    });

    test('exports capRepository singleton instance', () => {
      expect(capRepository).toBeDefined();
      expect(capRepository).toBeInstanceOf(CapRepository);
    });

    test('singleton instance is frozen', () => {
      const descriptor = Object.getOwnPropertyDescriptor(
        require('../../../lib/repositories/CapRepository'),
        'capRepository'
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
      expect(capRepository).toBeInstanceOf(BaseRepository);
    });

    test('has tableName set to artefacts', () => {
      expect(capRepository.tableName).toBe('artefacts');
    });

    test('inherits BaseRepository methods', () => {
      // BaseRepository provides tableName and basic structure
      expect(capRepository.tableName).toBeDefined();
    });
  });

  // ============================================================================
  // METHOD SIGNATURES
  // ============================================================================

  describe('method signatures', () => {
    // Artefact operations
    test('has findByProject method', () => {
      expect(typeof capRepository.findByProject).toBe('function');
    });

    test('has findById method', () => {
      expect(typeof capRepository.findById).toBe('function');
    });

    test('has findByIdWithRelationships method', () => {
      expect(typeof capRepository.findByIdWithRelationships).toBe('function');
    });

    test('has create method', () => {
      expect(typeof capRepository.create).toBe('function');
    });

    test('has update method', () => {
      expect(typeof capRepository.update).toBe('function');
    });

    test('has delete method', () => {
      expect(typeof capRepository.delete).toBe('function');
    });

    // Capability-specific operations
    test('has findCapabilities method', () => {
      expect(typeof capRepository.findCapabilities).toBe('function');
    });

    test('has findChildCapabilities method', () => {
      expect(typeof capRepository.findChildCapabilities).toBe('function');
    });

    test('has findRootCapabilities method', () => {
      expect(typeof capRepository.findRootCapabilities).toBe('function');
    });

    test('has buildCapabilityTree method', () => {
      expect(typeof capRepository.buildCapabilityTree).toBe('function');
    });

    // Relationship operations
    test('has findRelationships method', () => {
      expect(typeof capRepository.findRelationships).toBe('function');
    });

    test('has createRelationship method', () => {
      expect(typeof capRepository.createRelationship).toBe('function');
    });

    test('has deleteRelationship method', () => {
      expect(typeof capRepository.deleteRelationship).toBe('function');
    });

    // Statistics
    test('has getStats method', () => {
      expect(typeof capRepository.getStats).toBe('function');
    });
  });

  // ============================================================================
  // SINGLETON BEHAVIOR
  // ============================================================================

  describe('singleton behavior', () => {
    test('multiple imports return same instance', () => {
      const { capRepository: instance1 } = require('../../../lib/repositories/CapRepository');
      const { capRepository: instance2 } = require('../../../lib/repositories/CapRepository');
      expect(instance1).toBe(instance2);
    });

    test('creating new instance is different from singleton', () => {
      const newInstance = new CapRepository();
      expect(newInstance).not.toBe(capRepository);
      expect(newInstance).toBeInstanceOf(CapRepository);
    });
  });
});

// ============================================================================
// TYPE DEFINITIONS INTEGRATION
// ============================================================================

describe('cap-types integration', () => {
  const {
    CAP_TYPE_DEFS,
    CAP_ALL_TYPES,
    CAP_STAGES,
    CAP_RELATIONSHIP_TYPES,
    isCapType,
    getTypeDefinition,
    getTypeColor,
    validateRelationship,
  } = require('../../../lib/cap-types');

  test('CAP_TYPE_DEFS is defined', () => {
    expect(CAP_TYPE_DEFS).toBeDefined();
    expect(typeof CAP_TYPE_DEFS).toBe('object');
  });

  test('has all expected capability types', () => {
    const expectedTypes = [
      'cap_capability',
      'cap_capability_group',
      'cap_value_stream',
      'cap_assessment',
      'cap_gap',
      'cap_operating_model',
      'cap_accountability',
      'cap_resource',
      'cap_initiative',
      'cap_roadmap_item',
    ];

    expectedTypes.forEach(type => {
      expect(CAP_TYPE_DEFS[type]).toBeDefined();
      expect(CAP_TYPE_DEFS[type].id).toBe(type);
    });
  });

  test('CAP_ALL_TYPES matches type definitions', () => {
    expect(CAP_ALL_TYPES).toEqual(Object.keys(CAP_TYPE_DEFS));
  });

  test('CAP_STAGES is defined with expected stages', () => {
    expect(CAP_STAGES).toBeDefined();
    expect(CAP_STAGES.discover).toBeDefined();
    expect(CAP_STAGES.assess).toBeDefined();
    expect(CAP_STAGES.design).toBeDefined();
    expect(CAP_STAGES.plan).toBeDefined();
  });

  test('CAP_RELATIONSHIP_TYPES has expected relationships', () => {
    expect(CAP_RELATIONSHIP_TYPES).toBeDefined();
    expect(CAP_RELATIONSHIP_TYPES.decomposes_to).toBeDefined();
    expect(CAP_RELATIONSHIP_TYPES.depends_on).toBeDefined();
    expect(CAP_RELATIONSHIP_TYPES.enables).toBeDefined();
  });

  test('isCapType validates capability types correctly', () => {
    expect(isCapType('cap_capability')).toBe(true);
    expect(isCapType('cap_assessment')).toBe(true);
    expect(isCapType('not_a_cap_type')).toBe(false);
    expect(isCapType('pdw_persona')).toBe(false);
    expect(isCapType(null)).toBe(false);
  });

  test('getTypeDefinition returns correct definition', () => {
    const capDef = getTypeDefinition('cap_capability');
    expect(capDef).toBeDefined();
    expect(capDef.id).toBe('cap_capability');
    expect(capDef.name).toBe('Capability');
    expect(capDef.fields).toBeDefined();
    expect(Array.isArray(capDef.fields)).toBe(true);
  });

  test('getTypeColor returns valid color', () => {
    const color = getTypeColor('cap_capability');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('validateRelationship works correctly', () => {
    // Valid relationship
    expect(validateRelationship('cap_capability', 'cap_capability', 'depends_on')).toBe(true);

    // Invalid relationship type
    expect(validateRelationship('cap_capability', 'cap_capability', 'invalid_rel')).toBe(false);

    // Invalid from/to types
    expect(validateRelationship('cap_assessment', 'cap_assessment', 'decomposes_to')).toBe(false);
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

describe('cap-types utility functions', () => {
  const {
    calculateCapabilityCompleteness,
    calculateMaturitySummary,
    generateCapabilityHeatmap,
    getStageForType,
    getTypesForStage,
  } = require('../../../lib/cap-types');

  test('getStageForType returns correct stage', () => {
    expect(getStageForType('cap_capability')).toBe('discover');
    expect(getStageForType('cap_assessment')).toBe('assess');
    expect(getStageForType('cap_operating_model')).toBe('design');
    expect(getStageForType('cap_initiative')).toBe('plan');
  });

  test('getTypesForStage returns correct types', () => {
    const discoverTypes = getTypesForStage('discover');
    expect(discoverTypes).toContain('cap_capability');
    expect(discoverTypes).toContain('cap_value_stream');
  });

  test('calculateCapabilityCompleteness returns score', () => {
    const capability = {
      id: 'test-id',
      custom_fields: {
        definition: 'Test definition',
        maturity: 'defined',
      },
    };

    const result = calculateCapabilityCompleteness(capability, []);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('percentage');
    expect(typeof result.score).toBe('number');
    expect(typeof result.percentage).toBe('number');
  });

  test('calculateMaturitySummary handles empty array', () => {
    const result = calculateMaturitySummary([]);
    expect(result.average).toBe(0);
    expect(result.count).toBe(0);
  });

  test('calculateMaturitySummary calculates average', () => {
    const capabilities = [
      { custom_fields: { maturity: 'defined' } }, // score 3
      { custom_fields: { maturity: 'managed' } }, // score 4
    ];

    const result = calculateMaturitySummary(capabilities);
    expect(result.average).toBe(3.5);
    expect(result.count).toBe(2);
  });

  test('generateCapabilityHeatmap returns heatmap data', () => {
    const capabilities = [
      {
        id: 'cap1',
        name: 'Test Capability',
        artefact_type: 'cap_capability',
        custom_fields: {
          maturity: 'defined',
          strategic_importance: 'core',
        },
      },
    ];

    const heatmap = generateCapabilityHeatmap(capabilities);
    expect(Array.isArray(heatmap)).toBe(true);
    expect(heatmap[0]).toHaveProperty('id');
    expect(heatmap[0]).toHaveProperty('name');
    expect(heatmap[0]).toHaveProperty('maturity');
    expect(heatmap[0]).toHaveProperty('strategicImportance');
  });
});
