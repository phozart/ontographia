/**
 * Readiness Check Endpoint
 * GET /api/health/ready
 *
 * Returns detailed readiness check including all dependencies.
 * Used for Kubernetes readiness probes and deployment verification.
 */

import { query } from '@/lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const checks = {};
  let allHealthy = true;

  // Database check
  try {
    const start = Date.now();
    await query('SELECT 1 as ok');
    checks.database = {
      status: 'healthy',
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error.message,
    };
    allHealthy = false;
  }

  // Redis check (if configured)
  if (process.env.REDIS_URL) {
    try {
      // For now, just check if REDIS_URL is set
      // In production, implement actual Redis ping
      checks.redis = {
        status: 'configured',
        latency_ms: null,
      };
    } catch (error) {
      checks.redis = {
        status: 'unhealthy',
        error: error.message,
      };
      allHealthy = false;
    }
  } else {
    checks.redis = {
      status: 'not_configured',
      latency_ms: null,
    };
  }

  // Neo4j check (if enabled)
  if (process.env.NEO4J_ENABLED === 'true' && process.env.NEO4J_URI) {
    try {
      // Placeholder for Neo4j health check
      checks.neo4j = {
        status: 'configured',
        latency_ms: null,
      };
    } catch (error) {
      checks.neo4j = {
        status: 'unhealthy',
        error: error.message,
      };
      allHealthy = false;
    }
  } else {
    checks.neo4j = {
      status: 'disabled',
      latency_ms: null,
    };
  }

  // Memory usage
  const memoryUsage = process.memoryUsage();
  checks.memory = {
    heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
  };

  const response = {
    status: allHealthy ? 'ready' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks,
  };

  res.status(allHealthy ? 200 : 503).json(response);
}
