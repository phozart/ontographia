// pages/api/health.js
// Health check endpoint for Docker and load balancers

import { query } from '../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const checks = { status: 'ok', timestamp: new Date().toISOString() };

  try {
    await query('SELECT 1');
    checks.database = 'connected';
  } catch {
    checks.database = 'disconnected';
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;
  return res.status(statusCode).json(checks);
}
