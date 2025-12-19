// pages/api/portfolio/votes.js
// API routes for portfolio voting on initiatives

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        // Get votes for an artefact
        const { artefact_id } = req.query;

        if (!artefact_id) {
          return res.status(400).json({ error: 'artefact_id is required' });
        }

        const result = await query(
          `SELECT v.*, u.username
           FROM portfolio_votes v
           LEFT JOIN users u ON v.user_id = u.id
           WHERE v.artefact_id = $1
           ORDER BY v.created_at DESC`,
          [artefact_id]
        );

        // Calculate summary
        const votes = result.rows;
        const summary = {
          total: votes.length,
          approve: votes.filter(v => v.vote === 'approve').length,
          reject: votes.filter(v => v.vote === 'reject').length,
          abstain: votes.filter(v => v.vote === 'abstain').length,
        };
        summary.approvalPercent = summary.total > 0
          ? Math.round((summary.approve / (summary.approve + summary.reject)) * 100) || 0
          : 0;

        return res.status(200).json({ votes, summary });
      }

      case 'POST': {
        // Cast or update a vote
        const { artefact_id, user_id, vote, comment } = req.body;

        if (!artefact_id || !user_id || !vote) {
          return res.status(400).json({ error: 'artefact_id, user_id, and vote are required' });
        }

        if (!['approve', 'reject', 'abstain'].includes(vote)) {
          return res.status(400).json({ error: 'vote must be approve, reject, or abstain' });
        }

        // Upsert vote (update if exists, insert if new)
        const result = await query(
          `INSERT INTO portfolio_votes (artefact_id, user_id, vote, comment)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (artefact_id, user_id)
           DO UPDATE SET vote = $3, comment = $4, updated_at = now()
           RETURNING *`,
          [artefact_id, user_id, vote, comment || null]
        );

        // Get username for response
        const userResult = await query('SELECT username FROM users WHERE id = $1', [user_id]);
        const voteWithUser = {
          ...result.rows[0],
          username: userResult.rows[0]?.username,
        };

        return res.status(200).json(voteWithUser);
      }

      case 'DELETE': {
        // Remove a vote
        const { artefact_id, user_id } = req.body;

        if (!artefact_id || !user_id) {
          return res.status(400).json({ error: 'artefact_id and user_id are required' });
        }

        await query(
          'DELETE FROM portfolio_votes WHERE artefact_id = $1 AND user_id = $2',
          [artefact_id, user_id]
        );

        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Portfolio votes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
