/**
 * Liveness Check Endpoint
 * GET /api/health/live
 *
 * Simple liveness probe for Kubernetes.
 * Returns immediately if the process is running.
 * Used to determine if the container should be restarted.
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'alive',
  });
}
