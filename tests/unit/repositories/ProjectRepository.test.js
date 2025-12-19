// tests/unit/repositories/ProjectRepository.test.js
// Unit tests for ProjectRepository

import { normalizeStatus, PROJECT_STATUS } from '../../../lib/repositories/ProjectRepository';

describe('ProjectRepository', () => {
  describe('PROJECT_STATUS', () => {
    it('should contain all valid status values', () => {
      expect(PROJECT_STATUS).toContain('Draft');
      expect(PROJECT_STATUS).toContain('Active');
      expect(PROJECT_STATUS).toContain('On Hold');
      expect(PROJECT_STATUS).toContain('Closed');
      expect(PROJECT_STATUS).toHaveLength(4);
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(PROJECT_STATUS)).toBe(true);
    });
  });

  describe('normalizeStatus', () => {
    it('should return default value when no value provided', () => {
      expect(normalizeStatus()).toBe('Draft');
      expect(normalizeStatus(null)).toBe('Draft');
      expect(normalizeStatus(undefined)).toBe('Draft');
      expect(normalizeStatus('')).toBe('Draft');
    });

    it('should return custom default when specified', () => {
      expect(normalizeStatus(null, 'Active')).toBe('Active');
      expect(normalizeStatus('', 'Closed')).toBe('Closed');
    });

    it('should normalize valid status values (case-insensitive)', () => {
      expect(normalizeStatus('draft')).toBe('Draft');
      expect(normalizeStatus('DRAFT')).toBe('Draft');
      expect(normalizeStatus('Draft')).toBe('Draft');
      expect(normalizeStatus('active')).toBe('Active');
      expect(normalizeStatus('ACTIVE')).toBe('Active');
      expect(normalizeStatus('on hold')).toBe('On Hold');
      expect(normalizeStatus('ON HOLD')).toBe('On Hold');
      expect(normalizeStatus('closed')).toBe('Closed');
      expect(normalizeStatus('CLOSED')).toBe('Closed');
    });

    it('should return default for invalid status values', () => {
      expect(normalizeStatus('invalid')).toBe('Draft');
      expect(normalizeStatus('pending')).toBe('Draft');
      expect(normalizeStatus('completed')).toBe('Draft');
      expect(normalizeStatus(123)).toBe('Draft');
    });

    it('should handle numeric string conversion', () => {
      expect(normalizeStatus(123, 'Active')).toBe('Active');
    });
  });
});
