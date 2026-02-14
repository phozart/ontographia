// pages/api/user/preferences.js
// Quick preferences API for theme and simple settings

import { userRepository } from '../../../lib/repositories';
import { withOptionalAuth } from '../../../lib/auth';

/**
 * Quick preferences handler
 * GET /api/user/preferences - Get preferences (works for anonymous users too)
 * PATCH /api/user/preferences - Update single preference (requires auth)
 */
async function preferencesHandler(req, res) {
  const { user } = req;

  try {
    switch (req.method) {
      case 'GET': {
        // For authenticated users, get from database
        if (user) {
          const settings = await userRepository.getUserSettings(user.id);
          return res.status(200).json({
            theme: settings?.theme || 'system',
            defaultSpace: settings?.defaultSpace || null,
          });
        }

        // For anonymous users, return defaults
        return res.status(200).json({
          theme: 'system',
          defaultSpace: null,
        });
      }

      case 'PATCH': {
        // Require authentication for updates
        if (!user) {
          return res.status(401).json({
            error: 'Authentication required',
            code: 'UNAUTHORIZED',
          });
        }

        const { theme, defaultSpace } = req.body || {};
        const updates = {};

        // Validate and add theme
        if (theme !== undefined) {
          if (!['light', 'dark', 'system'].includes(theme)) {
            return res.status(400).json({
              error: 'theme must be one of: light, dark, system',
              code: 'INVALID_THEME',
            });
          }
          updates.theme = theme;
        }

        // Validate and add defaultSpace
        if (defaultSpace !== undefined) {
          if (defaultSpace !== null && typeof defaultSpace !== 'string') {
            return res.status(400).json({
              error: 'defaultSpace must be a string or null',
              code: 'INVALID_DEFAULT_SPACE',
            });
          }
          updates.defaultSpace = defaultSpace;
        }

        // Update if there are changes
        if (Object.keys(updates).length > 0) {
          await userRepository.updateUserSettings(user.id, updates);
        }

        // Get fresh settings
        const settings = await userRepository.getUserSettings(user.id);

        return res.status(200).json({
          theme: settings?.theme || 'system',
          defaultSpace: settings?.defaultSpace || null,
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (err) {
    console.error('[API /user/preferences] Error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
}

// Use optional auth so GET works for anonymous users
export default withOptionalAuth(preferencesHandler);
