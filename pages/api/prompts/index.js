/**
 * API: Research Prompts Index
 *
 * GET /api/prompts - List user's generated prompts
 * POST /api/prompts - Generate new prompts (redirects to /generate)
 *
 * Query parameters for GET:
 *   - status: Filter by status (generated, copied, researched)
 *   - artefactId: Filter by artefact
 *   - limit: Max results (default: 50)
 *   - offset: Pagination offset (default: 0)
 */

import { getUserFromRequest } from '../../../lib/projectAccess';
import {
  getUserPrompts,
  getArtefactPrompts,
  getUserResearchStats
} from '../../../lib/prompts/prompt-service';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List prompts
  if (req.method === 'GET') {
    try {
      const {
        status,
        artefactId,
        limit = '50',
        offset = '0',
        includeStats = 'false'
      } = req.query;

      let prompts;

      if (artefactId) {
        // Get prompts for a specific artefact
        prompts = await getArtefactPrompts(artefactId);
      } else {
        // Get all user prompts
        prompts = await getUserPrompts(user, {
          status,
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10)
        });
      }

      const response = {
        prompts,
        count: prompts.length,
        pagination: {
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10)
        }
      };

      // Include stats if requested
      if (includeStats === 'true') {
        response.stats = await getUserResearchStats(user);
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return res.status(500).json({ error: 'Failed to fetch prompts' });
    }
  }

  // POST - Redirect to generate
  if (req.method === 'POST') {
    return res.redirect(307, '/api/prompts/generate');
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
