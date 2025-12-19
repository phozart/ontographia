// pages/api/auth/change-password.js
// API endpoint for user self-service password change

import { userRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate new password requirements
  const passwordErrors = [];
  if (newPassword.length < 8) {
    passwordErrors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(newPassword)) {
    passwordErrors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(newPassword)) {
    passwordErrors.push('Password must contain at least one number');
  }

  if (passwordErrors.length > 0) {
    return res.status(400).json({ error: passwordErrors.join(', ') });
  }

  try {
    const result = await userRepository.changePassword(userId, currentPassword, newPassword);

    if (!result.success) {
      if (result.error === 'User not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(401).json({ error: result.error });
    }

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
}
