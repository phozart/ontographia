/**
 * Basic Health Check Endpoint
 * GET /api/health
 *
 * Returns basic application health status for Docker/Kubernetes health probes.
 * This is a lightweight check that should always respond quickly.
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
