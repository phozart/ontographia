/**
 * Notification Service for Blueprint Studio
 *
 * Manages in-app notifications for key events such as gate reviews,
 * SLA warnings/breaches, initiative approvals/declines, PLR due dates,
 * and comment additions.
 *
 * Notification Types:
 *   gate_review_requested — Gate review requested for an initiative
 *   gate_decision_made    — Gate decision (advance, hold, recycle, decline)
 *   sla_warning           — Stage SLA at risk (>80% elapsed)
 *   sla_breach            — Stage SLA breached
 *   initiative_approved   — Initiative approved for investment
 *   initiative_declined   — Initiative declined / killed
 *   plr_due               — Post-launch review due
 *   comment_added         — New comment on an initiative
 *
 * @module lib/services/notificationService
 */

import { query } from '../pg';

// Canonical notification types
export const NOTIFICATION_TYPES = {
  GATE_REVIEW_REQUESTED: 'gate_review_requested',
  GATE_DECISION_MADE: 'gate_decision_made',
  SLA_WARNING: 'sla_warning',
  SLA_BREACH: 'sla_breach',
  INITIATIVE_APPROVED: 'initiative_approved',
  INITIATIVE_DECLINED: 'initiative_declined',
  PLR_DUE: 'plr_due',
  COMMENT_ADDED: 'comment_added',
};

// Ensure the notifications table exists
let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      link TEXT,
      metadata JSONB DEFAULT '{}',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id, is_read, created_at DESC)
  `);
  tableEnsured = true;
}

/**
 * Create a new notification
 *
 * @param {Object} params
 * @param {string} params.userId - ID of the target user (UUID or username)
 * @param {string} params.type - One of NOTIFICATION_TYPES
 * @param {string} params.title - Short notification title
 * @param {string} [params.message] - Longer description
 * @param {string} [params.link] - URL to navigate to on click
 * @param {Object} [params.metadata] - Additional structured data
 * @returns {Promise<Object>} The created notification record
 */
export async function createNotification({ userId, type, title, message, link, metadata = {} }) {
  await ensureTable();

  const sql = `
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await query(sql, [
    userId,
    type,
    title,
    message || null,
    link || null,
    JSON.stringify(metadata),
  ]);

  return result.rows[0];
}

/**
 * Get notifications for a user
 *
 * @param {string} userId - UUID of the user
 * @param {Object} [options]
 * @param {boolean} [options.unreadOnly=false] - Only return unread notifications
 * @param {number} [options.limit=20] - Max notifications to return
 * @param {number} [options.offset=0] - Pagination offset
 * @returns {Promise<Object[]>} Notifications in reverse chronological order
 */
export async function getNotifications(userId, options = {}) {
  await ensureTable();

  const { unreadOnly = false, limit = 20, offset = 0 } = options;

  let sql = 'SELECT * FROM notifications WHERE user_id = $1';
  const params = [userId];
  let paramIdx = 2;

  if (unreadOnly) {
    sql += ' AND is_read = false';
  }

  sql += ' ORDER BY created_at DESC';

  sql += ` LIMIT $${paramIdx}`;
  params.push(Math.min(parseInt(limit, 10) || 20, 100));
  paramIdx++;

  sql += ` OFFSET $${paramIdx}`;
  params.push(Math.max(parseInt(offset, 10) || 0, 0));

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Mark a single notification as read
 *
 * @param {string} notificationId - UUID of the notification
 * @param {string} userId - UUID of the user (ensures ownership)
 * @returns {Promise<Object|null>} Updated notification or null
 */
export async function markAsRead(notificationId, userId) {
  await ensureTable();

  const result = await query(
    'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
    [notificationId, userId]
  );

  return result.rows[0] || null;
}

/**
 * Mark all notifications as read for a user
 *
 * @param {string} userId - UUID of the user
 * @returns {Promise<number>} Number of notifications marked as read
 */
export async function markAllAsRead(userId) {
  await ensureTable();

  const result = await query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
    [userId]
  );

  return result.rowCount;
}

/**
 * Get count of unread notifications for a user
 *
 * @param {string} userId - UUID of the user
 * @returns {Promise<number>} Unread notification count
 */
export async function getUnreadCount(userId) {
  await ensureTable();

  const result = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId]
  );

  return parseInt(result.rows[0].count, 10);
}

/**
 * Delete a notification
 *
 * @param {string} notificationId - UUID of the notification
 * @param {string} userId - UUID of the user (ensures ownership)
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteNotification(notificationId, userId) {
  await ensureTable();

  const result = await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [notificationId, userId]
  );

  return result.rowCount > 0;
}

/**
 * Check SLA status for an initiative and create notifications if needed.
 * Fire-and-forget — callers should .catch() errors.
 *
 * @param {Object} initiative - Initiative with governance_data and stage
 * @param {string} ownerId - UUID of the initiative owner to notify
 */
export async function checkAndNotifySLA(initiative, ownerId) {
  // Import dynamically to avoid circular dependency
  const { calculateDetailedSLA } = await import('../blueprint-types');

  const slaStatus = calculateDetailedSLA(initiative);

  if (slaStatus.tier === 'at_risk') {
    await createNotification({
      userId: ownerId,
      type: NOTIFICATION_TYPES.SLA_WARNING,
      title: `SLA warning: ${initiative.name || initiative.initiative_id}`,
      message: `Stage "${initiative.stage}" is at ${slaStatus.percentUsed}% of allowed time (${slaStatus.hoursAllowed}h). Consider advancing or requesting a review.`,
      link: `/app/spaces/blueprint/discovery?initiative=${initiative.id}`,
      metadata: {
        initiativeId: initiative.id,
        initiativeDisplayId: initiative.initiative_id,
        stage: initiative.stage,
        percentUsed: slaStatus.percentUsed,
        tier: slaStatus.tier,
      },
    });
  } else if (slaStatus.tier === 'breached' || slaStatus.tier === 'breached_2x') {
    await createNotification({
      userId: ownerId,
      type: NOTIFICATION_TYPES.SLA_BREACH,
      title: `SLA breached: ${initiative.name || initiative.initiative_id}`,
      message: `Stage "${initiative.stage}" has exceeded its SLA by ${slaStatus.percentUsed - 100}%. Immediate action required.`,
      link: `/app/spaces/blueprint/discovery?initiative=${initiative.id}`,
      metadata: {
        initiativeId: initiative.id,
        initiativeDisplayId: initiative.initiative_id,
        stage: initiative.stage,
        percentUsed: slaStatus.percentUsed,
        tier: slaStatus.tier,
      },
    });
  }
}
