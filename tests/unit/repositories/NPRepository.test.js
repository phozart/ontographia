// tests/unit/repositories/NPRepository.test.js
// Unit tests for NPRepository

import { NPRepository, npRepository } from '../../../lib/repositories/NPRepository';
import { BaseRepository } from '../../../lib/repositories/BaseRepository';

describe('NPRepository', () => {
  describe('exports', () => {
    it('should export NPRepository class', () => {
      expect(NPRepository).toBeDefined();
      expect(typeof NPRepository).toBe('function');
    });

    it('should export npRepository singleton instance', () => {
      expect(npRepository).toBeDefined();
      expect(npRepository).toBeInstanceOf(NPRepository);
    });
  });

  describe('inheritance', () => {
    it('should extend BaseRepository', () => {
      expect(npRepository).toBeInstanceOf(BaseRepository);
    });

    it('should be configured for np_situations table', () => {
      const repo = new NPRepository();
      expect(repo.tableName).toBe('np_situations');
      expect(repo.primaryKey).toBe('id');
    });
  });

  describe('situation methods', () => {
    it('should have findSituations method', () => {
      expect(typeof npRepository.findSituations).toBe('function');
    });

    it('should have findSituationById method', () => {
      expect(typeof npRepository.findSituationById).toBe('function');
    });

    it('should have findSituationWithDetails method', () => {
      expect(typeof npRepository.findSituationWithDetails).toBe('function');
    });

    it('should have createSituation method', () => {
      expect(typeof npRepository.createSituation).toBe('function');
    });

    it('should have updateSituation method', () => {
      expect(typeof npRepository.updateSituation).toBe('function');
    });

    it('should have deleteSituation method', () => {
      expect(typeof npRepository.deleteSituation).toBe('function');
    });
  });

  describe('element methods', () => {
    it('should have findElements method', () => {
      expect(typeof npRepository.findElements).toBe('function');
    });

    it('should have findElementById method', () => {
      expect(typeof npRepository.findElementById).toBe('function');
    });

    it('should have createElement method', () => {
      expect(typeof npRepository.createElement).toBe('function');
    });

    it('should have bulkCreateElements method', () => {
      expect(typeof npRepository.bulkCreateElements).toBe('function');
    });

    it('should have updateElement method', () => {
      expect(typeof npRepository.updateElement).toBe('function');
    });

    it('should have deleteElement method', () => {
      expect(typeof npRepository.deleteElement).toBe('function');
    });
  });

  describe('journal methods', () => {
    it('should have findJournalEntries method', () => {
      expect(typeof npRepository.findJournalEntries).toBe('function');
    });

    it('should have createJournalEntry method', () => {
      expect(typeof npRepository.createJournalEntry).toBe('function');
    });

    it('should have updateJournalEntry method', () => {
      expect(typeof npRepository.updateJournalEntry).toBe('function');
    });

    it('should have deleteJournalEntry method', () => {
      expect(typeof npRepository.deleteJournalEntry).toBe('function');
    });
  });

  describe('relationship methods', () => {
    it('should have findRelationships method', () => {
      expect(typeof npRepository.findRelationships).toBe('function');
    });

    it('should have createRelationship method', () => {
      expect(typeof npRepository.createRelationship).toBe('function');
    });

    it('should have updateRelationship method', () => {
      expect(typeof npRepository.updateRelationship).toBe('function');
    });

    it('should have deleteRelationship method', () => {
      expect(typeof npRepository.deleteRelationship).toBe('function');
    });
  });

  describe('conversation turn methods', () => {
    it('should have findConversationTurns method', () => {
      expect(typeof npRepository.findConversationTurns).toBe('function');
    });

    it('should have createConversationTurn method', () => {
      expect(typeof npRepository.createConversationTurn).toBe('function');
    });

    it('should have updateConversationTurn method', () => {
      expect(typeof npRepository.updateConversationTurn).toBe('function');
    });

    it('should have deleteConversationTurn method', () => {
      expect(typeof npRepository.deleteConversationTurn).toBe('function');
    });

    it('should have reorderConversationTurns method', () => {
      expect(typeof npRepository.reorderConversationTurns).toBe('function');
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const { npRepository: repo1 } = require('../../../lib/repositories/NPRepository');
      const { npRepository: repo2 } = require('../../../lib/repositories/NPRepository');
      expect(repo1).toBe(repo2);
    });
  });
});
