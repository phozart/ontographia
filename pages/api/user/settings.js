// pages/api/user/settings.js
// User settings API endpoint

import { userRepository } from '../../../lib/repositories';
import { withAuth } from '../../../lib/auth';

/**
 * Default user settings schema
 */
const DEFAULT_SETTINGS = {
  theme: 'system', // 'light' | 'dark' | 'system'
  defaultSpace: null, // Default space to open
  notifications: {
    email: true,
    inApp: true,
  },
  dashboardLayout: {},
};

/**
 * Validate settings object
 * @param {Object} settings - Settings to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateSettings(settings) {
  const errors = [];

  if (settings.theme !== undefined) {
    if (!['light', 'dark', 'system'].includes(settings.theme)) {
      errors.push('theme must be one of: light, dark, system');
    }
  }

  if (settings.notifications !== undefined) {
    if (typeof settings.notifications !== 'object') {
      errors.push('notifications must be an object');
    } else {
      if (settings.notifications.email !== undefined && typeof settings.notifications.email !== 'boolean') {
        errors.push('notifications.email must be a boolean');
      }
      if (settings.notifications.inApp !== undefined && typeof settings.notifications.inApp !== 'boolean') {
        errors.push('notifications.inApp must be a boolean');
      }
    }
  }

  if (settings.defaultSpace !== undefined && settings.defaultSpace !== null) {
    if (typeof settings.defaultSpace !== 'string') {
      errors.push('defaultSpace must be a string or null');
    }
  }

  if (settings.dashboardLayout !== undefined) {
    if (typeof settings.dashboardLayout !== 'object' || Array.isArray(settings.dashboardLayout)) {
      errors.push('dashboardLayout must be an object');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Settings handler
 * GET /api/user/settings - Get current user settings
 * PUT /api/user/settings - Update user settings
 */
async function settingsHandler(req, res) {
  const { user } = req;

  try {
    switch (req.method) {
      case 'GET': {
        // Get user settings
        const settings = await userRepository.getUserSettings(user.id);

        // Merge with defaults
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...settings,
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...settings?.notifications,
          },
        };

        return res.status(200).json({ settings: mergedSettings });
      }

      case 'PUT': {
        const updates = req.body;

        if (!updates || typeof updates !== 'object') {
          return res.status(400).json({
            error: 'Request body must be an object',
            code: 'INVALID_BODY',
          });
        }

        // Validate settings
        const validation = validateSettings(updates);
        if (!validation.valid) {
          return res.status(400).json({
            error: 'Invalid settings',
            code: 'VALIDATION_ERROR',
            details: validation.errors,
          });
        }

        // Update settings (merges with existing)
        const updatedSettings = await userRepository.updateUserSettings(user.id, updates);

        // Merge with defaults for response
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...updatedSettings,
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...updatedSettings?.notifications,
          },
        };

        return res.status(200).json({
          settings: mergedSettings,
          message: 'Settings updated successfully',
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (err) {
    console.error('[API /user/settings] Error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
}

// Require authentication
export default withAuth(settingsHandler);
