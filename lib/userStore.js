import bcrypt from 'bcryptjs';
import { getDb } from './db';

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
    loginCount: row.login_count,
  };
}

export function listUsers() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  return rows.map(rowToUser);
}

export function getUser(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return rowToUser(row);
}

export function getUserByUsername(username) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  return rowToUser(row);
}

export function createUser({ id, username, password, role }) {
  const db = getDb();
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(password, 10);
  const userId = id || username;
  db.prepare(
    `INSERT INTO users (id, username, password_hash, role, created_at, updated_at, login_count)
     VALUES (@id, @username, @password_hash, @role, @created_at, @updated_at, 0)`
  ).run({
    id: userId,
    username,
    password_hash: hash,
    role: role || 'viewer',
    created_at: now,
    updated_at: now,
  });
  return getUser(userId);
}

export function updateUser(id, updates) {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!existing) return null;
  const nextRole = updates.role || existing.role;
  let passwordClause = '';
  let passwordParams = {};
  if (updates.password) {
    passwordClause = ', password_hash = @password_hash';
    passwordParams = { password_hash: bcrypt.hashSync(updates.password, 10) };
  }
  db.prepare(
    `UPDATE users SET role = @role, updated_at = @updated_at ${passwordClause} WHERE id = @id`
  ).run({
    id,
    role: nextRole,
    updated_at: now,
    ...passwordParams,
  });
  return getUser(id);
}

export function deleteUser(id) {
  const db = getDb();
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return info.changes > 0;
}

export function recordLogin(username) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE users
     SET last_login_at = @now,
         login_count = COALESCE(login_count, 0) + 1,
         updated_at = @now
     WHERE username = @username`
  ).run({ username, now });
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  return rowToUser(row);
}

export function verifyUser(username, password) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) return null;
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return null;
  try {
    recordLogin(username);
  } catch (err) {
    console.error('Failed to record login', err);
  }
  return rowToUser(row);
}

export function ensureSeedAdmin() {
  try {
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    if (count === 0) {
      createUser({ username: 'admin', password: 'admin', role: 'admin', id: 'admin' });
    }
  } catch (err) {
    console.error('ensureSeedAdmin failed', err);
  }
}
