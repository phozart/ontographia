// tests/unit/db/postgres.test.js
// Unit tests for PostgreSQL database client

import * as postgres from '../../../lib/db/postgres';

// Mock the pg module
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('lib/db/postgres', () => {
  let mockPool;

  beforeEach(() => {
    // Reset the pool for each test
    postgres.setPool(null);
    jest.clearAllMocks();

    // Get reference to mock pool
    const { Pool } = require('pg');
    mockPool = new Pool();
  });

  describe('getPool', () => {
    it('should create a pool on first call', () => {
      const { Pool } = require('pg');
      postgres.setPool(null);

      const pool = postgres.getPool();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: expect.any(String),
          port: expect.any(Number),
          database: expect.any(String),
          user: expect.any(String),
          password: expect.any(String),
          max: 10,
        })
      );
    });

    it('should return the same pool on subsequent calls', () => {
      postgres.setPool(null);

      const pool1 = postgres.getPool();
      const pool2 = postgres.getPool();

      expect(pool1).toBe(pool2);
    });
  });

  describe('query', () => {
    it('should execute a query through the pool', async () => {
      const mockResult = { rows: [{ id: 1, name: 'Test' }], rowCount: 1 };
      mockPool.query.mockResolvedValue(mockResult);
      postgres.setPool(mockPool);

      const result = await postgres.query('SELECT * FROM test WHERE id = $1', [1]);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      expect(result).toEqual(mockResult);
    });

    it('should throw on query error', async () => {
      const error = new Error('Query failed');
      mockPool.query.mockRejectedValue(error);
      postgres.setPool(mockPool);

      await expect(postgres.query('SELECT * FROM test')).rejects.toThrow('Query failed');
    });
  });

  describe('getClient', () => {
    it('should return a client from the pool', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);
      postgres.setPool(mockPool);

      const client = await postgres.getClient();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(client).toBe(mockClient);
    });
  });

  describe('withTransaction', () => {
    it('should execute function within a transaction', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);
      postgres.setPool(mockPool);

      const fn = jest.fn().mockResolvedValue('result');

      const result = await postgres.withTransaction(fn);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(fn).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback on error', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);
      postgres.setPool(mockPool);

      const error = new Error('Transaction failed');
      const fn = jest.fn().mockRejectedValue(error);

      await expect(postgres.withTransaction(fn)).rejects.toThrow('Transaction failed');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('closePool', () => {
    it('should end the pool connection', async () => {
      mockPool.end.mockResolvedValue(undefined);
      postgres.setPool(mockPool);

      await postgres.closePool();

      expect(mockPool.end).toHaveBeenCalled();
    });
  });
});
