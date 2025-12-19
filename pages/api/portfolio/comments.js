// pages/api/portfolio/comments.js
// API routes for portfolio discussion comments

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        // Get comments for an artefact
        const { artefact_id } = req.query;

        if (!artefact_id) {
          return res.status(400).json({ error: 'artefact_id is required' });
        }

        const result = await query(
          `SELECT c.*, u.username
           FROM portfolio_comments c
           LEFT JOIN users u ON c.user_id = u.id
           WHERE c.artefact_id = $1
           ORDER BY c.created_at ASC`,
          [artefact_id]
        );

        // Build thread structure (nest replies under parent comments)
        const commentsMap = {};
        const rootComments = [];

        result.rows.forEach(comment => {
          commentsMap[comment.id] = { ...comment, replies: [] };
        });

        result.rows.forEach(comment => {
          if (comment.parent_id && commentsMap[comment.parent_id]) {
            commentsMap[comment.parent_id].replies.push(commentsMap[comment.id]);
          } else if (!comment.parent_id) {
            rootComments.push(commentsMap[comment.id]);
          }
        });

        return res.status(200).json({
          comments: rootComments,
          total: result.rows.length,
        });
      }

      case 'POST': {
        // Add a new comment
        const { artefact_id, user_id, content, parent_id } = req.body;

        if (!artefact_id || !user_id || !content) {
          return res.status(400).json({ error: 'artefact_id, user_id, and content are required' });
        }

        const result = await query(
          `INSERT INTO portfolio_comments (artefact_id, user_id, content, parent_id)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [artefact_id, user_id, content, parent_id || null]
        );

        // Get username for response
        const userResult = await query('SELECT username FROM users WHERE id = $1', [user_id]);
        const commentWithUser = {
          ...result.rows[0],
          username: userResult.rows[0]?.username,
          replies: [],
        };

        return res.status(201).json(commentWithUser);
      }

      case 'PUT': {
        // Update a comment
        const { id, content, user_id } = req.body;

        if (!id || !content) {
          return res.status(400).json({ error: 'id and content are required' });
        }

        // Only allow the author to edit
        const result = await query(
          `UPDATE portfolio_comments
           SET content = $1, updated_at = now()
           WHERE id = $2 AND user_id = $3
           RETURNING *`,
          [content, id, user_id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }

        const userResult = await query('SELECT username FROM users WHERE id = $1', [user_id]);
        const commentWithUser = {
          ...result.rows[0],
          username: userResult.rows[0]?.username,
        };

        return res.status(200).json(commentWithUser);
      }

      case 'DELETE': {
        // Delete a comment (and its replies via cascade)
        const { id, user_id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'id is required' });
        }

        // Only allow the author to delete
        const result = await query(
          'DELETE FROM portfolio_comments WHERE id = $1 AND user_id = $2 RETURNING id',
          [id, user_id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }

        return res.status(200).json({ success: true, id });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Portfolio comments API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
