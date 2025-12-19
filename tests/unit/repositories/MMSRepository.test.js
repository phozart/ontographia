// tests/unit/repositories/MMSRepository.test.js
// Unit tests for MMSRepository

import { MMSRepository, mmsRepository } from '../../../lib/repositories/MMSRepository';
import { BaseRepository } from '../../../lib/repositories/BaseRepository';

describe('MMSRepository', () => {
  describe('exports', () => {
    it('should export MMSRepository class', () => {
      expect(MMSRepository).toBeDefined();
      expect(typeof MMSRepository).toBe('function');
    });

    it('should export mmsRepository singleton instance', () => {
      expect(mmsRepository).toBeDefined();
      expect(mmsRepository).toBeInstanceOf(MMSRepository);
    });
  });

  describe('inheritance', () => {
    it('should extend BaseRepository', () => {
      expect(mmsRepository).toBeInstanceOf(BaseRepository);
    });

    it('should be configured for mms_situations table', () => {
      const repo = new MMSRepository();
      expect(repo.tableName).toBe('mms_situations');
      expect(repo.primaryKey).toBe('id');
    });
  });

  describe('methods', () => {
    it('should have findSituations method', () => {
      expect(typeof mmsRepository.findSituations).toBe('function');
    });

    it('should have findSituationById method', () => {
      expect(typeof mmsRepository.findSituationById).toBe('function');
    });

    it('should have createSituation method', () => {
      expect(typeof mmsRepository.createSituation).toBe('function');
    });

    it('should have updateSituation method', () => {
      expect(typeof mmsRepository.updateSituation).toBe('function');
    });

    it('should have deleteSituation method', () => {
      expect(typeof mmsRepository.deleteSituation).toBe('function');
    });

    it('should have checkOwnership method', () => {
      expect(typeof mmsRepository.checkOwnership).toBe('function');
    });

    it('should have element CRUD methods', () => {
      expect(typeof mmsRepository.findElementById).toBe('function');
      expect(typeof mmsRepository.findElements).toBe('function');
      expect(typeof mmsRepository.createElement).toBe('function');
      expect(typeof mmsRepository.updateElement).toBe('function');
      expect(typeof mmsRepository.deleteElement).toBe('function');
      expect(typeof mmsRepository.bulkCreateElements).toBe('function');
    });

    it('should have relationship methods', () => {
      expect(typeof mmsRepository.findRelationships).toBe('function');
      expect(typeof mmsRepository.createRelationship).toBe('function');
      expect(typeof mmsRepository.deleteRelationship).toBe('function');
      expect(typeof mmsRepository.checkRelationshipAccess).toBe('function');
    });

    it('should have reflection methods', () => {
      expect(typeof mmsRepository.findReflections).toBe('function');
      expect(typeof mmsRepository.createReflection).toBe('function');
      expect(typeof mmsRepository.deleteReflection).toBe('function');
      expect(typeof mmsRepository.checkReflectionAccess).toBe('function');
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const { mmsRepository: repo1 } = require('../../../lib/repositories/MMSRepository');
      const { mmsRepository: repo2 } = require('../../../lib/repositories/MMSRepository');
      expect(repo1).toBe(repo2);
    });
  });
});
