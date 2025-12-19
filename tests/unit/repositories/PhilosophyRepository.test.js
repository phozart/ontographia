// tests/unit/repositories/PhilosophyRepository.test.js
// Unit tests for PhilosophyRepository

import { PhilosophyRepository, philosophyRepository } from '../../../lib/repositories/PhilosophyRepository';
import { BaseRepository } from '../../../lib/repositories/BaseRepository';

describe('PhilosophyRepository', () => {
  describe('exports', () => {
    it('should export PhilosophyRepository class', () => {
      expect(PhilosophyRepository).toBeDefined();
      expect(typeof PhilosophyRepository).toBe('function');
    });

    it('should export philosophyRepository singleton instance', () => {
      expect(philosophyRepository).toBeDefined();
      expect(philosophyRepository).toBeInstanceOf(PhilosophyRepository);
    });
  });

  describe('inheritance', () => {
    it('should extend BaseRepository', () => {
      expect(philosophyRepository).toBeInstanceOf(BaseRepository);
    });

    it('should be configured for phil_inquiries table', () => {
      const repo = new PhilosophyRepository();
      expect(repo.tableName).toBe('phil_inquiries');
      expect(repo.primaryKey).toBe('id');
    });
  });

  describe('inquiry methods', () => {
    it('should have findInquiries method', () => {
      expect(typeof philosophyRepository.findInquiries).toBe('function');
    });

    it('should have findInquiryById method', () => {
      expect(typeof philosophyRepository.findInquiryById).toBe('function');
    });

    it('should have findInquiryByIdWithStats method', () => {
      expect(typeof philosophyRepository.findInquiryByIdWithStats).toBe('function');
    });

    it('should have createInquiry method', () => {
      expect(typeof philosophyRepository.createInquiry).toBe('function');
    });

    it('should have updateInquiry method', () => {
      expect(typeof philosophyRepository.updateInquiry).toBe('function');
    });

    it('should have deleteInquiry method', () => {
      expect(typeof philosophyRepository.deleteInquiry).toBe('function');
    });

    it('should have checkOwnership method', () => {
      expect(typeof philosophyRepository.checkOwnership).toBe('function');
    });
  });

  describe('element methods', () => {
    it('should have findElements method', () => {
      expect(typeof philosophyRepository.findElements).toBe('function');
    });

    it('should have findElementById method', () => {
      expect(typeof philosophyRepository.findElementById).toBe('function');
    });

    it('should have createElement method', () => {
      expect(typeof philosophyRepository.createElement).toBe('function');
    });

    it('should have updateElement method', () => {
      expect(typeof philosophyRepository.updateElement).toBe('function');
    });

    it('should have deleteElement method', () => {
      expect(typeof philosophyRepository.deleteElement).toBe('function');
    });
  });

  describe('relationship methods', () => {
    it('should have findRelationships method', () => {
      expect(typeof philosophyRepository.findRelationships).toBe('function');
    });

    it('should have createRelationship method', () => {
      expect(typeof philosophyRepository.createRelationship).toBe('function');
    });

    it('should have deleteRelationship method', () => {
      expect(typeof philosophyRepository.deleteRelationship).toBe('function');
    });
  });

  describe('reflection methods', () => {
    it('should have findReflections method', () => {
      expect(typeof philosophyRepository.findReflections).toBe('function');
    });

    it('should have createReflection method', () => {
      expect(typeof philosophyRepository.createReflection).toBe('function');
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const { philosophyRepository: repo1 } = require('../../../lib/repositories/PhilosophyRepository');
      const { philosophyRepository: repo2 } = require('../../../lib/repositories/PhilosophyRepository');
      expect(repo1).toBe(repo2);
    });
  });
});
