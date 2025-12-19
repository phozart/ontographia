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
    personalDomainId: row.personal_domain_id,
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

export async function createUser({ id, username, password, role, createPersonalDomain = true }) {
  const hash = bcrypt.hashSync(password, 10);
  const userId = id || username;

  // Insert user first
  await query(
    `INSERT INTO users (id, username, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING`,
    [userId, username, hash, role || 'viewer']
  );

  // Auto-create personal domain if requested
  if (createPersonalDomain) {
    const domainId = await createPersonalDomainForUser(userId, username);
    if (domainId) {
      await query(
        `UPDATE users SET personal_domain_id = $1 WHERE id = $2`,
        [domainId, userId]
      );
    }
  }

  return getUser(userId);
}

// Create a personal domain for a user
export async function createPersonalDomainForUser(userId, username) {
  try {
    const domainName = `${username}'s Workspace`;
    const domainNotes = `Personal workspace for ${username}`;

    // Check if domain already exists
    const existing = await query(
      `SELECT id FROM domains WHERE name = $1 AND owner = $2`,
      [domainName, userId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }

    // Create new personal domain
    const res = await query(
      `INSERT INTO domains (id, name, notes, owner)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING id`,
      [domainName, domainNotes, userId]
    );

    const domainId = res.rows[0].id;

    // Add user as owner in domain_members
    await query(
      `INSERT INTO domain_members (domain_id, user_id, role)
       VALUES ($1, $2, 'owner')
       ON CONFLICT DO NOTHING`,
      [domainId, userId]
    );

    return domainId;
  } catch (err) {
    console.error('Failed to create personal domain for user', userId, err);
    return null;
  }
}

// Update a user's personal domain reference
export async function setUserPersonalDomain(userId, domainId) {
  await query(
    `UPDATE users SET personal_domain_id = $1, updated_at = now() WHERE id = $2`,
    [domainId, userId]
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
