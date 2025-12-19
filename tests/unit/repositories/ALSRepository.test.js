// tests/unit/repositories/ALSRepository.test.js
// Unit tests for ALSRepository

import { ALSRepository, alsRepository } from '../../../lib/repositories/ALSRepository';
import { BaseRepository } from '../../../lib/repositories/BaseRepository';

describe('ALSRepository', () => {
  describe('exports', () => {
    it('should export ALSRepository class', () => {
      expect(ALSRepository).toBeDefined();
      expect(typeof ALSRepository).toBe('function');
    });

    it('should export alsRepository singleton instance', () => {
      expect(alsRepository).toBeDefined();
      expect(alsRepository).toBeInstanceOf(ALSRepository);
    });
  });

  describe('inheritance', () => {
    it('should extend BaseRepository', () => {
      expect(alsRepository).toBeInstanceOf(BaseRepository);
    });

    it('should be configured for als_situations table', () => {
      const repo = new ALSRepository();
      expect(repo.tableName).toBe('als_situations');
      expect(repo.primaryKey).toBe('id');
    });
  });

  describe('situation methods', () => {
    it('should have findSituations method', () => {
      expect(typeof alsRepository.findSituations).toBe('function');
    });

    it('should have findSituationById method', () => {
      expect(typeof alsRepository.findSituationById).toBe('function');
    });

    it('should have createSituation method', () => {
      expect(typeof alsRepository.createSituation).toBe('function');
    });

    it('should have updateSituation method', () => {
      expect(typeof alsRepository.updateSituation).toBe('function');
    });

    it('should have deleteSituation method', () => {
      expect(typeof alsRepository.deleteSituation).toBe('function');
    });
  });

  describe('session methods', () => {
    it('should have findSessions method', () => {
      expect(typeof alsRepository.findSessions).toBe('function');
    });

    it('should have findSessionById method', () => {
      expect(typeof alsRepository.findSessionById).toBe('function');
    });

    it('should have createSession method', () => {
      expect(typeof alsRepository.createSession).toBe('function');
    });

    it('should have updateSession method', () => {
      expect(typeof alsRepository.updateSession).toBe('function');
    });

    it('should have deleteSession method', () => {
      expect(typeof alsRepository.deleteSession).toBe('function');
    });
  });

  describe('reflection methods', () => {
    it('should have findReflections method', () => {
      expect(typeof alsRepository.findReflections).toBe('function');
    });

    it('should have createReflection method', () => {
      expect(typeof alsRepository.createReflection).toBe('function');
    });

    it('should have updateReflection method', () => {
      expect(typeof alsRepository.updateReflection).toBe('function');
    });

    it('should have deleteReflection method', () => {
      expect(typeof alsRepository.deleteReflection).toBe('function');
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const { alsRepository: repo1 } = require('../../../lib/repositories/ALSRepository');
      const { alsRepository: repo2 } = require('../../../lib/repositories/ALSRepository');
      expect(repo1).toBe(repo2);
    });
  });
});
