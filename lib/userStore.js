import bcrypt from 'bcryptjs';
import { query } from './pg';

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

export async function listUsers() {
  const res = await query('SELECT * FROM users ORDER BY created_at DESC', []);
  return res.rows.map(rowToUser);
}

export async function getUser(id) {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rowToUser(res.rows[0]);
}

export async function getUserByUsername(username) {
  const res = await query('SELECT * FROM users WHERE username = $1', [username]);
  return rowToUser(res.rows[0]);
}

export async function createUser({ id, username, password, role }) {
  const hash = bcrypt.hashSync(password, 10);
  const userId = id || username;
  await query(
    `INSERT INTO users (id, username, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING`,
    [userId, username, hash, role || 'viewer']
  );
  return getUser(userId);
}

export async function updateUser(id, updates) {
  const existing = await getUser(id);
  if (!existing) return null;
  const nextRole = updates.role || existing.role;
  const params = [nextRole, id];
  let sql = `UPDATE users SET role = $1, updated_at = now()`;
  if (updates.password) {
    const hash = bcrypt.hashSync(updates.password, 10);
    sql += `, password_hash = $3`;
    params.push(hash);
  }
  sql += ` WHERE id = $2`;
  await query(sql, params);
  return getUser(id);
}

export async function deleteUser(id) {
  const res = await query('DELETE FROM users WHERE id = $1', [id]);
  return res.rowCount > 0;
}

export async function recordLogin(username) {
  await query(
    `
    UPDATE users
    SET last_login_at = now(),
        login_count = COALESCE(login_count, 0) + 1,
        updated_at = now()
    WHERE username = $1
    `,
    [username]
  );
  const res = await query('SELECT * FROM users WHERE username = $1', [username]);
  return rowToUser(res.rows[0]);
}

export async function verifyUser(username, password) {
  const res = await query('SELECT * FROM users WHERE username = $1', [username]);
  const row = res.rows[0];
  if (!row) return null;
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return null;
  try {
    await recordLogin(username);
  } catch (err) {
    console.error('Failed to record login', err);
  }
  return rowToUser(row);
}

export async function ensureSeedAdmin() {
  try {
    const res = await query('SELECT COUNT(*) AS c FROM users', []);
    if (Number(res.rows[0].c || res.rows[0].count || 0) === 0) {
      await createUser({ username: 'admin', password: 'admin', role: 'admin', id: 'admin' });
    }
  } catch (err) {
    console.error('ensureSeedAdmin failed', err);
  }
}
